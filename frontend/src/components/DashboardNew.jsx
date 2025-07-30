import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Filter, Activity, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { useTheme } from '../contexts/ThemeContext'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function Dashboard() {
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos')
  const [filtroHorario, setFiltroHorario] = useState('todos')
  // const { isDark } = useTheme()
  const isDark = false

  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios, error: errorFuncionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, error: errorTarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, error: errorAgenda, refetch: refetchAgenda } = useAgenda()

  // Estados de loading e error
  const isLoading = loadingFuncionarios || loadingTarefas || loadingAgenda
  const hasError = errorFuncionarios || errorTarefas || errorAgenda
  const error = errorFuncionarios || errorTarefas || errorAgenda

  // Função para recarregar todos os dados
  const refetchAll = () => {
    refetchFuncionarios()
    refetchTarefas()
    refetchAgenda()
  }

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    if (!agenda) return []
    
    let agendaFiltrada = agenda
    
    if (filtroFuncionario !== 'todos') {
      agendaFiltrada = agendaFiltrada.filter(item => item.funcionario === filtroFuncionario)
    }
    
    if (filtroHorario !== 'todos') {
      const [inicio, fim] = filtroHorario.split('-')
      agendaFiltrada = agendaFiltrada.filter(item => {
        const hora = parseInt(item.horario.split(':')[0])
        return hora >= parseInt(inicio) && hora < parseInt(fim)
      })
    }
    
    return agendaFiltrada
  }, [agenda, filtroFuncionario, filtroHorario])

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    if (!dadosFiltrados || !tarefas) {
      return {
        totalTarefas: 0,
        funcionariosAtivos: 0,
        tempoTotal: 0,
        categorias: {}
      }
    }

    console.log('Calculando estatísticas:', { dadosFiltrados: dadosFiltrados.length, tarefas: tarefas.length })

    const totalTarefas = dadosFiltrados.length
    const funcionariosAtivos = new Set(dadosFiltrados.map(item => item.funcionario || item.funcionario_id)).size
    
    const tempoTotal = dadosFiltrados.reduce((acc, item) => {
      // Suporte para diferentes estruturas de dados (Supabase vs estático)
      const tarefaId = item.tarefa || item.tarefa_id
      const tarefa = tarefas.find(t => t.id === tarefaId)
      const tempo = tarefa?.tempoEstimado || tarefa?.tempo_estimado || 0
      
      if (tempo === 0) {
        console.warn(`Tarefa não encontrada ou sem tempo: ${tarefaId}`, { tarefa })
      }
      
      return acc + tempo
    }, 0)
    
    const categorias = {}
    dadosFiltrados.forEach(item => {
      const tarefaId = item.tarefa || item.tarefa_id
      const tarefa = tarefas.find(t => t.id === tarefaId)
      if (tarefa) {
        categorias[tarefa.categoria] = (categorias[tarefa.categoria] || 0) + 1
      }
    })

    console.log('Estatísticas calculadas:', { totalTarefas, funcionariosAtivos, tempoTotal, categorias })

    return {
      totalTarefas,
      funcionariosAtivos,
      tempoTotal,
      categorias
    }
  }, [dadosFiltrados, tarefas])

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    if (!dadosFiltrados || !tarefas || !funcionarios) return { categorias: [], funcionarios: [] }

    // Dados por categoria
    const categorias = Object.entries(estatisticas.categorias).map(([categoria, count]) => ({
      name: categoria,
      value: count,
      color: COLORS[Object.keys(estatisticas.categorias).indexOf(categoria) % COLORS.length]
    }))

    // Dados por funcionário
    const funcionariosData = {}
    dadosFiltrados.forEach(item => {
      const funcionario = funcionarios.find(f => f.id === item.funcionario)
      if (funcionario) {
        funcionariosData[funcionario.nome] = (funcionariosData[funcionario.nome] || 0) + 1
      }
    })

    const funcionariosGrafico = Object.entries(funcionariosData).map(([nome, count]) => ({
      name: nome,
      tarefas: count
    }))

    return { categorias, funcionarios: funcionariosGrafico }
  }, [dadosFiltrados, tarefas, funcionarios, estatisticas])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <Loading message="Carregando dados..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        </div>
        <ErrorMessage error={error} onRetry={refetchAll} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Visão geral das atividades da equipe</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os funcionários</SelectItem>
              {funcionarios?.map(funcionario => (
                <SelectItem key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroHorario} onValueChange={setFiltroHorario}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por horário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo o dia</SelectItem>
              <SelectItem value="8-12">Manhã (8h-12h)</SelectItem>
              <SelectItem value="12-18">Tarde (12h-18h)</SelectItem>
              <SelectItem value="18-22">Noite (18h-22h)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalTarefas}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              tarefas agendadas
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.funcionariosAtivos}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              de {funcionarios?.length || 0} funcionários
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas.tempoTotal >= 60 
                ? `${Math.floor(estatisticas.tempoTotal / 60)}h ${estatisticas.tempoTotal % 60}m`
                : `${estatisticas.tempoTotal}m`
              }
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {estatisticas.tempoTotal} minutos totais
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(estatisticas.categorias).length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              tipos de atividade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
            <CardDescription>Tarefas agrupadas por tipo de atividade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGraficos.categorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosGraficos.categorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Funcionários */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Tarefas por Funcionário</CardTitle>
            <CardDescription>Distribuição de carga de trabalho</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficos.funcionarios}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tarefas" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard