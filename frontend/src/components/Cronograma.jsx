import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, User, Filter, Calendar } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
// import { useNotifications } from '../contexts/NotificationContext'
import AgendamentoForm from './forms/AgendamentoForm'
import supabaseService from '../services/supabase'

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

  // Função para recarregar todos os dados
  const refetchAll = () => {
    refetchFuncionarios()
    refetchTarefas()
    refetchAgenda()
  }

  // Handlers para agendamentos
  const handleAddAgendamento = (horario, funcionarioId) => {
    setNovoAgendamento({ horario, funcionario_id: funcionarioId })
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

  // Horários únicos ordenados
  const horarios = useMemo(() => {
    if (!agenda) return []
    const horariosSet = new Set(agenda.map(item => item.horario))
    return Array.from(horariosSet).sort()
  }, [agenda])

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    if (!agenda) return []
    if (funcionarioSelecionado === 'todos') {
      return agenda
    }
    return agenda.filter(item => item.funcionario === funcionarioSelecionado)
  }, [agenda, funcionarioSelecionado])

  // Organizar dados por funcionário e horário
  const cronogramaPorFuncionario = useMemo(() => {
    if (!funcionarios || !tarefas) return {}
    
    const resultado = {}
    
    funcionarios.forEach(funcionario => {
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
  }, [funcionarios, tarefas, dadosFiltrados, horarios])

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

    return (
      <div 
        className={`h-16 ${corCategoria} rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative`}
        onClick={() => handleEditAgendamento(tarefa)}
      >
        <div className="text-sm font-medium truncate">
          {tarefa.tarefaInfo?.nome || tarefa.tarefa}
        </div>
        <div className="text-xs opacity-90">
          30 min
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
                    {horario}
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
                  <th key={horario} className="border border-gray-200 p-3 bg-gray-50 text-center font-medium min-w-[120px]">
                    {horario}
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
          <p className="text-gray-600 dark:text-gray-400">Visualização das atividades por funcionário e horário</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
            <SelectTrigger className="w-[180px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os funcionários</SelectItem>
              {funcionarios?.filter(funcionario => funcionario.id && funcionario.id.trim() !== '').map(funcionario => (
                <SelectItem key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={visualizacao} onValueChange={setVisualizacao}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline</SelectItem>
              <SelectItem value="grade">Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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

