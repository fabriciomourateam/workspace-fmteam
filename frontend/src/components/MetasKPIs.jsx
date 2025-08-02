import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  Clock,
  CheckCircle,
  Award,
  AlertCircle,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { useFuncionarios } from '../hooks/useApi'
import supabaseService from '../services/supabase'

export default function MetasKPIs() {
  const [metas, setMetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [tipoVisualizacao, setTipoVisualizacao] = useState('todas') // 'todas', 'diaria', 'semanal', 'mensal'
  
  // Form data para nova meta
  const [formData, setFormData] = useState({
    funcionario_id: '',
    tipo: 'diaria',
    periodo: new Date().toISOString().split('T')[0],
    meta_horas: 480, // 8 horas em minutos
    meta_tarefas: 8
  })

  const { data: funcionarios } = useFuncionarios()

  // Carregar metas
  useEffect(() => {
    carregarMetas()
  }, [tipoVisualizacao])

  const carregarMetas = async () => {
    setLoading(true)
    try {
      const tipo = tipoVisualizacao === 'todas' ? null : tipoVisualizacao
      const metasData = await supabaseService.getMetas(null, tipo)
      
      // Calcular progresso para cada meta
      const metasComProgresso = await Promise.all(
        metasData.map(async (meta) => {
          const { dataInicio, dataFim } = calcularPeriodoMeta(meta.tipo, meta.periodo)
          const stats = await supabaseService.getEstatisticasAvancadas(
            meta.funcionario_id, 
            dataInicio, 
            dataFim
          )
          
          return {
            ...meta,
            horas_realizadas: Math.round(stats.stats.tempoTotalReal / 60), // converter para horas
            tarefas_realizadas: stats.stats.tarefasConcluidas,
            progresso_horas: (stats.stats.tempoTotalReal / 60 / (meta.meta_horas / 60)) * 100,
            progresso_tarefas: (stats.stats.tarefasConcluidas / meta.meta_tarefas) * 100
          }
        })
      )
      
      setMetas(metasComProgresso)
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularPeriodoMeta = (tipo, periodo) => {
    const data = new Date(periodo)
    let dataInicio, dataFim

    switch (tipo) {
      case 'diaria':
        dataInicio = dataFim = periodo
        break
      case 'semanal':
        const inicioSemana = new Date(data)
        inicioSemana.setDate(data.getDate() - data.getDay())
        const fimSemana = new Date(inicioSemana)
        fimSemana.setDate(inicioSemana.getDate() + 6)
        dataInicio = inicioSemana.toISOString().split('T')[0]
        dataFim = fimSemana.toISOString().split('T')[0]
        break
      case 'mensal':
        dataInicio = new Date(data.getFullYear(), data.getMonth(), 1).toISOString().split('T')[0]
        dataFim = new Date(data.getFullYear(), data.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default:
        dataInicio = dataFim = periodo
    }

    return { dataInicio, dataFim }
  }

  const criarMeta = async () => {
    try {
      await supabaseService.createMeta(formData)
      setModalOpen(false)
      setFormData({
        funcionario_id: '',
        tipo: 'diaria',
        periodo: new Date().toISOString().split('T')[0],
        meta_horas: 480,
        meta_tarefas: 8
      })
      carregarMetas()
    } catch (error) {
      console.error('Erro ao criar meta:', error)
    }
  }

  const excluirMeta = async (meta) => {
    const funcionario = funcionarios?.find(f => f.id === meta.funcionario_id)
    const tipoMeta = meta.tipo === 'diaria' ? 'diária' : meta.tipo === 'semanal' ? 'semanal' : 'mensal'
    
    if (!window.confirm(`Tem certeza que deseja excluir a meta ${tipoMeta} de ${funcionario?.nome}?\n\nData: ${new Date(meta.periodo).toLocaleDateString('pt-BR')}\nMeta: ${Math.round(meta.meta_horas / 60)}h e ${meta.meta_tarefas} tarefas`)) {
      return
    }

    try {
      await supabaseService.deleteMeta(meta.id)
      carregarMetas()
      alert('Meta excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir meta:', error)
      alert('Erro ao excluir meta: ' + error.message)
    }
  }

  const getStatusMeta = (progressoHoras, progressoTarefas) => {
    const progressoMedio = (progressoHoras + progressoTarefas) / 2
    
    if (progressoMedio >= 100) return { status: 'concluida', cor: 'bg-green-500', icone: CheckCircle }
    if (progressoMedio >= 80) return { status: 'no_prazo', cor: 'bg-blue-500', icone: TrendingUp }
    if (progressoMedio >= 50) return { status: 'atencao', cor: 'bg-yellow-500', icone: AlertCircle }
    return { status: 'atrasada', cor: 'bg-red-500', icone: TrendingDown }
  }

  const formatarTempo = (minutos) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando metas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Metas e KPIs</h2>
          <p className="text-gray-600 dark:text-gray-400">Acompanhe o progresso das metas estabelecidas</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={tipoVisualizacao} onValueChange={setTipoVisualizacao}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="diaria">Diárias</SelectItem>
              <SelectItem value="semanal">Semanais</SelectItem>
              <SelectItem value="mensal">Mensais</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>
                  Defina uma meta de produtividade para acompanhar o desempenho
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Select value={formData.funcionario_id} onValueChange={(value) => setFormData(prev => ({...prev, funcionario_id: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o funcionário" />
                    </SelectTrigger>
                    <SelectContent>
                      {funcionarios?.map(funcionario => (
                        <SelectItem key={funcionario.id} value={funcionario.id}>
                          {funcionario.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Meta</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({...prev, tipo: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <input
                    type="date"
                    value={formData.periodo}
                    onChange={(e) => setFormData(prev => ({...prev, periodo: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meta de Horas</Label>
                    <input
                      type="number"
                      value={Math.round(formData.meta_horas / 60)}
                      onChange={(e) => setFormData(prev => ({...prev, meta_horas: parseInt(e.target.value) * 60}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="24"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Meta de Tarefas</Label>
                    <input
                      type="number"
                      value={formData.meta_tarefas}
                      onChange={(e) => setFormData(prev => ({...prev, meta_tarefas: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={criarMeta}>
                    Criar Meta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Metas */}
      <div className="grid gap-6">
        {metas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta encontrada</h3>
              <p className="text-gray-500 text-center mb-4">
                Crie sua primeira meta para começar a acompanhar o desempenho
              </p>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          metas.map(meta => {
            const { status, cor, icone: StatusIcon } = getStatusMeta(meta.progresso_horas, meta.progresso_tarefas)
            const funcionario = funcionarios?.find(f => f.id === meta.funcionario_id)
            
            return (
              <Card key={meta.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: funcionario?.cor }}
                      />
                      <div>
                        <CardTitle className="text-lg">{funcionario?.nome}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Meta {meta.tipo} - {new Date(meta.periodo).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${cor} text-white`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.replace('_', ' ')}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => excluirMeta(meta)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        title="Excluir meta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Meta de Horas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Horas Trabalhadas</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {meta.horas_realizadas}h / {Math.round(meta.meta_horas / 60)}h
                        </span>
                      </div>
                      <Progress value={Math.min(meta.progresso_horas, 100)} className="h-2" />
                      <div className="text-sm text-gray-600">
                        {meta.progresso_horas.toFixed(1)}% da meta
                      </div>
                    </div>

                    {/* Meta de Tarefas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Tarefas Concluídas</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {meta.tarefas_realizadas} / {meta.meta_tarefas}
                        </span>
                      </div>
                      <Progress value={Math.min(meta.progresso_tarefas, 100)} className="h-2" />
                      <div className="text-sm text-gray-600">
                        {meta.progresso_tarefas.toFixed(1)}% da meta
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}