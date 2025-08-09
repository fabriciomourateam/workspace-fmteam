import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Save, X, Settings, Users, Calendar, FileText, Clock } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { useNotifications } from '../contexts/NotificationContext'
import { formatarHorarioIntervalo } from '../utils/timeUtils'
import dataService from '../services/dataService'

function Admin() {
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoModal, setTipoModal] = useState('') // 'funcionario', 'tarefa', 'agendamento'
  const [itemEditando, setItemEditando] = useState(null)
  const { addNotification } = useNotifications()

  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios, error: errorFuncionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, error: errorTarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, error: errorAgenda, refetch: refetchAgenda } = useAgenda()

  // Estados de loading e error
  const isLoading = loadingFuncionarios || loadingTarefas || loadingAgenda
  
  // Debug logs
  console.log('Admin Debug:', {
    funcionarios: funcionarios?.length,
    tarefas: tarefas?.length,
    agenda: agenda?.length,
    isLoading,
    loadingFuncionarios,
    loadingTarefas,
    loadingAgenda
  })

  const abrirModal = (tipo, item = null) => {
    setTipoModal(tipo)
    setItemEditando(item)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setTipoModal('')
    setItemEditando(null)
  }

  // Componente para gerenciar funcionários
  const GerenciarFuncionarios = () => {
    const [formData, setFormData] = useState({
      id: '',
      nome: '',
      horarioInicio: '',
      horarioFim: '',
      cor: '#2563eb'
    })

    useEffect(() => {
      if (itemEditando) {
        setFormData({
          id: itemEditando.id,
          nome: itemEditando.nome,
          horarioInicio: itemEditando.horario_inicio || itemEditando.horarioInicio,
          horarioFim: itemEditando.horario_fim || itemEditando.horarioFim,
          cor: itemEditando.cor
        })
      } else {
        setFormData({
          id: '',
          nome: '',
          horarioInicio: '',
          horarioFim: '',
          cor: '#2563eb'
        })
      }
    }, [itemEditando])

    const salvarFuncionario = async () => {
      try {
        const funcionarioData = {
          id: formData.id,
          nome: formData.nome,
          horario_inicio: formData.horarioInicio,
          horario_fim: formData.horarioFim,
          cor: formData.cor
        }

        if (itemEditando) {
          await dataService.updateFuncionario(itemEditando.id, funcionarioData)
        } else {
          await dataService.createFuncionario(funcionarioData)
        }

        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: `Funcionário ${itemEditando ? 'atualizado' : 'adicionado'} com sucesso`
        })
        fecharModal()
        refetchFuncionarios()
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: error.message || 'Erro ao salvar funcionário'
        })
      }
    }

    const excluirFuncionario = async (funcionarioId) => {
      if (!confirm('Tem certeza que deseja excluir este funcionário? Todos os agendamentos dele serão removidos.')) {
        return
      }

      try {
        await dataService.deleteFuncionario(funcionarioId)
        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: 'Funcionário excluído com sucesso'
        })
        refetchFuncionarios()
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: error.message || 'Erro ao excluir funcionário'
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Funcionários</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {funcionarios?.length || 0} membros cadastrados
            </p>
          </div>
          <Button 
            onClick={() => {
              console.log('Botão clicado!')
              abrirModal('funcionario')
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Funcionário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionarios?.map(funcionario => (
            <Card key={funcionario.id} className="group bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: funcionario.cor }}
                    >
                      {funcionario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {funcionario.nome}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {funcionario.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => abrirModal('funcionario', funcionario)}
                      className="hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => excluirFuncionario(funcionario.id)}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {(funcionario.horario_inicio === 'flexible' || funcionario.horarioInicio === 'flexible')
                      ? 'Horário Flexível' 
                      : `${funcionario.horario_inicio || funcionario.horarioInicio} - ${funcionario.horario_fim || funcionario.horarioFim}`
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de funcionário */}
        <Dialog open={modalAberto && tipoModal === 'funcionario'} onOpenChange={fecharModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {itemEditando ? 'Editar Funcionário' : 'Adicionar Funcionário'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="funcionario-id">ID do Funcionário</Label>
                <Input
                  id="funcionario-id"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  disabled={!!itemEditando}
                  placeholder="ex: joao_silva"
                />
              </div>
              <div>
                <Label htmlFor="funcionario-nome">Nome</Label>
                <Input
                  id="funcionario-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funcionario-inicio">Horário Início</Label>
                  <Input
                    id="funcionario-inicio"
                    type="time"
                    value={formData.horarioInicio}
                    onChange={(e) => setFormData({...formData, horarioInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="funcionario-fim">Horário Fim</Label>
                  <Input
                    id="funcionario-fim"
                    type="time"
                    value={formData.horarioFim}
                    onChange={(e) => setFormData({...formData, horarioFim: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="funcionario-cor">Cor</Label>
                <Input
                  id="funcionario-cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({...formData, cor: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={fecharModal}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={salvarFuncionario}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Componente para gerenciar tarefas
  const GerenciarTarefas = () => {
    const [formData, setFormData] = useState({
      id: '',
      nome: '',
      categoria: '',
      tempoEstimado: 30,
      descricao: '',
      prioridade: 'media'
    })

    useEffect(() => {
      if (itemEditando) {
        setFormData({
          id: itemEditando.id,
          nome: itemEditando.nome,
          categoria: itemEditando.categoria,
          tempoEstimado: itemEditando.tempo_estimado || itemEditando.tempoEstimado,
          descricao: itemEditando.descricao,
          prioridade: itemEditando.prioridade
        })
      } else {
        setFormData({
          id: '',
          nome: '',
          categoria: '',
          tempoEstimado: 30,
          descricao: '',
          prioridade: 'media'
        })
      }
    }, [itemEditando])

    const salvarTarefa = async () => {
      try {
        const tarefaData = {
          id: formData.id,
          nome: formData.nome,
          categoria: formData.categoria,
          tempo_estimado: formData.tempoEstimado,
          descricao: formData.descricao,
          prioridade: formData.prioridade
        }

        if (itemEditando) {
          await dataService.updateTarefa(itemEditando.id, tarefaData)
        } else {
          await dataService.createTarefa(tarefaData)
        }

        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: `Tarefa ${itemEditando ? 'atualizada' : 'adicionada'} com sucesso`
        })
        fecharModal()
        refetchTarefas()
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: error.message || 'Erro ao salvar tarefa'
        })
      }
    }

    const excluirTarefa = async (tarefaId) => {
      if (!confirm('Tem certeza que deseja excluir esta tarefa? Todos os agendamentos dela serão removidos.')) {
        return
      }

      try {
        await dataService.deleteTarefa(tarefaId)
        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: 'Tarefa excluída com sucesso'
        })
        refetchTarefas()
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: error.message || 'Erro ao excluir tarefa'
        })
      }
    }

    const categorias = ['gestao', 'atendimento', 'marketing', 'engajamento', 'conteudo', 'produto', 'interno']
    const prioridades = ['baixa', 'media', 'alta']

    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Tarefas</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {tarefas?.length || 0} atividades cadastradas
            </p>
          </div>
          <Button 
            onClick={() => {
              console.log('Botão tarefa clicado!')
              abrirModal('tarefa')
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tarefas?.map(tarefa => (
            <Card key={tarefa.id} className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {tarefa.nome}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {tarefa.id}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => abrirModal('tarefa', tarefa)}
                      className="hover:bg-emerald-50 hover:text-emerald-600 transition-colors rounded-lg p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => excluirTarefa(tarefa.id)}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      className="capitalize px-2 py-1 rounded-lg text-xs font-medium"
                      style={{ 
                        backgroundColor: tarefa.categoria === 'gestao' ? '#3b82f6' : 
                                        tarefa.categoria === 'atendimento' ? '#10b981' : 
                                        tarefa.categoria === 'marketing' ? '#f59e0b' : 
                                        tarefa.categoria === 'engajamento' ? '#f43f5e' : 
                                        tarefa.categoria === 'conteudo' ? '#8b5cf6' : 
                                        tarefa.categoria === 'produto' ? '#06b6d4' : '#ec4899',
                        color: 'white'
                      }}
                    >
                      {tarefa.categoria}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`capitalize px-2 py-1 rounded-lg text-xs font-medium ${
                        tarefa.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                        tarefa.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}
                    >
                      {tarefa.prioridade}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tarefa.tempo_estimado || tarefa.tempoEstimado} minutos
                    </span>
                  </div>
                  
                  {tarefa.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {tarefa.descricao}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de tarefa */}
        <Dialog open={modalAberto && tipoModal === 'tarefa'} onOpenChange={fecharModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {itemEditando ? 'Editar Tarefa' : 'Adicionar Tarefa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tarefa-id">ID da Tarefa</Label>
                <Input
                  id="tarefa-id"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  disabled={!!itemEditando}
                  placeholder="ex: nova_tarefa"
                />
              </div>
              <div>
                <Label htmlFor="tarefa-nome">Nome da Tarefa</Label>
                <Input
                  id="tarefa-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome da tarefa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tarefa-categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tarefa-prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => setFormData({...formData, prioridade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map(pri => (
                        <SelectItem key={pri} value={pri} className="capitalize">
                          {pri}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="tarefa-tempo">Tempo Estimado (minutos)</Label>
                <Input
                  id="tarefa-tempo"
                  type="number"
                  value={formData.tempoEstimado}
                  onChange={(e) => setFormData({...formData, tempoEstimado: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="tarefa-descricao">Descrição</Label>
                <Textarea
                  id="tarefa-descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição da tarefa"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={fecharModal}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={salvarTarefa}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Componente para gerenciar agenda
  const GerenciarAgenda = () => {
    const [formData, setFormData] = useState({
      horario: '',
      funcionario: '',
      tarefa: ''
    })

    const adicionarAgendamento = async () => {
      try {
        const agendamentoData = {
          horario: formData.horario,
          funcionario_id: formData.funcionario,
          tarefa_id: formData.tarefa,
          data: new Date().toISOString().split('T')[0] // Data de hoje
        }

        await dataService.createAgendamento(agendamentoData)
        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: 'Agendamento adicionado com sucesso'
        })
        setFormData({ horario: '', funcionario: '', tarefa: '' })
        refetchAgenda()
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: error.message || 'Erro ao adicionar agendamento'
        })
      }
    }

    const excluirAgendamento = async (agendamentoId) => {
      if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
        return
      }

      try {
        await dataService.deleteAgendamento(agendamentoId)
        addNotification({
          type: 'success',
          title: 'Sucesso',
          message: 'Agendamento excluído com sucesso'
        })
        refetchAgenda()
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erro',
          message: error.message || 'Erro ao excluir agendamento'
        })
      }
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Agenda</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {agenda?.length || 0} agendamentos ativos
          </p>
        </div>
        
        {/* Formulário para adicionar agendamento */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Adicionar Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="agenda-horario">Horário</Label>
                <Input
                  id="agenda-horario"
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="agenda-funcionario">Funcionário</Label>
                <Select value={formData.funcionario} onValueChange={(value) => setFormData({...formData, funcionario: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
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
              <div>
                <Label htmlFor="agenda-tarefa">Tarefa</Label>
                <Select value={formData.tarefa} onValueChange={(value) => setFormData({...formData, tarefa: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tarefas?.map(tarefa => (
                      <SelectItem key={tarefa.id} value={tarefa.id}>
                        {tarefa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    console.log('Botão agendamento clicado!')
                    adicionarAgendamento()
                  }} 
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de agendamentos */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Agendamentos Atuais ({agenda?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agenda?.map((item, index) => {
                const funcionario = funcionarios?.find(f => f.id === item.funcionario)
                const tarefa = tarefas?.find(t => t.id === item.tarefa)
                
                return (
                  <div key={item.id || index} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : 'Hoje'}
                        </Badge>
                        <Badge className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {formatarHorarioIntervalo(item.horario)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: funcionario?.cor }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {funcionario?.nome || item.funcionario_nome}
                        </span>
                      </div>
                      <span className="text-gray-400">→</span>
                      <Badge className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-medium">
                        {tarefa?.nome || item.tarefa_nome}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => excluirAgendamento(item.id || index)}
                      className="opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
              
              {(!agenda || agenda.length === 0) && (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Nenhum agendamento encontrado
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Remover o loading para debug - sempre renderizar a interface
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
  //         <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Carregando dados...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header moderno e limpo */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-2xl relative overflow-hidden">
        {/* Padrão de fundo sutil */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
        </div>
        
        <div className="relative z-10 px-6 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
                <p className="text-blue-100 text-lg font-medium mt-1">
                  Gerencie funcionários, tarefas e agendamentos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Debug info */}
        <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
          <p><strong>Debug Info:</strong></p>
          <p>Funcionários: {funcionarios?.length || 0} | Loading: {loadingFuncionarios ? 'Sim' : 'Não'}</p>
          <p>Tarefas: {tarefas?.length || 0} | Loading: {loadingTarefas ? 'Sim' : 'Não'}</p>
          <p>Agenda: {agenda?.length || 0} | Loading: {loadingAgenda ? 'Sim' : 'Não'}</p>
        </div>
        
        <Tabs defaultValue="funcionarios" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-md border-0 shadow-lg rounded-2xl p-2 h-auto mb-8">
            <TabsTrigger 
              value="funcionarios" 
              className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Users className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Funcionários</div>
                <div className="text-xs opacity-75">Gerenciar equipe</div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="tarefas" 
              className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <FileText className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Tarefas</div>
                <div className="text-xs opacity-75">Gerenciar atividades</div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="agenda" 
              className="flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Calendar className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Agenda</div>
                <div className="text-xs opacity-75">Gerenciar horários</div>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="funcionarios">
            <GerenciarFuncionarios />
          </TabsContent>
          
          <TabsContent value="tarefas">
            <GerenciarTarefas />
          </TabsContent>
          
          <TabsContent value="agenda">
            <GerenciarAgenda />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Admin