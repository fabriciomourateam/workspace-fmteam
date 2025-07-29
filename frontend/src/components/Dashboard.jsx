import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Clock, CheckCircle, AlertCircle, TrendingUp, Filter, Activity, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { useTheme } from '../contexts/ThemeContext'
import agendaData from '../data/agenda.json'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function Dashboard() {
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos')
  const [filtroHorario, setFiltroHorario] = useState('todos')
  const { isDark } = useTheme()

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    let agenda = agendaData.agenda
    
    if (filtroFuncionario !== 'todos') {
      agenda = agenda.filter(item => item.funcionario === filtroFuncionario)
    }
    
    if (filtroHorario !== 'todos') {
      const [inicio, fim] = filtroHorario.split('-')
      agenda = agenda.filter(item => {
        const hora = parseInt(item.horario.split(':')[0])
        return hora >= parseInt(inicio) && hora < parseInt(fim)
      })
    }
    
    return agenda
  }, [filtroFuncionario, filtroHorario])

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalTarefas = dadosFiltrados.length
    const funcionariosAtivos = new Set(dadosFiltrados.map(item => item.funcionario)).size
    const tempoTotal = dadosFiltrados.reduce((acc, item) => {
      const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
      return acc + (tarefa ? tarefa.tempoEstimado : 0)
    }, 0)
    
    const categorias = {}
    dadosFiltrados.forEach(item => {
      const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
      if (tarefa) {
        categorias[tarefa.categoria] = (categorias[tarefa.categoria] || 0) + 1
      }
    })

    return {
      totalTarefas,
      funcionariosAtivos,
      tempoTotal,
      categorias
    }
  }, [dadosFiltrados])

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    // Distribuição por funcionário
    const porFuncionario = {}
    dadosFiltrados.forEach(item => {
      porFuncionario[item.funcionario] = (porFuncionario[item.funcionario] || 0) + 1
    })

    const dadosFuncionarios = Object.entries(porFuncionario).map(([nome, quantidade]) => ({
      nome,
      quantidade,
      cor: COLORS[Object.keys(porFuncionario).indexOf(nome) % COLORS.length]
    }))

    // Distribuição por categoria
    const dadosCategorias = Object.entries(estatisticas.categorias).map(([categoria, quantidade]) => ({
      categoria,
      quantidade,
      cor: COLORS[Object.keys(estatisticas.categorias).indexOf(categoria) % COLORS.length]
    }))

    // Distribuição por horário
    const porHorario = {}
    dadosFiltrados.forEach(item => {
      const hora = parseInt(item.horario.split(':')[0])
      const periodo = hora < 12 ? 'Manhã' : hora < 18 ? 'Tarde' : 'Noite'
      porHorario[periodo] = (porHorario[periodo] || 0) + 1
    })

    const dadosHorario = Object.entries(porHorario).map(([periodo, quantidade]) => ({
      periodo,
      quantidade
    }))

    // Dados de produtividade por hora
    const produtividade = Array.from({length: 12}, (_, i) => {
      const hora = i + 8 // 8h às 19h
      const tarefasHora = dadosFiltrados.filter(item => {
        const horaItem = parseInt(item.horario.split(':')[0])
        return horaItem === hora
      }).length
      
      return {
        hora: `${hora}:00`,
        tarefas: tarefasHora,
        eficiencia: Math.min(100, tarefasHora * 20) // Simulação de eficiência
      }
    })

    return {
      dadosFuncionarios,
      dadosCategorias,
      dadosHorario,
      produtividade
    }
  }, [dadosFiltrados, estatisticas])

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <Card className="hover-lift transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 animate-scale-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${color} transition-transform duration-200 hover:scale-110`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {value}
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          {trend && (
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          )}
          {subtitle}
        </div>
      </CardContent>
    </Card>
  )

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-white font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral das atividades e performance da equipe
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
            <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover-lift">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Filtrar por funcionário" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
              <SelectItem value="todos">Todos os funcionários</SelectItem>
              {agendaData.funcionarios.map(func => (
                <SelectItem key={func.id} value={func.id}>
                  {func.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filtroHorario} onValueChange={setFiltroHorario}>
            <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover-lift">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
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
        <StatCard
          title="Total de Tarefas"
          value={estatisticas.totalTarefas}
          subtitle="tarefas agendadas"
          icon={CheckCircle}
          color="bg-blue-500"
          trend={true}
        />
        <StatCard
          title="Funcionários Ativos"
          value={estatisticas.funcionariosAtivos}
          subtitle="membros da equipe"
          icon={Users}
          color="bg-green-500"
          trend={true}
        />
        <StatCard
          title="Tempo Total"
          value={`${Math.floor(estatisticas.tempoTotal / 60)}h ${estatisticas.tempoTotal % 60}m`}
          subtitle="tempo estimado"
          icon={Clock}
          color="bg-orange-500"
        />
        <StatCard
          title="Categorias"
          value={Object.keys(estatisticas.categorias).length}
          subtitle="tipos de atividade"
          icon={Activity}
          color="bg-purple-500"
        />
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Funcionário */}
        <Card className="hover-lift transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Distribuição por Funcionário
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Número de tarefas por membro da equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficos.dadosFuncionarios}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="nome" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="quantidade" 
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="hover-lift transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Distribuição por Categoria
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Tipos de atividades mais frequentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGraficos.dadosCategorias}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  dataKey="quantidade"
                  className="hover:opacity-80 transition-opacity"
                >
                  {dadosGraficos.dadosCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {dadosGraficos.dadosCategorias.map((item, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs hover-scale transition-transform"
                  style={{ borderColor: item.cor, color: item.cor }}
                >
                  {item.categoria}: {item.quantidade}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Período */}
        <Card className="hover-lift transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Distribuição por Período
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Atividades por período do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dadosGraficos.dadosHorario}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="periodo" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="quantidade" 
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtividade por Hora */}
        <Card className="hover-lift transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Produtividade por Hora
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Distribuição de tarefas ao longo do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dadosGraficos.produtividade}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="hora" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="tarefas" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de insights */}
      <Card className="hover-lift transition-all duration-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover-scale transition-transform">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round((estatisticas.totalTarefas / agendaData.funcionarios.length) * 10) / 10}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tarefas por funcionário
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover-scale transition-transform">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(estatisticas.tempoTotal / estatisticas.funcionariosAtivos)}min
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tempo médio por pessoa
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover-scale transition-transform">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(estatisticas.categorias).length > 0 
                  ? Object.keys(estatisticas.categorias).reduce((a, b) => 
                      estatisticas.categorias[a] > estatisticas.categorias[b] ? a : b
                    )
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Categoria mais ativa
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

