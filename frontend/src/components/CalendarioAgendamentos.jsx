import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  User, 
  Users,
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Sparkles,
  CalendarDays,
  Timer,
  CheckCircle2
} from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { formatarHorarioIntervalo } from '../utils/timeUtils'
import AgendamentoForm from './forms/AgendamentoForm'
import supabaseService from '../services/supabase'

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CalendarioAgendamentos() {
  const [mesAtual, setMesAtual] = useState(new Date())
  const [dataSelecionada, setDataSelecionada] = useState(null)
  const [agendamentoFormOpen, setAgendamentoFormOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState(null)
  const [detalheDiaOpen, setDetalheDiaOpen] = useState(false)
  const [funcionarioFiltro, setFuncionarioFiltro] = useState('todos')
  const [mostrarDetalhes, setMostrarDetalhes] = useState(true)

  // Carrega dados da API
  const { data: funcionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, refetch: refetchAgenda } = useAgenda()

  const showSuccess = (message) => alert('Sucesso: ' + message)
  const showError = (message) => alert('Erro: ' + message)

  // Função para recarregar todos os dados
  const refetchAll = () => {
    refetchFuncionarios()
    refetchTarefas()
    refetchAgenda()
  }

  // Gerar dias do calendário
  const diasDoCalendario = useMemo(() => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const primeiroDiaSemana = primeiroDia.getDay()
    
    const dias = []
    
    // Dias do mês anterior (para completar a primeira semana)
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const dia = new Date(ano, mes, -i)
      dias.push({
        data: dia,
        dataStr: dia.toISOString().split('T')[0],
        dia: dia.getDate(),
        mesAtual: false
      })
    }
    
    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const data = new Date(ano, mes, dia)
      dias.push({
        data: data,
        dataStr: data.toISOString().split('T')[0],
        dia: dia,
        mesAtual: true
      })
    }
    
    // Dias do próximo mês (para completar a última semana)
    const diasRestantes = 42 - dias.length // 6 semanas * 7 dias
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const data = new Date(ano, mes + 1, dia)
      dias.push({
        data: data,
        dataStr: data.toISOString().split('T')[0],
        dia: dia,
        mesAtual: false
      })
    }
    
    return dias
  }, [mesAtual])

  // Organizar agendamentos por data e funcionário
  const agendamentosPorData = useMemo(() => {
    if (!agenda || !funcionarios || !tarefas) return {}
    
    const organizados = {}
    
    agenda.forEach(item => {
      const data = item.data || new Date().toISOString().split('T')[0]
      const funcionario = funcionarios.find(f => f.id === item.funcionario)
      const tarefa = tarefas.find(t => t.id === item.tarefa)
      
      if (!organizados[data]) {
        organizados[data] = {
          total: 0,
          porFuncionario: {},
          agendamentos: []
        }
      }
      
      if (!organizados[data].porFuncionario[item.funcionario]) {
        organizados[data].porFuncionario[item.funcionario] = {
          funcionario: funcionario,
          tarefas: []
        }
      }
      
      const agendamentoCompleto = {
        ...item,
        funcionarioInfo: funcionario,
        tarefaInfo: tarefa
      }
      
      organizados[data].total++
      organizados[data].porFuncionario[item.funcionario].tarefas.push(agendamentoCompleto)
      organizados[data].agendamentos.push(agendamentoCompleto)
    })
    
    return organizados
  }, [agenda, funcionarios, tarefas])

  // Navegar entre meses
  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))
  }

  const proximoMes = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))
  }

  const irParaHoje = () => {
    setMesAtual(new Date())
  }

  // Handlers para agendamentos
  const handleDiaClick = (diaInfo) => {
    setDataSelecionada(diaInfo.dataStr)
    
    // Se há agendamentos no dia, mostrar detalhes
    if (agendamentosPorData[diaInfo.dataStr]?.total > 0) {
      setDetalheDiaOpen(true)
    } else {
      // Se não há agendamentos, abrir formulário diretamente
      setEditingAgendamento(null)
      setAgendamentoFormOpen(true)
    }
  }

  const handleNovoAgendamento = (data = null) => {
    setDataSelecionada(data || dataSelecionada)
    setEditingAgendamento(null)
    setAgendamentoFormOpen(true)
  }

  const handleSaveAgendamento = async (agendamentoData) => {
    try {
      console.log('Salvando agendamento:', agendamentoData)
      
      if (editingAgendamento) {
        await supabaseService.updateAgendamento(editingAgendamento.id, agendamentoData)
      } else {
        await supabaseService.createAgendamento(agendamentoData)
      }
      
      refetchAgenda()
      showSuccess('Agendamento salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
      showError('Erro ao salvar agendamento: ' + error.message)
    }
  }

  const handleDeleteAgendamento = async (agendamento) => {
    if (!window.confirm(`Tem certeza que deseja excluir o agendamento de "${agendamento.tarefaInfo?.nome}" às ${formatarHorarioIntervalo(agendamento.horario)}?`)) {
      return
    }

    try {
      await supabaseService.deleteAgendamento(agendamento.id)
      refetchAgenda()
      showSuccess('Agendamento excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
      showError('Erro ao excluir agendamento: ' + error.message)
    }
  }

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 border-0 shadow-2xl rounded-3xl">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-40 translate-x-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-30 -translate-x-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <CardHeader className="relative z-10 p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-xl">
                  <CalendarDays className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black text-white tracking-tight drop-shadow-lg flex items-center gap-3">
                    Calendário
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </CardTitle>
                  <p className="text-blue-100 text-lg font-medium mt-1">
                    Gerencie seus agendamentos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-2 shadow-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={irParaHoje}
                  className="text-white hover:bg-white/20 rounded-xl px-4 py-2 font-medium"
                >
                  Hoje
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={mesAnterior}
                  className="text-white hover:bg-white/20 rounded-xl h-10 w-10 p-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="font-bold text-white min-w-[160px] text-center text-lg px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={proximoMes}
                  className="text-white hover:bg-white/20 rounded-xl h-10 w-10 p-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Controles premium de filtro e visualização */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 text-white/90">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-semibold">Funcionários:</span>
                </div>
                
                {/* Botões de Funcionários Premium */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFuncionarioFiltro('todos')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 ${
                      funcionarioFiltro === 'todos' 
                        ? 'bg-white text-blue-700 shadow-lg font-semibold' 
                        : 'text-white hover:bg-white/20 border border-white/30'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Todos
                  </Button>
                  
                  {funcionarios?.map(funcionario => (
                    <Button
                      key={funcionario.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => setFuncionarioFiltro(funcionario.id)}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-all duration-300 hover:scale-105 ${
                        funcionarioFiltro === funcionario.id 
                          ? 'shadow-lg font-semibold' 
                          : 'hover:bg-white/20 border border-white/30 text-white'
                      }`}
                      style={{
                        backgroundColor: funcionarioFiltro === funcionario.id ? funcionario.cor : 'transparent',
                        color: funcionarioFiltro === funcionario.id ? 'white' : 'white'
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      {funcionario.nome}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  className="flex items-center gap-2 text-white hover:bg-white/20 rounded-xl px-4 py-2 border border-white/30"
                >
                  {mostrarDetalhes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {mostrarDetalhes ? 'Ocultar' : 'Mostrar'} Detalhes
                </Button>
              </div>
              
              <Button 
                onClick={() => handleNovoAgendamento()}
                className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </CardHeader>
        
      </Card>

      {/* Calendário Premium */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          {/* Cabeçalho dos dias da semana premium */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {diasSemana.map(dia => (
              <div key={dia} className="p-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Grade do calendário premium */}
          <div className="grid grid-cols-7 gap-3">
            {diasDoCalendario.map((diaInfo, index) => {
              const dadosDia = agendamentosPorData[diaInfo.dataStr]
              const totalAgendamentos = dadosDia?.total || 0
              const isHoje = diaInfo.dataStr === hoje
              const isPast = new Date(diaInfo.dataStr) < new Date(hoje)
              
              return (
                <div
                  key={index}
                  onClick={() => handleDiaClick(diaInfo)}
                  className={`
                    group relative p-4 min-h-[120px] rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl
                    ${diaInfo.mesAtual 
                      ? 'bg-white dark:bg-gray-700 shadow-lg hover:shadow-2xl' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 opacity-60'
                    }
                    ${isHoje 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl ring-4 ring-blue-200 font-bold' 
                      : 'border-2 border-gray-100 dark:border-gray-600'
                    }
                    ${isPast && diaInfo.mesAtual && !isHoje ? 'opacity-70' : ''}
                  `}
                >
                  {/* Número do dia premium */}
                  <div className={`text-lg font-bold mb-2 ${isHoje ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                    {diaInfo.dia}
                  </div>
                  
                  {/* Badge com total de agendamentos premium */}
                  {totalAgendamentos > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge 
                        className={`text-xs px-2 py-1 rounded-full font-bold shadow-lg ${
                          isHoje 
                            ? 'bg-white/20 text-white border border-white/30' 
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                        }`}
                      >
                        {totalAgendamentos}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Mostrar funcionários com tarefas premium */}
                  {mostrarDetalhes && dadosDia && diaInfo.mesAtual && (
                    <div className="space-y-2 mt-2">
                      {Object.values(dadosDia.porFuncionario)
                        .filter(item => funcionarioFiltro === 'todos' || item.funcionario?.id === funcionarioFiltro)
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div key={idx} className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${
                            isHoje ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
                          }`}>
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: item.funcionario?.cor }}
                            />
                            <span className={`text-xs font-medium truncate ${
                              isHoje ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {item.funcionario?.nome?.split(' ')[0]} ({item.tarefas.length})
                            </span>
                          </div>
                        ))}
                      
                      {Object.keys(dadosDia.porFuncionario).length > 3 && (
                        <div className={`text-xs font-medium ${
                          isHoje ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          +{Object.keys(dadosDia.porFuncionario).length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Ícone de adicionar premium */}
                  {diaInfo.mesAtual && (
                    <div className="absolute bottom-2 right-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-110 ${
                        isHoje 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : 'bg-blue-500 shadow-lg'
                      }`}>
                        <Plus className={`w-3 h-3 ${isHoje ? 'text-white' : 'text-white'}`} />
                      </div>
                    </div>
                  )}
                  
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-2xl"></div>
                </div>
              )
            })}
          </div>
          
          {/* Legenda premium */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg"></div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Hoje</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">N</Badge>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Número de agendamentos</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Plus className="w-3 h-3 text-white" />
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Clique para agendar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-600 rounded-lg opacity-60"></div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Outros meses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Dia */}
      <Dialog open={detalheDiaOpen} onOpenChange={setDetalheDiaOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agendamentos - {dataSelecionada && new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')}
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie todos os agendamentos do dia
            </DialogDescription>
          </DialogHeader>
          
          {dataSelecionada && agendamentosPorData[dataSelecionada] && (
            <div className="space-y-6">
              {/* Resumo do dia premium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-xl text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <CalendarDays className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-wide">Total de Agendamentos</span>
                    </div>
                    <p className="text-4xl font-black tracking-tight">
                      {agendamentosPorData[dataSelecionada].total}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-wide">Funcionários</span>
                    </div>
                    <p className="text-4xl font-black tracking-tight">
                      {Object.keys(agendamentosPorData[dataSelecionada].porFuncionario).length}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 shadow-xl text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Timer className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold uppercase tracking-wide">Tempo Estimado</span>
                    </div>
                    <p className="text-4xl font-black tracking-tight">
                      {Math.round(agendamentosPorData[dataSelecionada].agendamentos.reduce((acc, item) => 
                        acc + (item.tarefaInfo?.tempo_estimado || 30), 0) / 60)}h
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Lista por funcionário */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Agendamentos por Funcionário</h3>
                  <Button 
                    onClick={() => {
                      setDetalheDiaOpen(false)
                      handleNovoAgendamento(dataSelecionada)
                    }}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Agendamento
                  </Button>
                </div>
                
                {Object.values(agendamentosPorData[dataSelecionada].porFuncionario).map((funcionarioData) => (
                  <Card key={funcionarioData.funcionario?.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: funcionarioData.funcionario?.cor }}
                        />
                        <CardTitle className="text-lg">{funcionarioData.funcionario?.nome}</CardTitle>
                        <Badge variant="outline">
                          {funcionarioData.tarefas.length} tarefa(s)
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {funcionarioData.tarefas
                          .sort((a, b) => a.horario.localeCompare(b.horario))
                          .map((agendamento) => (
                            <div 
                              key={agendamento.id}
                              className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                                agendamento.status === 'concluida' ? 'bg-green-50 border-green-200' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Checkbox */}
                                <button
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                    agendamento.status === 'concluida'
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                  }`}
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      const novoStatus = agendamento.status === 'concluida' ? 'nao_iniciada' : 'concluida'
                                      const agora = new Date()
                                      
                                      await supabaseService.updateAgendamento(agendamento.id, {
                                        status: novoStatus,
                                        tempo_fim: novoStatus === 'concluida' ? agora.toISOString() : null,
                                        tempo_real: novoStatus === 'concluida' ? (agendamento.tarefaInfo?.tempo_estimado || 30) : null
                                      })
                                      
                                      refetchAgenda()
                                    } catch (error) {
                                      console.error('Erro ao atualizar tarefa:', error)
                                    }
                                  }}
                                  title={agendamento.status === 'concluida' ? 'Marcar como pendente' : 'Marcar como concluída'}
                                >
                                  {agendamento.status === 'concluida' && <span className="text-sm">✓</span>}
                                </button>

                                <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                  {formatarHorarioIntervalo(agendamento.horario)}
                                </div>
                                <div>
                                  <div className={`font-medium ${agendamento.status === 'concluida' ? 'line-through text-gray-500' : ''}`}>
                                    {agendamento.tarefaInfo?.nome}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {agendamento.tarefaInfo?.categoria} • {agendamento.tarefaInfo?.tempo_estimado || 30}min
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={agendamento.status === 'concluida' ? 'default' : 'outline'}
                                  className={agendamento.status === 'concluida' ? 'bg-green-500' : ''}
                                >
                                  {agendamento.status === 'concluida' ? 'Concluída' : 'Pendente'}
                                </Badge>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingAgendamento(agendamento)
                                    setDetalheDiaOpen(false)
                                    setAgendamentoFormOpen(true)
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteAgendamento(agendamento)
                                  }}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Excluir
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento */}
      <AgendamentoForm
        isOpen={agendamentoFormOpen}
        onClose={() => setAgendamentoFormOpen(false)}
        agendamento={editingAgendamento}
        funcionarios={funcionarios || []}
        tarefas={tarefas || []}
        onSave={handleSaveAgendamento}
        horarioInicial=""
        funcionarioInicial=""
        dataInicial={dataSelecionada}
      />
    </div>
  )
}