import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, User, Users, Filter, Calendar, ChevronLeft, ChevronRight, Grid3X3, List, BarChart3, CheckCircle2, X } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
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
  'interno': 'bg-pink-500',
  'indisponibilidade': 'bg-gray-400'
}

function Cronograma() {
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('todos')
  const [visualizacao, setVisualizacao] = useState('timeline')
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  
  // Estados para seleção múltipla
  const [modoSelecaoMultipla, setModoSelecaoMultipla] = useState(false)
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState(new Set())
  
  const showSuccess = (message) => alert('Sucesso: ' + message)
  const showError = (message) => alert('Erro: ' + message)
  
  // Estado para larguras das colunas redimensionáveis
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem('cronograma-column-widths')
    return saved ? JSON.parse(saved) : {}
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumn, setResizingColumn] = useState(null)

  // Hook de personalização
  const { getClassesDensidade, getCoresTema } = usePersonalizacao()

  // Salvar larguras das colunas no localStorage
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      console.log('💾 Salvando larguras das colunas:', columnWidths)
      localStorage.setItem('cronograma-column-widths', JSON.stringify(columnWidths))
    }
  }, [columnWidths])

  // Funções para redimensionamento de colunas
  const handleMouseDown = (e, columnId) => {
    console.log('🖱️ Mouse down iniciado:', { columnId, currentWidth: columnWidths[columnId] || 80 })
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizingColumn(columnId)
    
    const startX = e.clientX
    const startWidth = columnWidths[columnId] || 80
    
    const handleMouseMove = (e) => {
      const newWidth = Math.max(60, startWidth + (e.clientX - startX))
      console.log('🖱️ Mouse move:', { columnId, newWidth, startX, currentX: e.clientX })
      setColumnWidths(prev => ({
        ...prev,
        [columnId]: newWidth
      }))
    }
    
    const handleMouseUp = () => {
      console.log('🖱️ Mouse up:', { columnId, finalWidth: columnWidths[columnId] })
      setIsResizing(false)
      setResizingColumn(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const getColumnWidth = (columnId) => {
    const width = columnWidths[columnId] || 80
    // console.log('📏 Largura da coluna:', { columnId, width, allWidths: columnWidths })
    return width
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

  // Funções para seleção múltipla
  const toggleSelecaoTarefa = (tarefaId) => {
    const novaSelecao = new Set(tarefasSelecionadas)
    if (novaSelecao.has(tarefaId)) {
      novaSelecao.delete(tarefaId)
    } else {
      novaSelecao.add(tarefaId)
    }
    setTarefasSelecionadas(novaSelecao)
  }

  const marcarTodasSelecionadasComoConcluidas = async () => {
    if (tarefasSelecionadas.size === 0) {
      showError('Nenhuma tarefa selecionada')
      return
    }

    try {
      const agora = new Date()
      const promises = Array.from(tarefasSelecionadas).map(tarefaId => {
        const tarefa = dadosFiltrados.find(t => t.id === tarefaId)
        if (tarefa && tarefa.status !== 'concluida') {
          return supabaseService.updateAgendamento(tarefaId, {
            status: 'concluida',
            tempo_fim: agora.toISOString(),
            tempo_real: tarefa.tarefaInfo?.tempo_estimado || 30
          })
        }
        return Promise.resolve()
      })

      await Promise.all(promises)
      showSuccess(`${tarefasSelecionadas.size} tarefa(s) marcada(s) como concluída(s)!`)
      setTarefasSelecionadas(new Set())
      setModoSelecaoMultipla(false)
      refetchAgenda()
    } catch (error) {
      showError('Erro ao marcar tarefas como concluídas: ' + error.message)
    }
  }

  const cancelarSelecaoMultipla = () => {
    setTarefasSelecionadas(new Set())
    setModoSelecaoMultipla(false)
  }

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    if (!agenda) return []
    
    // Expor dados para debug
    window.__CRONOGRAMA_DEBUG_DATA__ = agenda
    
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

  // Horários de 8h às 19h30
  const horarios = useMemo(() => {
    const todosHorarios = []
    for (let h = 8; h <= 19; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hora = h.toString().padStart(2, '0')
        const minuto = m.toString().padStart(2, '0')
        todosHorarios.push(`${hora}:${minuto}`)
        
        if (h === 19 && m === 30) break
      }
    }
    return todosHorarios
  }, [])

  // Organizar dados por funcionário e horário
  const cronogramaPorFuncionario = useMemo(() => {
    if (!funcionarios || !tarefas) return {}
    
    const resultado = {}
    
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
        const tarefaData = {
          ...item,
          tarefaInfo: tarefa
        }
        
        // Se tem horários ocupados (agendamento longo), marca todos os slots
        if (item.horarios_ocupados && item.horarios_ocupados.length > 1) {
          item.horarios_ocupados.forEach((horario, index) => {
            if (resultado[item.funcionario].tarefas[horario] === null) {
              resultado[item.funcionario].tarefas[horario] = {
                ...tarefaData,
                isPartOfLongerTask: true,
                isFirstSlot: index === 0,
                isLastSlot: index === item.horarios_ocupados.length - 1,
                totalSlots: item.horarios_ocupados.length,
                slotIndex: index
              }
            }
          })
        } else {
          // Agendamento normal de 30min
          resultado[item.funcionario].tarefas[item.horario] = tarefaData
        }
      }
    })
    
    return resultado
  }, [funcionarios, tarefas, dadosFiltrados, horarios, funcionarioSelecionado])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cronograma</h1>
        </div>
        <Loading />
      </div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Cronograma</h1>
          <Button onClick={refetchAll}>Tentar Novamente</Button>
        </div>
        <ErrorMessage message={error?.message || 'Erro ao carregar dados'} />
      </div>
    )
  }

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
    
    // Verificar se é parte de um agendamento longo
    const isLongTask = tarefa.isPartOfLongerTask
    const isFirstSlot = tarefa.isFirstSlot
    const isLastSlot = tarefa.isLastSlot
    const totalSlots = tarefa.totalSlots || 1
    const duracao = tarefa.duracao || 30



    const toggleTarefa = async (e) => {
      e.stopPropagation()
      
      // Se estiver no modo de seleção múltipla, apenas seleciona/deseleciona
      if (modoSelecaoMultipla) {
        toggleSelecaoTarefa(tarefa.id)
        return
      }

      // Comportamento normal - marca/desmarca individualmente
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

    // Para agendamentos longos, só mostrar conteúdo no primeiro slot
    if (isLongTask && !isFirstSlot) {
      return (
        <div 
          className={`p-1 ${corCategoria} rounded text-white text-xs min-h-8 shadow-sm transition-all cursor-pointer relative ${
            isCompleted ? 'opacity-75 ring-1 ring-green-400' : ''
          } border-l-2 border-white/30`}
          onClick={() => handleEditAgendamento(tarefa)}
          title={`Continuação: ${tarefa.tarefaInfo?.nome || tarefa.tarefa} (${duracao}min)`}
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-xs opacity-60">...</span>
          </div>
        </div>
      )
    }

    return (
      <div 
        className={`p-1 ${corCategoria} rounded text-white text-xs min-h-8 shadow-sm hover:shadow-md transition-all cursor-pointer group relative ${
          isCompleted ? 'opacity-75 ring-1 ring-green-400' : ''
        } ${isLongTask ? 'border-r-2 border-white/30' : ''}`}
        onClick={() => handleEditAgendamento(tarefa)}
        onContextMenu={(e) => {
          e.preventDefault()
          if (window.confirm(`Deseja excluir o agendamento "${tarefa.tarefaInfo?.nome || tarefa.tarefa}" às ${tarefa.horario}?`)) {
            handleDeleteAgendamento(tarefa)
          }
        }}
        title={`Clique para editar • Clique direito para excluir${isLongTask ? ` • Duração: ${duracao}min` : ''}`}
      >
        {/* Checkbox - só no primeiro slot */}
        <button
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded border flex items-center justify-center transition-all ${
            modoSelecaoMultipla && tarefasSelecionadas.has(tarefa.id)
              ? 'bg-blue-500 border-blue-500 text-white'
              : isCompleted 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-white/50 hover:border-white hover:bg-white/20'
          }`}
          onClick={toggleTarefa}
          title={
            modoSelecaoMultipla 
              ? (tarefasSelecionadas.has(tarefa.id) ? 'Desselecionar' : 'Selecionar')
              : (isCompleted ? 'Marcar como pendente' : 'Marcar como concluída')
          }
        >
          {modoSelecaoMultipla && tarefasSelecionadas.has(tarefa.id) && <span className="text-xs">✓</span>}
          {!modoSelecaoMultipla && isCompleted && <span className="text-xs">✓</span>}
        </button>

        {/* Conteúdo da tarefa */}
        <div className="ml-4 pr-6">
          <div className={`font-medium leading-tight break-words ${isCompleted ? 'line-through' : ''}`}>
            {tarefa.tarefaInfo?.nome || tarefa.tarefa}
            {isLongTask && <span className="ml-1 text-xs opacity-75">({duracao}min)</span>}
            {tarefa.tarefaInfo?.computar_horas === false && (
              <span className="ml-1 text-xs opacity-60" title="Não computado nas horas de trabalho">⏸️</span>
            )}
          </div>
          <div className="text-xs opacity-75 leading-tight">
            {isLongTask ? `${tarefa.horario} - ${tarefa.horarios_ocupados?.[tarefa.horarios_ocupados.length - 1] || tarefa.horario}` : `${duracao}min`}
            {tarefa.tarefaInfo?.computar_horas === false && (
              <span className="ml-1 opacity-60">(não computado)</span>
            )}
          </div>
        </div>
        
        {/* Botão de deletar - só no primeiro slot */}
        <button
          className="absolute top-0.5 right-0.5 opacity-70 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs transition-all hover:scale-110"
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
                {Object.values(funcionario.tarefas).filter(t => t !== null && t.tarefaInfo?.computar_horas !== false).length} tarefas
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
                      <TarefaCard 
                        tarefa={funcionario.tarefas[horario]} 
                        horario={horario} 
                        funcionarioId={funcionario.id} 
                      />
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
    <Card className={isResizing ? 'select-none' : ''}>
      <CardHeader>
        <CardTitle>Grade Vertical de Horários</CardTitle>
        <CardDescription>
          Visualização em grade vertical com horários nas linhas
          {isResizing && <span className="text-blue-600 ml-2">(Redimensionando...)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
        <div className="overflow-x-auto" style={{ position: 'relative' }}>
          <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed', minWidth: '800px' }}>
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50 text-center font-medium text-xs" style={{ width: '120px' }}>
                  Horário
                </th>
                {Object.values(cronogramaPorFuncionario).map(funcionario => (
                  <th 
                    key={funcionario.id} 
                    className={`border border-gray-200 p-1 bg-gray-50 text-center font-medium text-xs relative overflow-visible ${
                      resizingColumn === funcionario.id ? 'bg-blue-50' : ''
                    }`}
                    style={{ 
                      width: `${getColumnWidth(funcionario.id)}px`, 
                      minWidth: '60px',
                      maxWidth: `${getColumnWidth(funcionario.id)}px`
                    }}
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
                      className={`absolute top-0 right-0 w-3 h-full cursor-col-resize transition-all duration-200 z-20 ${
                        resizingColumn === funcionario.id 
                          ? 'bg-blue-500 shadow-lg' 
                          : 'bg-gray-300 hover:bg-blue-400 opacity-50 hover:opacity-100'
                      }`}
                      onMouseDown={(e) => handleMouseDown(e, funcionario.id)}
                      title="Arrastar para redimensionar coluna"
                      style={{ 
                        right: '-1px',
                        borderRadius: '0 2px 2px 0'
                      }}
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
                      <TarefaCard 
                        tarefa={funcionario.tarefas[horario]} 
                        horario={horario} 
                        funcionarioId={funcionario.id} 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Botão para resetar larguras das colunas */}
        {visualizacao === 'vertical' && Object.keys(columnWidths).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetColumnWidths}
            className="text-xs text-gray-600 hover:text-gray-800 border-gray-300 mt-2"
            title="Resetar larguras das colunas para o padrão"
          >
            🔄 Resetar Colunas
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header premium com design igual ao calendário */}
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
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-lg flex items-center gap-3">
                      Cronograma
                      <Clock className="w-6 h-6 animate-pulse" />
                    </h2>
                    <p className="text-blue-100 text-lg font-medium mt-1">
                      Gerencie agendamentos e visualize a agenda da equipe
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                    <Calendar className="w-5 h-5 text-white/90" />
                    <span className="text-white font-semibold">
                      {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 px-3 py-1 rounded-full font-semibold">
                    {dadosFiltrados.length} agendamento{dadosFiltrados.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              
              {/* Navegação de data premium */}
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-2 shadow-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDataSelecionada(new Date().toISOString().split('T')[0])}
                  className="text-white hover:bg-white/20 rounded-xl px-4 py-2 font-medium"
                >
                  Hoje
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const data = new Date(dataSelecionada)
                    data.setDate(data.getDate() - 1)
                    setDataSelecionada(data.toISOString().split('T')[0])
                  }}
                  className="text-white hover:bg-white/20 rounded-xl h-10 w-10 p-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="font-bold text-white min-w-[160px] text-center px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-white/50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const data = new Date(dataSelecionada)
                    data.setDate(data.getDate() + 1)
                    setDataSelecionada(data.toISOString().split('T')[0])
                  }}
                  className="text-white hover:bg-white/20 rounded-xl h-10 w-10 p-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Linha 2: Filtros integrados */}
            <div className="flex flex-col xl:flex-row gap-4">


              {/* Filtros por Funcionário integrados */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  variant={funcionarioSelecionado === 'todos' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFuncionarioSelecionado('todos')}
                  className={`text-white hover:bg-white/20 flex items-center justify-center ${funcionarioSelecionado === 'todos' ? 'bg-white/30' : ''}`}
                >
                  <Users className="w-4 h-4 mr-1" />
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
                      variant="ghost"
                      size="sm"
                      onClick={() => setFuncionarioSelecionado(funcionario.id)}
                      className="text-white hover:bg-white/20 flex items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? funcionario.cor : 'rgba(255,255,255,0.1)',
                        borderColor: funcionario.cor,
                        color: 'white'
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      {funcionario.nome} ({tarefasFuncionario})
                    </Button>
                  )
                })}
              </div>

              {/* Modo de Visualização integrado */}
              <div className="flex gap-1 bg-white/10 rounded-lg p-1 items-center">
                <Button
                  variant={visualizacao === 'timeline' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualizacao('timeline')}
                  className={`text-white hover:bg-white/20 flex items-center justify-center ${visualizacao === 'timeline' ? 'bg-white/30' : ''}`}
                >
                  <List className="w-4 h-4 mr-1" />
                  Timeline
                </Button>
                <Button
                  variant={visualizacao === 'grade' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualizacao('grade')}
                  className={`text-white hover:bg-white/20 flex items-center justify-center ${visualizacao === 'grade' ? 'bg-white/30' : ''}`}
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Grade
                </Button>
                <Button
                  variant={visualizacao === 'vertical' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setVisualizacao('vertical')}
                  className={`text-white hover:bg-white/20 flex items-center justify-center ${visualizacao === 'vertical' ? 'bg-white/30' : ''}`}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Grade Vertical
                </Button>
              </div>

              {/* Controles de Seleção Múltipla */}
              <div className="flex gap-1 bg-white/10 rounded-lg p-1 items-center">
                {!modoSelecaoMultipla ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setModoSelecaoMultipla(true)}
                    className="text-white hover:bg-white/20 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Seleção Múltipla
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={marcarTodasSelecionadasComoConcluidas}
                      className="text-white hover:bg-green-500/20 bg-green-500/10 flex items-center justify-center"
                      disabled={tarefasSelecionadas.size === 0}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Concluir ({tarefasSelecionadas.size})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelarSelecaoMultipla}
                      className="text-white hover:bg-red-500/20 bg-red-500/10 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>

              {/* Navegação entre datas */}
              {datasComAgendamentos.length > 1 && (
                <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                  <span className="text-xs text-white/80 px-2 flex items-center">Navegar:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dataAnteriorComAgendamentos}
                    className="text-white hover:bg-white/20 text-xs px-2 flex items-center justify-center"
                    disabled={!datasComAgendamentos.some(data => data < dataSelecionada)}
                  >
                    ← Anterior
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={proximaDataComAgendamentos}
                    className="text-white hover:bg-white/20 text-xs px-2 flex items-center justify-center"
                    disabled={!datasComAgendamentos.some(data => data > dataSelecionada)}
                  >
                    Próxima →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>



      {/* Resumo do dia */}
      {dadosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {dadosFiltrados.length}
              </p>
              <p className="text-xs text-gray-600">agendamentos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Ativos</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {new Set(dadosFiltrados.map(item => item.funcionario)).size}
              </p>
              <p className="text-xs text-gray-600">funcionários</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Tempo</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(dadosFiltrados.reduce((acc, item) => {
                  const tarefa = tarefas?.find(t => t.id === item.tarefa)
                  return acc + (tarefa?.tempo_estimado || 30)
                }, 0) / 60)}h
              </p>
              <p className="text-xs text-gray-600">estimado</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Concluídas</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {dadosFiltrados.filter(item => item.status === 'concluida').length}
              </p>
              <p className="text-xs text-gray-600">finalizadas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Legenda de categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🏷️</span>
            Legenda de Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(categoriasCores).map(([categoria, cor]) => (
              <div key={categoria} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${cor}`} />
                <span className="text-sm capitalize">{categoria}</span>
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