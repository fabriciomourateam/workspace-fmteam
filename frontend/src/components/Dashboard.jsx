import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Clock, CheckCircle, TrendingUp, Filter, Activity, BarChart3, Sparkles, Timer, Target, Award, ArrowUp } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
// import { useTheme } from '../contexts/ThemeContext'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16']

// Componente de animação para números aprimorado
const AnimatedNumber = ({ value, duration = 1500, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    let start = 0
    const end = parseInt(value) || 0
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        setIsAnimating(false)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, duration])

  return (
    <span className={`transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
      {displayValue}{suffix}
    </span>
  )
}

function Dashboard() {
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos')
  const [filtroHorario, setFiltroHorario] = useState('todos')
  // const { isDark } = useTheme()
  const isDark = false // Fallback para tema claro

  // Carrega dados reais da API
  const { data: funcionarios, loading: loadingFuncionarios, error: errorFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, error: errorTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, error: errorAgenda } = useAgenda()

  // Estados de loading e error
  const isLoading = loadingFuncionarios || loadingTarefas || loadingAgenda
  const hasError = errorFuncionarios || errorTarefas || errorAgenda
  const error = errorFuncionarios || errorTarefas || errorAgenda

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
    if (!dadosFiltrados || !tarefas) return { totalTarefas: 0, funcionariosAtivos: 0, tempoTotal: 0, categorias: {} }
    
    const totalTarefas = dadosFiltrados.length
    const funcionariosAtivos = new Set(dadosFiltrados.map(item => item.funcionario)).size
    const tempoTotal = dadosFiltrados.reduce((acc, item) => {
      const tarefa = tarefas.find(t => t.id === item.tarefa)
      return acc + (tarefa ? (tarefa.tempo_estimado || tarefa.tempoEstimado || 30) : 30)
    }, 0)

    const categorias = {}
    dadosFiltrados.forEach(item => {
      const tarefa = tarefas.find(t => t.id === item.tarefa)
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
  }, [dadosFiltrados, tarefas])

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    if (!dadosFiltrados || !funcionarios) return { dadosFuncionarios: [], dadosCategorias: [], dadosHorario: [], produtividade: [] }
    
    // Distribuição por funcionário
    const porFuncionario = {}
    dadosFiltrados.forEach(item => {
      const funcionario = funcionarios.find(f => f.id === item.funcionario)
      const nomeFuncionario = funcionario ? funcionario.nome : item.funcionario
      porFuncionario[nomeFuncionario] = (porFuncionario[nomeFuncionario] || 0) + 1
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
    const produtividade = Array.from({ length: 12 }, (_, i) => {
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
  }, [dadosFiltrados, estatisticas, funcionarios])

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, trend, delay = 0, change = null }) => (
    <Card className={`group relative overflow-hidden transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1 border-0 ${gradient} backdrop-blur-sm animate-pulse`}
      style={{ animationDelay: `${delay}ms` }}>
      {/* Efeito de brilho animado melhorado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-out"></div>

      {/* Padrão de fundo decorativo aprimorado */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full translate-y-14 -translate-x-14 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full -translate-x-8 -translate-y-8 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <div className="space-y-2">
          <CardTitle className="text-sm font-semibold text-white/95 tracking-wide uppercase letter-spacing-wider">
            {title}
          </CardTitle>
          {trend && change && (
            <div className="flex items-center text-xs text-white/80 bg-white/10 rounded-full px-2 py-1 backdrop-blur-sm">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span className="font-medium">{change} vs mês anterior</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md transition-all duration-500 group-hover:scale-125 group-hover:bg-white/30 group-hover:rotate-12 shadow-xl">
          <Icon className="h-7 w-7 text-white drop-shadow-lg" />
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
          <AnimatedNumber
            value={typeof value === 'string' ? value.replace(/\D/g, '') : value}
            suffix={typeof value === 'string' && value.includes('h') ? 'h' : typeof value === 'string' && value.includes('m') ? 'm' : ''}
          />
        </div>
        <p className="text-sm text-white/85 font-semibold leading-relaxed">
          {subtitle}
        </p>
      </CardContent>

      {/* Borda inferior com gradiente aprimorada */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-white/30 via-white/60 to-white/30 group-hover:h-2 transition-all duration-300"></div>

      {/* Efeito de partículas */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-4 left-4 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
      </div>
    </Card>
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading />
        </div>
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorMessage message={error?.message || 'Erro ao carregar dados do dashboard'} />
        </div>
      </div>
    )
  }

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
    <div className="space-y-10 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/60 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30 -m-6 p-6 relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-emerald-400/5 to-teal-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>


      {/* Header premium com design igual ao cronograma */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 border-0 shadow-2xl rounded-3xl">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-40 translate-x-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-30 -translate-x-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <CardHeader className="relative z-10 p-8">
          <div className="space-y-4">
            {/* Linha 1: Título e informações */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-xl">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-lg flex items-center gap-3">
                      Dashboard
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </h2>
                    <p className="text-blue-100 text-lg font-medium mt-1">
                      Visão geral das atividades e performance da equipe
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white/90" />
                    <span className="text-white font-semibold">
                      {estatisticas.totalTarefas} tarefas
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                    <Users className="w-5 h-5 text-white/90" />
                    <span className="text-white font-semibold">
                      {estatisticas.funcionariosAtivos} funcionários
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 px-3 py-1 rounded-full font-semibold">
                    {Math.floor(estatisticas.tempoTotal / 60)}h {estatisticas.tempoTotal % 60}m
                  </Badge>
                </div>
              </div>
              
              {/* Filtros premium */}
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-2 shadow-lg">
                <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
                  <SelectTrigger className="w-56 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-xl">
                    <Filter className="h-4 w-4 mr-2 text-white/90" />
                    <SelectValue placeholder="Filtrar por funcionário" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl">
                    <SelectItem value="todos">Todos os funcionários</SelectItem>
                    {funcionarios?.map(func => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroHorario} onValueChange={setFiltroHorario}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-xl">
                    <Clock className="h-4 w-4 mr-2 text-white/90" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl shadow-xl">
                    <SelectItem value="todos">Todo o dia</SelectItem>
                    <SelectItem value="8-12">Manhã (8h-12h)</SelectItem>
                    <SelectItem value="12-18">Tarde (12h-18h)</SelectItem>
                    <SelectItem value="18-22">Noite (18h-22h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de estatísticas com gradientes premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Tarefas"
          value={estatisticas.totalTarefas}
          subtitle="tarefas agendadas hoje"
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-500/25"
          trend={true}
          change="+12%"
          delay={0}
        />
        <StatCard
          title="Funcionários Ativos"
          value={estatisticas.funcionariosAtivos}
          subtitle="membros da equipe"
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-blue-500/25"
          trend={true}
          change="+8%"
          delay={150}
        />
        <StatCard
          title="Tempo Total"
          value={`${Math.floor(estatisticas.tempoTotal / 60)}h ${estatisticas.tempoTotal % 60}m`}
          subtitle="tempo estimado"
          icon={Timer}
          gradient="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-amber-500/25"
          trend={true}
          change="+15%"
          delay={300}
        />
        <StatCard
          title="Categorias"
          value={Object.keys(estatisticas.categorias).length}
          subtitle="tipos de atividade"
          icon={Target}
          gradient="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 shadow-purple-500/25"
          trend={true}
          change="+5%"
          delay={450}
        />
      </div>

      {/* Gráficos principais com design premium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Funcionário */}
        <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-0 shadow-lg rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10"></div>

          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-xl font-bold">
                  Distribuição por Funcionário
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Número de tarefas por membro da equipe
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dadosGraficos.dadosFuncionarios} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.4} />
                <XAxis
                  dataKey="nome"
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={13}
                  fontWeight={500}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={13}
                  fontWeight={500}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="quantidade"
                  fill="url(#barGradientNew)"
                  radius={[8, 8, 0, 0]}
                  className="hover:opacity-90 transition-all duration-300"
                />
                <defs>
                  <linearGradient id="barGradientNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-0 shadow-lg rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-rose-50/40 dark:from-purple-900/20 dark:via-pink-900/15 dark:to-rose-900/10"></div>

          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-xl font-bold">
                  Distribuição por Categoria
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Tipos de atividades mais frequentes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={dadosGraficos.dadosCategorias}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  dataKey="quantidade"
                  className="hover:opacity-90 transition-all duration-300"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth={2}
                >
                  {dadosGraficos.dadosCategorias.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.cor}
                      className="hover:brightness-110 transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-8">
              {dadosGraficos.dadosCategorias.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-sm transition-all duration-300 hover:scale-110 hover:shadow-lg px-4 py-2 rounded-full font-medium"
                  style={{
                    borderColor: item.cor,
                    color: item.cor,
                    backgroundColor: `${item.cor}15`,
                    borderWidth: '2px'
                  }}
                >
                  {item.categoria}: {item.quantidade}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundários com design premium */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Período */}
        <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-0 shadow-lg rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/40 dark:from-emerald-900/20 dark:via-teal-900/15 dark:to-cyan-900/10"></div>

          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-xl font-bold">
                  Distribuição por Período
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Atividades por período do dia
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dadosGraficos.dadosHorario} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.4} />
                <XAxis
                  dataKey="periodo"
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={13}
                  fontWeight={500}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={13}
                  fontWeight={500}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#10b981"
                  fill="url(#areaGradientNew)"
                  strokeWidth={4}
                  className="hover:opacity-90 transition-opacity duration-300"
                />
                <defs>
                  <linearGradient id="areaGradientNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtividade por Hora */}
        <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 border-0 shadow-lg rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-red-50/40 dark:from-amber-900/20 dark:via-orange-900/15 dark:to-red-900/10"></div>

          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

          <CardHeader className="relative z-10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-gray-900 dark:text-white text-xl font-bold">
                  Produtividade por Hora
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Distribuição de tarefas ao longo do dia
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dadosGraficos.produtividade} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.4} />
                <XAxis
                  dataKey="hora"
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={13}
                  fontWeight={500}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize={13}
                  fontWeight={500}
                  tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tarefas"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{
                    fill: '#f59e0b',
                    strokeWidth: 3,
                    r: 6,
                    className: 'hover:r-8 transition-all duration-300'
                  }}
                  activeDot={{
                    r: 10,
                    stroke: '#f59e0b',
                    strokeWidth: 4,
                    fill: '#fff',
                    className: 'animate-pulse'
                  }}
                  className="hover:opacity-90 transition-opacity duration-300"
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de insights com design ultra premium */}
      <Card className="relative overflow-hidden transition-all duration-700 hover:shadow-3xl hover:-translate-y-3 bg-gradient-to-br from-slate-50 via-blue-50/80 to-indigo-100/90 dark:from-slate-900 dark:via-blue-900/30 dark:to-indigo-900/40 border-0 shadow-2xl rounded-3xl animate-fade-in-up">
        {/* Padrão de fundo decorativo melhorado */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full -translate-y-60 translate-x-60 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full translate-y-40 -translate-x-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full -translate-x-30 -translate-y-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Efeito de brilho global */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

        <CardHeader className="relative z-10 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Insights da Equipe
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg font-medium">
                Métricas principais de performance e produtividade
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 backdrop-blur-md bg-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border border-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-pulse">
                <Users className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-3">
                <AnimatedNumber value={funcionarios?.length ? Math.round((estatisticas.totalTarefas / funcionarios.length) * 10) / 10 : 0} />
              </div>
              <div className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tarefas por funcionário
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                Distribuição equilibrada
              </div>
              <div className="mt-4 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div className="group text-center p-8 backdrop-blur-md bg-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border border-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-pulse">
                <Timer className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mb-3">
                <AnimatedNumber value={Math.round(estatisticas.tempoTotal / estatisticas.funcionariosAtivos)} suffix="min" />
              </div>
              <div className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                Tempo médio por pessoa
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                Carga de trabalho otimizada
              </div>
              <div className="mt-4 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse" style={{ width: '72%' }}></div>
              </div>
            </div>

            <div className="group text-center p-8 backdrop-blur-md bg-white/10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 border border-white/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 animate-pulse">
                <Award className="h-10 w-10 text-white" />
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mb-3 truncate">
                {Object.keys(estatisticas.categorias).length > 0
                  ? Object.keys(estatisticas.categorias).reduce((a, b) =>
                    estatisticas.categorias[a] > estatisticas.categorias[b] ? a : b
                  )
                  : 'N/A'
                }
              </div>
              <div className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2">
                Categoria mais ativa
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-500 font-medium">
                Foco principal da equipe
              </div>
              <div className="mt-4 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-pulse" style={{ width: '90%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Borda inferior decorativa */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 opacity-60 rounded-b-3xl"></div>
      </Card>
    </div>
  )
}

export default Dashboard

