import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, User, Users, Filter, Calendar } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
// import { useNotifications } from '../contexts/NotificationContext'
import AgendamentoForm from './forms/AgendamentoForm'
import supabaseService from '../services/supabase'
import { formatarHorarioIntervalo } from '../utils/timeUtils'

const categoriasCores = {
  'gestao': 'bg-blue-500',
  'atendimento': 'bg-green-500',
  'marketing': 'bg-yellow-500',
  'engajamento': 'bg-red-500',
  'conteudo': 'bg-purple-500',
  'produto': 'bg-cyan-500',
  'interno': 'bg-pink-500'
}

function Cronograma() {
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('todos')
  const [visualizacao, setVisualizacao] = useState('timeline') // timeline ou grade
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  // const { showSuccess, showError } = useNotifications()
  const showSuccess = (message) => alert('Sucesso: ' + message)
  const showError = (message) => alert('Erro: ' + message)

  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios, error: errorFuncionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, error: errorTarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, error: errorAgenda, refetch: refetchAgenda } = useAgenda()

  // Estados de loading e error
  const isLoading = loadingFuncionarios || loadingTarefas || loadingAgenda
  const hasError = errorFuncionarios || errorTarefas || errorAgenda
  const error = errorFuncionarios || errorTarefas || errorAgenda

  // Estados para agendamentos
  const [agendamentoFormOpen, setAgendamentoFormOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState(null)
  const [novoAgendamento, setNovoAgendamento] = useState({ horario: '', funcionario_id: '' })

  // Função para encontrar datas com agendamentos
  const datasComAgendamentos = useMemo(() => {
    if (!agenda) return []
    const datas = [...new Set(agenda.map(item => item.data || new Date().toISOString().split('T')[0]))]
    return datas.sort()
  }, [agenda])

  const proximaDataComAgendamentos = () => {
    const dataAtual = dataSelecionada
    const proximaData = datasComAgendamentos.find(data => data > dataAtual)
    if (proximaData) {
      setDataSelecionada(proximaData)
    }
  }

  const dataAnteriorComAgendamentos = () => {
    const dataAtual = dataSelecionada
    const dataAnterior = [...datasComAgendamentos].reverse().find(data => data < dataAtual)
    if (dataAnterior) {
      setDataSelecionada(dataAnterior)
    }
  }

  // Função para recarregar todos os dados
  const refetchAll = () => {
    refetchFuncionarios()
    refetchTarefas()
    refetchAgenda()
  }

  // Handlers para agendamentos
  const handleAddAgendamento = (horario, funcionarioId) => {
    setNovoAgendamento({ 
      horario, 
      funcionario_id: funcionarioId,
      data: dataSelecionada 
    })
    setEditingAgendamento(null)
    setAgendamentoFormOpen(true)
  }

  const handleEditAgendamento = (agendamento) => {
    console.log('Editando agendamento:', agendamento)
    // Transformar dados para o formato esperado pelo formulário
    const agendamentoFormatado = {
      ...agendamento,
      funcionario_id: agendamento.funcionario || agendamento.funcionario_id,
      tarefa_id: agendamento.tarefa || agendamento.tarefa_id
    }
    setEditingAgendamento(agendamentoFormatado)
    setAgendamentoFormOpen(true)
  }

  const handleSaveAgendamento = async (agendamentoData) => {
    try {
      if (editingAgendamento) {
        await supabaseService.updateAgendamento(editingAgendamento.id, agendamentoData)
      } else {
        await supabaseService.createAgendamento(agendamentoData)
      }
      refetchAgenda()
    } catch (error) {
      throw new Error(error.message)
    }
  }

  const handleDeleteAgendamento = async (agendamento) => {
    if (window.confirm('Tem certeza que deseja deletar este agendamento?')) {
      try {
        await supabaseService.deleteAgendamento(agendamento.id)
        showSuccess('Agendamento deletado com sucesso!')
        refetchAgenda()
      } catch (error) {
        showError('Erro ao deletar agendamento: ' + error.message)
      }
    }
  }

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    if (!agenda) return []
    
    let filtrados = agenda
    
    // Filtrar por data
    filtrados = filtrados.filter(item => {
      const itemData = item.data || new Date().toISOString().split('T')[0]
      return itemData === dataSelecionada
    })
    
    // Filtrar por funcionário
    if (funcionarioSelecionado !== 'todos') {
      filtrados = filtrados.filter(item => item.funcionario === funcionarioSelecionado)
    }
    
    return filtrados
  }, [agenda, funcionarioSelecionado, dataSelecionada])

  // Horários únicos ordenados (baseado nos dados filtrados)
  const horarios = useMemo(() => {
    if (!dadosFiltrados || dadosFiltrados.length === 0) {
      // Se não há dados filtrados, usar todos os horários da agenda para permitir adicionar tarefas
      if (!agenda) return []
      const horariosSet = new Set(agenda.filter(item => {
        const itemData = item.data || new Date().toISOString().split('T')[0]
        return itemData === dataSelecionada
      }).map(item => item.horario))
      return Array.from(horariosSet).sort()
    }
    const horariosSet = new Set(dadosFiltrados.map(item => item.horario))
    return Array.from(horariosSet).sort()
  }, [dadosFiltrados, agenda, dataSelecionada])

  // Organizar dados por funcionário e horário
  const cronogramaPorFuncionario = useMemo(() => {
    if (!funcionarios || !tarefas) return {}
    
    const resultado = {}
    
    // Filtrar funcionários baseado na seleção
    const funcionariosFiltrados = funcionarioSelecionado === 'todos' 
      ? funcionarios 
      : funcionarios.filter(f => f.id === funcionarioSelecionado)
    
    funcionariosFiltrados.forEach(funcionario => {
      resultado[funcionario.id] = {
        ...funcionario,
        tarefas: {}
      }
      
      horarios.forEach(horario => {
        resultado[funcionario.id].tarefas[horario] = null
      })
    })
    
    dadosFiltrados.forEach(item => {
      if (resultado[item.funcionario]) {
        const tarefa = tarefas.find(t => t.id === item.tarefa)
        resultado[item.funcionario].tarefas[item.horario] = {
          ...item,
          tarefaInfo: tarefa
        }
      }
    })
    
    return resultado
  }, [funcionarios, tarefas, dadosFiltrados, horarios, funcionarioSelecionado])

  const TarefaCard = ({ tarefa, horario, funcionarioId }) => {
    if (!tarefa) {
      return (
        <div 
          className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
          onClick={() => handleAddAgendamento(horario, funcionarioId)}
          title="Clique para adicionar tarefa"
        >
          <span className="text-gray-400 text-sm group-hover:text-gray-600">+ Adicionar</span>
        </div>
      )
    }

    const categoria = tarefa.tarefaInfo?.categoria || 'interno'
    const corCategoria = categoriasCores[categoria] || 'bg-gray-500'
    const isCompleted = tarefa.status === 'concluida'

    const toggleTarefa = async (e) => {
      e.stopPropagation()
      try {
        const novoStatus = isCompleted ? 'nao_iniciada' : 'concluida'
        const agora = new Date()
        
        await supabaseService.updateAgendamento(tarefa.id, {
          status: novoStatus,
          tempo_fim: novoStatus === 'concluida' ? agora.toISOString() : null,
          tempo_real: novoStatus === 'concluida' ? (tarefa.tarefaInfo?.tempo_estimado || 30) : null
        })
        
        refetchAgenda()
      } catch (error) {
        console.error('Erro ao atualizar tarefa:', error)
      }
    }

    return (
      <div 
        className={`h-16 ${corCategoria} rounded-lg p-2 text-white shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
          isCompleted ? 'opacity-75 ring-2 ring-green-400' : ''
        }`}
        onClick={() => handleEditAgendamento(tarefa)}
      >
        {/* Checkbox */}
        <button
          className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isCompleted 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-white/50 hover:border-white hover:bg-white/20'
          }`}
          onClick={toggleTarefa}
          title={isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}
        >
          {isCompleted && <span className="text-xs">✓</span>}
        </button>

        {/* Conteúdo da tarefa */}
        <div className="ml-6">
          <div className={`text-sm font-medium truncate ${isCompleted ? 'line-through' : ''}`}>
            {tarefa.tarefaInfo?.nome || tarefa.tarefa}
          </div>
          <div className="text-xs opacity-90">
            {tarefa.tarefaInfo?.tempo_estimado || 30} min
          </div>
        </div>
        
        {/* Botão de deletar */}
        <button
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteAgendamento(tarefa)
          }}
          title="Deletar agendamento"
        >
          ×
        </button>
      </div>
    )
  }

  const TimelineView = () => (
    <div className="space-y-6">
      {Object.values(cronogramaPorFuncionario).map(funcionario => (
        <Card key={funcionario.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: funcionario.cor }}
                />
                <CardTitle className="text-lg">{funcionario.nome}</CardTitle>
                <Badge variant="outline">
                  {funcionario.horario_inicio === 'flexible' 
                    ? 'Horário Flexível' 
                    : `${funcionario.horario_inicio || 'N/A'} - ${funcionario.horario_fim || 'N/A'}`
                  }
                </Badge>
              </div>
              <Badge variant="secondary">
                {Object.values(funcionario.tarefas).filter(t => t !== null).length} tarefas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {horarios.map(horario => (
                <div key={horario} className="space-y-2">
                  <div className="text-xs font-medium text-gray-600 text-center">
                    {formatarHorarioIntervalo(horario)}
                  </div>
                  <TarefaCard 
                    tarefa={funcionario.tarefas[horario]} 
                    horario={horario}
                    funcionarioId={funcionario.id}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const GridView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Grade de Horários</CardTitle>
        <CardDescription>
          Visualização em grade de todas as atividades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 p-3 bg-gray-50 text-left font-medium">
                  Funcionário
                </th>
                {horarios.map(horario => (
                  <th key={horario} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium min-w-[140px]">
                    {formatarHorarioIntervalo(horario)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(cronogramaPorFuncionario).map(funcionario => (
                <tr key={funcionario.id}>
                  <td className="border border-gray-200 p-3 font-medium">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      <span>{funcionario.nome}</span>
                    </div>
                  </td>
                  {horarios.map(horario => (
                    <td key={horario} className="border border-gray-200 p-2">
                      {funcionario.tarefas[horario] ? (
                        <div className={`p-2 rounded text-white text-xs ${categoriasCores[funcionario.tarefas[horario].tarefaInfo?.categoria] || 'bg-gray-500'}`}>
                          <div className="font-medium truncate">
                            {funcionario.tarefas[horario].tarefaInfo?.nome}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs text-center">-</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cronograma</h2>
          <Loading message="Carregando cronograma..." />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cronograma</h2>
        </div>
        <ErrorMessage error={error} onRetry={refetchAll} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cronograma</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
            <Badge variant="secondary">
              {dadosFiltrados.length} agendamento{dadosFiltrados.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const data = new Date(dataSelecionada)
                  data.setDate(data.getDate() - 1)
                  setDataSelecionada(data.toISOString().split('T')[0])
                }}
                className="px-2 py-1"
              >
                ←
              </Button>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const data = new Date(dataSelecionada)
                  data.setDate(data.getDate() + 1)
                  setDataSelecionada(data.toISOString().split('T')[0])
                }}
                className="px-2 py-1"
              >
                →
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDataSelecionada(new Date().toISOString().split('T')[0])}
              className="text-xs"
            >
              Hoje
            </Button>

          </div>
          
          {datasComAgendamentos.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Navegar:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={dataAnteriorComAgendamentos}
                className="text-xs px-2 py-1"
                disabled={!datasComAgendamentos.some(data => data < dataSelecionada)}
              >
                ← Data anterior
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={proximaDataComAgendamentos}
                className="text-xs px-2 py-1"
                disabled={!datasComAgendamentos.some(data => data > dataSelecionada)}
              >
                Próxima data →
              </Button>
            </div>
          )}
          
          {/* Filtros por Funcionário */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Funcionários:</span>
            </div>
            
            <Button
              variant={funcionarioSelecionado === 'todos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFuncionarioSelecionado('todos')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Todos ({agenda?.filter(item => {
                const itemData = item.data || new Date().toISOString().split('T')[0]
                return itemData === dataSelecionada
              }).length || 0})
            </Button>
            
            {funcionarios?.filter(funcionario => funcionario.id && funcionario.id.trim() !== '').map(funcionario => {
              const tarefasFuncionario = agenda?.filter(item => {
                const itemData = item.data || new Date().toISOString().split('T')[0]
                return itemData === dataSelecionada && item.funcionario === funcionario.id
              }).length || 0
              return (
                <Button
                  key={funcionario.id}
                  variant={funcionarioSelecionado === funcionario.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFuncionarioSelecionado(funcionario.id)}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: funcionarioSelecionado === funcionario.id ? funcionario.cor : 'transparent',
                    borderColor: funcionario.cor,
                    color: funcionarioSelecionado === funcionario.id ? 'white' : funcionario.cor
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: funcionario.cor }}
                  />
                  {funcionario.nome} ({tarefasFuncionario})
                </Button>
              )
            })}
          </div>
          
          <Select value={visualizacao} onValueChange={setVisualizacao}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Resumo do dia */}
      {dadosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Total de Agendamentos</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {dadosFiltrados.length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Funcionários Ativos</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {new Set(dadosFiltrados.map(item => item.funcionario)).size}
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
                {Math.round(dadosFiltrados.reduce((acc, item) => {
                  const tarefa = tarefas?.find(t => t.id === item.tarefa)
                  return acc + (tarefa?.tempo_estimado || 30)
                }, 0) / 60)}h
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">Concluídas</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {dadosFiltrados.filter(item => item.status === 'concluida').length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legenda de categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(categoriasCores).map(([categoria, cor]) => (
              <div key={categoria} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${cor}`} />
                <span className="text-sm capitalize">{categoria}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualização */}
      {visualizacao === 'timeline' ? <TimelineView /> : <GridView />}

      {/* Modal de Agendamento */}
      <AgendamentoForm
        isOpen={agendamentoFormOpen}
        onClose={() => setAgendamentoFormOpen(false)}
        agendamento={editingAgendamento}
        funcionarios={funcionarios || []}
        tarefas={tarefas || []}
        onSave={handleSaveAgendamento}
        horarioInicial={novoAgendamento.horario}
        funcionarioInicial={novoAgendamento.funcionario_id}
      />
    </div>
  )
}

export default Cronograma

