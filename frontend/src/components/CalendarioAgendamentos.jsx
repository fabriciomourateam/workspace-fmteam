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
  Trash2
} from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
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
    if (!window.confirm(`Tem certeza que deseja excluir o agendamento de "${agendamento.tarefaInfo?.nome}" às ${agendamento.horario}?`)) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Calendário de Agendamentos
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={irParaHoje}>
                  Hoje
                </Button>
                <Button variant="outline" size="sm" onClick={mesAnterior}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-[120px] text-center">
                  {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
                </span>
                <Button variant="outline" size="sm" onClick={proximoMes}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Controles de filtro e visualização */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Funcionários:</span>
                </div>
                
                {/* Botões de Funcionários */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant={funcionarioFiltro === 'todos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFuncionarioFiltro('todos')}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Todos
                  </Button>
                  
                  {funcionarios?.map(funcionario => (
                    <Button
                      key={funcionario.id}
                      variant={funcionarioFiltro === funcionario.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFuncionarioFiltro(funcionario.id)}
                      className="flex items-center gap-2"
                      style={{
                        backgroundColor: funcionarioFiltro === funcionario.id ? funcionario.cor : 'transparent',
                        borderColor: funcionario.cor,
                        color: funcionarioFiltro === funcionario.id ? 'white' : funcionario.cor
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      {funcionario.nome}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
                  className="flex items-center gap-2"
                >
                  {mostrarDetalhes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {mostrarDetalhes ? 'Ocultar' : 'Mostrar'} Detalhes
                </Button>
              </div>
              
              <Button 
                onClick={() => handleNovoAgendamento()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map(dia => (
              <div key={dia} className="p-2 text-center text-sm font-medium text-gray-500">
                {dia}
              </div>
            ))}
          </div>
          
          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-1">
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
                    relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all hover:bg-blue-50
                    ${diaInfo.mesAtual ? 'bg-white' : 'bg-gray-50 text-gray-400'}
                    ${isHoje ? 'bg-blue-100 border-blue-500 font-bold' : 'border-gray-200'}
                    ${isPast && diaInfo.mesAtual ? 'opacity-60' : ''}
                    hover:shadow-md group
                  `}
                >
                  {/* Número do dia */}
                  <div className="text-sm font-medium mb-1">{diaInfo.dia}</div>
                  
                  {/* Badge com total de agendamentos */}
                  {totalAgendamentos > 0 && (
                    <div className="absolute top-1 right-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs px-1 py-0 bg-blue-500 text-white"
                      >
                        {totalAgendamentos}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Mostrar funcionários com tarefas (se habilitado) */}
                  {mostrarDetalhes && dadosDia && diaInfo.mesAtual && (
                    <div className="space-y-1 mt-1">
                      {Object.values(dadosDia.porFuncionario)
                        .filter(item => funcionarioFiltro === 'todos' || item.funcionario?.id === funcionarioFiltro)
                        .slice(0, 3)
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.funcionario?.cor }}
                            />
                            <span className="text-xs truncate">
                              {item.funcionario?.nome?.split(' ')[0]} ({item.tarefas.length})
                            </span>
                          </div>
                        ))}
                      
                      {Object.keys(dadosDia.porFuncionario).length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{Object.keys(dadosDia.porFuncionario).length - 3} mais
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Ícone de adicionar */}
                  {diaInfo.mesAtual && (
                    <div className="absolute bottom-1 right-1">
                      <Plus className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Legenda */}
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
              <span>Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs">N</Badge>
              <span>Número de agendamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-gray-400" />
              <span>Clique para agendar</span>
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
              {/* Resumo do dia */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Total de Agendamentos</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {agendamentosPorData[dataSelecionada].total}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Funcionários</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {Object.keys(agendamentosPorData[dataSelecionada].porFuncionario).length}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Tempo Estimado</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
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
                                  {agendamento.horario}
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