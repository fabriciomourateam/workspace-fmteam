import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import supabaseService from '../services/supabase'
import Timer from './Timer'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

export default function DashboardAvancado() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('hoje')
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('todos')
  const [estatisticas, setEstatisticas] = useState(null)
  const [tarefasEmAndamento, setTarefasEmAndamento] = useState([])
  const [loading, setLoading] = useState(true)

  // Carrega dados da API
  const { data: funcionarios } = useFuncionarios()
  const { data: tarefas } = useTarefas()
  const { data: agenda, refetch: refetchAgenda } = useAgenda()

  // Calcular período
  const calcularPeriodo = (periodo) => {
    const hoje = new Date()
    let dataInicio, dataFim

    switch (periodo) {
      case 'hoje':
        dataInicio = dataFim = hoje.toISOString().split('T')[0]
        break
      case 'semana':
        const inicioSemana = new Date(hoje)
        inicioSemana.setDate(hoje.getDate() - hoje.getDay())
        const fimSemana = new Date(inicioSemana)
        fimSemana.setDate(inicioSemana.getDate() + 6)
        dataInicio = inicioSemana.toISOString().split('T')[0]
        dataFim = fimSemana.toISOString().split('T')[0]
        break
      case 'mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      default:
        dataInicio = dataFim = hoje.toISOString().split('T')[0]
    }

    return { dataInicio, dataFim }
  }

  // Carregar estatísticas
  useEffect(() => {
    const carregarEstatisticas = async () => {
      setLoading(true)
      try {
        const { dataInicio, dataFim } = calcularPeriodo(periodoSelecionado)
        const funcionarioId = funcionarioSelecionado === 'todos' ? null : funcionarioSelecionado
        
        const resultado = await supabaseService.getEstatisticasAvancadas(funcionarioId, dataInicio, dataFim)
        setEstatisticas(resultado.stats)
        
        // Filtrar tarefas em andamento
        const emAndamento = resultado.data.filter(t => t.status === 'em_andamento')
        setTarefasEmAndamento(emAndamento)
        
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarEstatisticas()
  }, [periodoSelecionado, funcionarioSelecionado])

  // Dados para gráficos
  const dadosEficiencia = useMemo(() => {
    if (!funcionarios || !estatisticas) return []
    
    return funcionarios.map(func => {
      const tarefasFuncionario = agenda?.filter(t => 
        t.funcionario_id === func.id && 
        t.status === 'concluida' && 
        t.tempo_real
      ) || []
      
      if (tarefasFuncionario.length === 0) return { nome: func.nome, eficiencia: 0 }
      
      const eficienciaMedia = tarefasFuncionario.reduce((acc, t) => {
        const tarefa = tarefas?.find(tar => tar.id === t.tarefa_id)
        if (tarefa?.tempo_estimado && t.tempo_real) {
          return acc + ((tarefa.tempo_estimado / t.tempo_real) * 100)
        }
        return acc
      }, 0) / tarefasFuncionario.length
      
      return { nome: func.nome, eficiencia: Math.round(eficienciaMedia) }
    })
  }, [funcionarios, agenda, tarefas, estatisticas])

  const dadosStatus = useMemo(() => {
    if (!estatisticas) return []
    
    return [
      { name: 'Não Iniciadas', value: estatisticas.tarefasPorStatus.nao_iniciada, color: '#6b7280' },
      { name: 'Em Andamento', value: estatisticas.tarefasPorStatus.em_andamento, color: '#2563eb' },
      { name: 'Concluídas', value: estatisticas.tarefasPorStatus.concluida, color: '#10b981' },
      { name: 'Atrasadas', value: estatisticas.tarefasPorStatus.atrasada, color: '#ef4444' }
    ]
  }, [estatisticas])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando estatísticas...</div>
  }

  const taxaConclusao = estatisticas ? (estatisticas.tarefasConcluidas / estatisticas.totalTarefas * 100) : 0
  const eficienciaGeral = estatisticas?.eficienciaMedia || 0

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Avançado</h2>
          <p className="text-gray-600 dark:text-gray-400">Métricas detalhadas de produtividade e performance</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {funcionarios?.map(funcionario => (
                <SelectItem key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaConclusao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas?.tarefasConcluidas} de {estatisticas?.totalTarefas} tarefas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eficienciaGeral.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Tempo real vs estimado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((estatisticas?.tempoTotalReal || 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((estatisticas?.tempoTotalEstimado || 0) / 60)}h estimado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Atrasadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas?.tarefasAtrasadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tarefas em andamento */}
      {tarefasEmAndamento.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Tarefas em Andamento
            </CardTitle>
            <CardDescription>
              {tarefasEmAndamento.length} tarefa{tarefasEmAndamento.length !== 1 ? 's' : ''} sendo executada{tarefasEmAndamento.length !== 1 ? 's' : ''} agora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {tarefasEmAndamento.map(agendamento => {
                const tarefa = tarefas?.find(t => t.id === agendamento.tarefa_id)
                const funcionario = funcionarios?.find(f => f.id === agendamento.funcionario_id)
                
                return (
                  <Timer
                    key={agendamento.id}
                    agendamento={agendamento}
                    tarefa={tarefa}
                    funcionario={funcionario}
                    onUpdate={refetchAgenda}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Eficiência por Funcionário */}
        <Card>
          <CardHeader>
            <CardTitle>Eficiência por Funcionário</CardTitle>
            <CardDescription>Percentual de eficiência (tempo estimado vs real)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEficiencia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Eficiência']} />
                <Bar dataKey="eficiencia" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Status das Tarefas */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Tarefas</CardTitle>
            <CardDescription>Distribuição por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}