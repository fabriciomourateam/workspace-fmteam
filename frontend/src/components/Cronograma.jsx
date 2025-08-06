import { useState, useMemo, useEffect } from 'react'
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
import { usePersonalizacao } from '../hooks/usePersonalizacao'

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
  
  // Estado para larguras das colunas redimensionáveis
  const [columnWidths, setColumnWidths] = useState(() => {
    // Carregar larguras salvas do localStorage
    const saved = localStorage.getItem('cronograma-column-widths')
    return saved ? JSON.parse(saved) : {}
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumn, setResizingColumn] = useState(null)

  // Hook de personalização
  const { getClassesDensidade, getCoresTema } = usePersonalizacao()

  // Salvar larguras das colunas no localStorage sempre que mudarem
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      localStorage.setItem('cronograma-column-widths', JSON.stringify(columnWidths))
    }
  }, [columnWidths])

  // Funções para redimensionamento de colunas
  const handleMouseDown = (e, columnId) => {
    e.preventDefault()
    setIsResizing(true)
    setResizingColumn(columnId)
    
    const startX = e.clientX
    const startWidth = columnWidths[columnId] || 80
    
    const handleMouseMove = (e) => {
      const newWidth = Math.max(60, startWidth + (e.clientX - startX))
      setColumnWidths(prev => {
        const updated = {
          ...prev,
          [columnId]: newWidth
        }
        return updated
      })
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      setResizingColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const getColumnWidth = (columnId) => {
    return columnWidths[columnId] || 80
  }

  const resetColumnWidths = () => {
    setColumnWidths({})
    localStorage.removeItem('cronograma-column-widths')
  }

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

  // Horários de 8h às 19h30 (finalizando no horário das 19h30 às 20h)
  const horarios = useMemo(() => {
    const todosHorarios = []
    for (let h = 8; h <= 19; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hora = h.toString().padStart(2, '0')
        const minuto = m.toString().padStart(2, '0')
        todosHorarios.push(`${hora}:${minuto}`)
        
        // Para a hora 19, só adiciona até 19:30 (para de adicionar depois do 19:30)
        if (h === 19 && m === 30) break
      }
    }
    return todosHorarios
  }, [])

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
          className="text-gray-400 text-xs text-center h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
          onClick={() => handleAddAgendamento(horario, funcionarioId)}
          title="Clique para adicionar tarefa"
        >
          <span className="text-gray-400 group-hover:text-gray-600">+</span>
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
        className={`p-1 ${corCategoria} rounded text-white text-xs min-h-8 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
          isCompleted ? 'opacity-75 ring-1 ring-green-400' : ''
        }`}
        onClick={() => handleEditAgendamento(tarefa)}
        onContextMenu={(e) => {
          e.preventDefault()
          if (window.confirm(`Deseja excluir o agendamento "${tarefa.tarefaInfo?.nome || tarefa.tarefa}" às ${tarefa.horario}?`)) {
            handleDeleteAgendamento(tarefa)
          }
        }}
        title="Clique para editar • Clique direito para excluir"
      >
        {/* Checkbox */}
        <button
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded border flex items-center justify-center transition-all ${
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
        <div className="ml-4 pr-6">
          <div className={`font-medium leading-tight break-words ${isCompleted ? 'line-through' : ''}`}>
            {tarefa.tarefaInfo?.nome || tarefa.tarefa}
          </div>
          <div className="text-xs opacity-75 leading-tight">
            {tarefa.tarefaInfo?.tempo_estimado || 30}min
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="absolute top-0.5 right-0.5 flex gap-0.5">
          {/* Botão de deletar - mais visível */}
          <button
            className="opacity-70 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs transition-all hover:scale-110"
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm(`Deseja excluir o agendamento "${tarefa.tarefaInfo?.nome || tarefa.tarefa}" às ${tarefa.horario}?`)) {
                handleDeleteAgendamento(tarefa)
              }
            }}
            title="Excluir agendamento"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  const TimelineView = () => (
    <div className="space-y-3">
      {Object.values(cronogramaPorFuncionario).map(funcionario => (
        <Card key={funcionario.id}>
          <CardHeader className="pb-2">
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
          <CardContent className="p-3">
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
              {horarios.map(horario => (
                <div key={horario} className="space-y-1 min-w-[80px]">
                  <div className="text-xs font-medium text-gray-600 text-center leading-tight">
                    {formatarHorarioIntervalo(horario)}
                  </div>
                  <div className={`p-1 rounded text-white text-xs min-h-8 relative group ${
                    funcionario.tarefas[horario] 
                      ? categoriasCores[funcionario.tarefas[horario].tarefaInfo?.categoria] || 'bg-gray-500'
                      : 'bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600'
                  } flex items-center justify-center`}
                  onClick={() => funcionario.tarefas[horario] 
                    ? handleEditAgendamento(funcionario.tarefas[horario])
                    : handleAddAgendamento(horario, funcionario.id)
                  }
                  title={funcionario.tarefas[horario] ? "Clique para editar" : "Clique para adicionar tarefa"}
                  >
                    {funcionario.tarefas[horario] ? (
                      <>
                        {/* Checkbox de conclusão */}
                        <button
                          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded border flex items-center justify-center transition-all z-10 ${
                            funcionario.tarefas[horario].status === 'concluida'
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-white/50 hover:border-white hover:bg-white/20'
                          }`}
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              const isCompleted = funcionario.tarefas[horario].status === 'concluida'
                              const novoStatus = isCompleted ? 'nao_iniciada' : 'concluida'
                              const agora = new Date()
                              
                              await supabaseService.updateAgendamento(funcionario.tarefas[horario].id, {
                                status: novoStatus,
                                tempo_fim: novoStatus === 'concluida' ? agora.toISOString() : null,
                                tempo_real: novoStatus === 'concluida' ? (funcionario.tarefas[horario].tarefaInfo?.tempo_estimado || 30) : null
                              })
                              
                              refetchAgenda()
                            } catch (error) {
                              console.error('Erro ao atualizar tarefa:', error)
                            }
                          }}
                          title={funcionario.tarefas[horario].status === 'concluida' ? 'Marcar como pendente' : 'Marcar como concluída'}
                        >
                          {funcionario.tarefas[horario].status === 'concluida' && <span className="text-xs">✓</span>}
                        </button>

                        <div className={`w-full ml-4 pr-4 ${funcionario.tarefas[horario].status === 'concluida' ? 'opacity-75' : ''}`}>
                          <div className={`font-medium leading-tight break-words ${funcionario.tarefas[horario].status === 'concluida' ? 'line-through' : ''}`}>
                            {funcionario.tarefas[horario].tarefaInfo?.nome}
                          </div>
                          <div className="text-xs opacity-75">
                            {funcionario.tarefas[horario].tarefaInfo?.tempo_estimado || 30}min
                          </div>
                        </div>
                        
                        {/* Botão de exclusão */}
                        <button
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs transition-opacity z-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAgendamento(funcionario.tarefas[horario])
                          }}
                          title="Excluir agendamento"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">+</span>
                    )}
                  </div>
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
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50 text-left font-medium text-xs">
                  Funcionário
                </th>
                {horarios.map(horario => (
                  <th key={horario} className="border border-gray-200 p-1 bg-gray-50 text-center font-medium text-xs min-w-[80px]">
                    <div className="leading-tight">
                      {formatarHorarioIntervalo(horario)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(cronogramaPorFuncionario).map(funcionario => (
                <tr key={funcionario.id}>
                  <td className="border border-gray-200 p-2 font-medium">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      <span className="text-xs">{funcionario.nome}</span>
                    </div>
                  </td>
                  {horarios.map(horario => (
                    <td key={horario} className="border border-gray-200 p-1">
                      {funcionario.tarefas[horario] ? (
                        <div 
                          className={`p-1 rounded text-white text-xs min-h-8 cursor-pointer group relative ${
                            funcionario.tarefas[horario].status === 'concluida' ? 'opacity-75 ring-1 ring-green-400' : ''
                          } ${categoriasCores[funcionario.tarefas[horario].tarefaInfo?.categoria] || 'bg-gray-500'}`}
                          onClick={() => handleEditAgendamento(funcionario.tarefas[horario])}
                          onContextMenu={(e) => {
                            e.preventDefault()
                            if (window.confirm(`Deseja excluir o agendamento "${funcionario.tarefas[horario].tarefaInfo?.nome}" às ${horario}?`)) {
                              handleDeleteAgendamento(funcionario.tarefas[horario])
                            }
                          }}
                          title="Clique para editar • Clique direito para excluir"
                        >
                          {/* Checkbox de conclusão */}
                          <button
                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded border flex items-center justify-center transition-all z-10 ${
                              funcionario.tarefas[horario].status === 'concluida'
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-white/50 hover:border-white hover:bg-white/20'
                            }`}
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                const isCompleted = funcionario.tarefas[horario].status === 'concluida'
                                const novoStatus = isCompleted ? 'nao_iniciada' : 'concluida'
                                const agora = new Date()
                                
                                await supabaseService.updateAgendamento(funcionario.tarefas[horario].id, {
                                  status: novoStatus,
                                  tempo_fim: novoStatus === 'concluida' ? agora.toISOString() : null,
                                  tempo_real: novoStatus === 'concluida' ? (funcionario.tarefas[horario].tarefaInfo?.tempo_estimado || 30) : null
                                })
                                
                                refetchAgenda()
                              } catch (error) {
                                console.error('Erro ao atualizar tarefa:', error)
                              }
                            }}
                            title={funcionario.tarefas[horario].status === 'concluida' ? 'Marcar como pendente' : 'Marcar como concluída'}
                          >
                            {funcionario.tarefas[horario].status === 'concluida' && <span className="text-xs">✓</span>}
                          </button>

                          <div className={`ml-4 pr-4 ${funcionario.tarefas[horario].status === 'concluida' ? 'line-through' : ''}`}>
                            <div className="font-medium leading-tight break-words">
                              {funcionario.tarefas[horario].tarefaInfo?.nome}
                            </div>
                            <div className="text-xs opacity-75">
                              {funcionario.tarefas[horario].tarefaInfo?.tempo_estimado || 30}min
                            </div>
                          </div>
                          {/* Botão de deletar */}
                          <button
                            className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (window.confirm(`Deseja excluir o agendamento "${funcionario.tarefas[horario].tarefaInfo?.nome}" às ${horario}?`)) {
                                handleDeleteAgendamento(funcionario.tarefas[horario])
                              }
                            }}
                            title="Excluir agendamento"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="text-gray-400 text-xs text-center h-8 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded"
                          onClick={() => handleAddAgendamento(horario, funcionario.id)}
                          title="Clique para adicionar tarefa"
                        >
                          +
                        </div>
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

  const GridVerticalView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Grade Vertical de Horários</CardTitle>
        <CardDescription>
          Visualização em grade vertical com horários nas linhas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50 text-center font-medium text-xs">
                  Horário
                </th>
                {Object.values(cronogramaPorFuncionario).map(funcionario => (
                  <th 
                    key={funcionario.id} 
                    className="border border-gray-200 p-1 bg-gray-50 text-center font-medium text-xs relative"
                    style={{ width: `${getColumnWidth(funcionario.id)}px`, minWidth: '60px' }}
                  >
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      <span className="text-xs leading-tight">{funcionario.nome}</span>
                    </div>
                    
                    {/* Handle de redimensionamento */}
                    <div
                      className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors ${
                        resizingColumn === funcionario.id 
                          ? 'bg-blue-500' 
                          : 'bg-transparent hover:bg-blue-300'
                      }`}
                      onMouseDown={(e) => handleMouseDown(e, funcionario.id)}
                      title="Arrastar para redimensionar coluna"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horarios.map(horario => (
                <tr key={horario}>
                  <td className="border border-gray-200 p-2 font-medium bg-gray-50">
                    <div className="text-center text-xs">
                      {formatarHorarioIntervalo(horario)}
                    </div>
                  </td>
                  {Object.values(cronogramaPorFuncionario).map(funcionario => (
                    <td 
                      key={funcionario.id} 
                      className="border border-gray-200 p-1"
                      style={{ width: `${getColumnWidth(funcionario.id)}px` }}
                    >
                      {funcionario.tarefas[horario] ? (
                        <div 
                          className={`p-1 rounded text-white text-xs min-h-8 cursor-pointer group relative ${
                            funcionario.tarefas[horario].status === 'concluida' ? 'opacity-75 ring-1 ring-green-400' : ''
                          } ${categoriasCores[funcionario.tarefas[horario].tarefaInfo?.categoria] || 'bg-gray-500'}`}
                          onClick={() => handleEditAgendamento(funcionario.tarefas[horario])}
                          title="Clique para editar"
                        >
                          {/* Checkbox de conclusão */}
                          <button
                            className={`absolute top-0.5 left-0.5 w-3 h-3 rounded border flex items-center justify-center transition-all z-10 ${
                              funcionario.tarefas[horario].status === 'concluida'
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-white/50 hover:border-white hover:bg-white/20'
                            }`}
                            onClick={async (e) => {
                              e.stopPropagation()
                              try {
                                const isCompleted = funcionario.tarefas[horario].status === 'concluida'
                                const novoStatus = isCompleted ? 'nao_iniciada' : 'concluida'
                                const agora = new Date()
                                
                                await supabaseService.updateAgendamento(funcionario.tarefas[horario].id, {
                                  status: novoStatus,
                                  tempo_fim: novoStatus === 'concluida' ? agora.toISOString() : null,
                                  tempo_real: novoStatus === 'concluida' ? (funcionario.tarefas[horario].tarefaInfo?.tempo_estimado || 30) : null
                                })
                                
                                refetchAgenda()
                              } catch (error) {
                                console.error('Erro ao atualizar tarefa:', error)
                              }
                            }}
                            title={funcionario.tarefas[horario].status === 'concluida' ? 'Marcar como pendente' : 'Marcar como concluída'}
                          >
                            {funcionario.tarefas[horario].status === 'concluida' && <span className="text-xs">✓</span>}
                          </button>

                          <div className={`ml-4 pr-4 ${funcionario.tarefas[horario].status === 'concluida' ? 'line-through' : ''}`}>
                            <div className="font-medium leading-tight break-words whitespace-pre-line text-xs">
                              {funcionario.tarefas[horario].tarefaInfo?.nome?.split(' ').map((palavra, index, array) => {
                                // Quebra linha a cada 2-3 palavras para textos longos
                                if (array.length > 3 && (index === 1 || index === 3)) {
                                  return palavra + '\n'
                                }
                                return palavra + (index < array.length - 1 ? ' ' : '')
                              }).join('')}
                            </div>
                            <div className="text-xs opacity-75">
                              {funcionario.tarefas[horario].tarefaInfo?.tempo_estimado || 30}min
                            </div>
                          </div>
                          
                          {/* Botão de exclusão */}
                          <button
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs transition-opacity z-10"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteAgendamento(funcionario.tarefas[horario])
                            }}
                            title="Excluir agendamento"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs text-center h-8 flex items-center justify-center">-</div>
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
      {/* Header melhorado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cronograma</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie agendamentos e visualize a agenda da equipe</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                {dadosFiltrados.length} agendamento{dadosFiltrados.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          
          {/* Controles de data melhorados */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const data = new Date(dataSelecionada)
                  data.setDate(data.getDate() - 1)
                  setDataSelecionada(data.toISOString().split('T')[0])
                }}
                className="h-8 w-8 p-0 hover:bg-blue-50"
              >
                ←
              </Button>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="px-3 py-1.5 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm font-medium min-w-[140px]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const data = new Date(dataSelecionada)
                  data.setDate(data.getDate() + 1)
                  setDataSelecionada(data.toISOString().split('T')[0])
                }}
                className="h-8 w-8 p-0 hover:bg-blue-50"
              >
                →
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDataSelecionada(new Date().toISOString().split('T')[0])}
                className="text-xs px-2 py-1 ml-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                Hoje
              </Button>
            </div>
            
            {/* Navegação entre datas melhorada */}
            {datasComAgendamentos.length > 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Navegar:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dataAnteriorComAgendamentos}
                  className="text-xs px-3 py-1.5 hover:bg-gray-50"
                  disabled={!datasComAgendamentos.some(data => data < dataSelecionada)}
                >
                  ← Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={proximaDataComAgendamentos}
                  className="text-xs px-3 py-1.5 hover:bg-gray-50"
                  disabled={!datasComAgendamentos.some(data => data > dataSelecionada)}
                >
                  Próxima →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtros por Funcionário melhorados */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1.5 bg-green-100 rounded-lg">
            <Users className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Filtrar por Funcionário</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={funcionarioSelecionado === 'todos' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFuncionarioSelecionado('todos')}
            className={`flex items-center gap-2 ${funcionarioSelecionado === 'todos' ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'}`}
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
            const isSelected = funcionarioSelecionado === funcionario.id
            return (
              <Button
                key={funcionario.id}
                variant="outline"
                size="sm"
                onClick={() => setFuncionarioSelecionado(funcionario.id)}
                className={`flex items-center gap-2 transition-all ${
                  isSelected 
                    ? 'ring-2 ring-offset-1 shadow-md' 
                    : 'hover:shadow-sm hover:scale-105'
                }`}
                style={{
                  backgroundColor: isSelected ? funcionario.cor : 'transparent',
                  borderColor: funcionario.cor,
                  color: isSelected ? 'white' : funcionario.cor,
                  ringColor: isSelected ? funcionario.cor : 'transparent'
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: funcionario.cor }}
                />
                <span className="font-medium">{funcionario.nome}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100'}`}
                >
                  {tarefasFuncionario}
                </Badge>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Seletor de visualização melhorado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Filter className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">Modo de Visualização</span>
        </div>
        
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { value: 'timeline', label: 'Timeline', icon: '📊' },
            { value: 'grade', label: 'Grade', icon: '📋' },
            { value: 'grade-vertical', label: 'Vertical', icon: '📑' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={visualizacao === option.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setVisualizacao(option.value)}
              className={`flex items-center gap-2 ${
                visualizacao === option.value 
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400 font-medium' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-600/50 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </div>
        
        {/* Botão para resetar larguras das colunas - só aparece na grade vertical e se houver larguras personalizadas */}
        {visualizacao === 'grade-vertical' && Object.keys(columnWidths).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetColumnWidths}
            className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 ml-2"
            title="Resetar larguras das colunas para o padrão"
          >
            🔄 Resetar Colunas
          </Button>
        )}
      </div>


      {/* Resumo do dia melhorado */}
      {dadosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-blue-500 rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-700">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {dadosFiltrados.length}
                  </p>
                  <p className="text-xs text-blue-600/70">agendamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-green-500 rounded-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-700">Ativos</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {new Set(dadosFiltrados.map(item => item.funcionario)).size}
                  </p>
                  <p className="text-xs text-green-600/70">funcionários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-purple-500 rounded-lg">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-purple-700">Tempo</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(dadosFiltrados.reduce((acc, item) => {
                      const tarefa = tarefas?.find(t => t.id === item.tarefa)
                      return acc + (tarefa?.tempo_estimado || 30)
                    }, 0) / 60)}h
                  </p>
                  <p className="text-xs text-purple-600/70">estimado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-emerald-500 rounded-lg">
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <span className="text-emerald-500 text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-emerald-700">Concluídas</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {dadosFiltrados.filter(item => item.status === 'concluida').length}
                  </p>
                  <p className="text-xs text-emerald-600/70">finalizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legenda de categorias melhorada */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-gray-500 rounded-lg">
              <span className="text-white text-sm">🏷️</span>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-800">Legenda de Categorias</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(categoriasCores).map(([categoria, cor]) => (
              <div key={categoria} className="flex items-center gap-2 bg-white rounded-lg p-2 border hover:shadow-sm transition-all">
                <div className={`w-3 h-3 rounded-full ${cor} shadow-sm`} />
                <span className="text-sm font-medium capitalize text-gray-700">{categoria}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualização */}
      {visualizacao === 'timeline' ? <TimelineView /> : 
       visualizacao === 'grade' ? <GridView /> : 
       <GridVerticalView />}

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

