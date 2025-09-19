import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, User, Users, Filter, Calendar, ChevronLeft, ChevronRight, Grid3X3, List, BarChart3, CheckCircle2, X, Move, ArrowLeft, ArrowRight, Shuffle, RotateCcw, Trash2 } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
import AgendamentoForm from './forms/AgendamentoForm'
import supabaseService from '../services/supabase'
import userPreferencesService from '../services/userPreferences'
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
  const [visualizacao, setVisualizacao] = useState('vertical')
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0])
  
  // Estado para ordem das colunas de funcionários
  const [ordemColunas, setOrdemColunas] = useState([])

  // Estados para seleção múltipla
  const [modoSelecaoMultipla, setModoSelecaoMultipla] = useState(false)
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState(new Set())

  // Estados para drag and drop
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverCell, setDragOverCell] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // Estados para duplicação de tarefas
  const [modalDuplicacao, setModalDuplicacao] = useState(false)
  const [datasDuplicacao, setDatasDuplicacao] = useState([])
  const [duplicandoTarefas, setDuplicandoTarefas] = useState(false)

  const showSuccess = (message) => alert('Sucesso: ' + message)
  const showError = (message) => alert('Erro: ' + message)

  // Estado para larguras das colunas redimensionáveis
  const [columnWidths, setColumnWidths] = useState({})
  const [isResizing, setIsResizing] = useState(false)
  const [resizingColumn, setResizingColumn] = useState(null)

  // Hook de personalização
  const { getClassesDensidade, getCoresTema } = usePersonalizacao()

  // Limpar estilos quando não está mais arrastando
  useEffect(() => {
    if (!isDragging) {
      // Remover atributo data-dragging de todos os elementos
      const taskCards = document.querySelectorAll('.task-card[data-dragging="true"]')
      taskCards.forEach(card => {
        card.removeAttribute('data-dragging')
      })
    }
  }, [isDragging])

  // Carregar preferências da nuvem na inicialização
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Carregar larguras das colunas
        const widths = await userPreferencesService.loadColumnWidths()
        if (Object.keys(widths).length > 0) {
          setColumnWidths(widths)
        }

        // Carregar ordem das colunas
        const order = await userPreferencesService.loadColumnOrder()
        if (order.length > 0) {
          setOrdemColunas(order)
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
      }
    }

    loadPreferences()
  }, [])

  // Salvar larguras das colunas na nuvem
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0) {
      console.log('💾 Salvando larguras das colunas na nuvem:', columnWidths)
      userPreferencesService.saveColumnWidths(columnWidths)
    }
  }, [columnWidths])

  // Salvar ordem das colunas na nuvem
  useEffect(() => {
    if (ordemColunas.length > 0) {
      console.log('💾 Salvando ordem das colunas na nuvem:', ordemColunas)
      userPreferencesService.saveColumnOrder(ordemColunas)
    }
  }, [ordemColunas])

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

  // Funções para trocar colunas
  const trocarColunas = (indiceA, indiceB) => {
    const novaOrdem = [...ordemColunas]
    const temp = novaOrdem[indiceA]
    novaOrdem[indiceA] = novaOrdem[indiceB]
    novaOrdem[indiceB] = temp
    setOrdemColunas(novaOrdem)
  }

  const moverColuna = (funcionarioId, direcao) => {
    const indiceAtual = ordemColunas.indexOf(funcionarioId)
    if (indiceAtual === -1) return

    const novoIndice = direcao === 'esquerda' ? indiceAtual - 1 : indiceAtual + 1
    
    if (novoIndice >= 0 && novoIndice < ordemColunas.length) {
      trocarColunas(indiceAtual, novoIndice)
    }
  }

  const resetarOrdemColunas = async () => {
    if (funcionarios) {
      const ordemPadrao = funcionarios
        .filter(f => f.id && f.id.trim() !== '')
        .map(f => f.id)
      setOrdemColunas(ordemPadrao)
      
      // Limpar da nuvem e localStorage
      await userPreferencesService.saveColumnOrder(ordemPadrao)
      localStorage.removeItem('cronograma-ordem-colunas')
    }
  }

  const resetColumnWidths = async () => {
    setColumnWidths({})
    await userPreferencesService.saveColumnWidths({})
    localStorage.removeItem('cronograma-column-widths')
  }

  const syncPreferences = async () => {
    try {
      await userPreferencesService.syncAllPreferences()
      alert('✅ Preferências sincronizadas com a nuvem!')
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      alert('❌ Erro ao sincronizar preferências')
    }
  }

  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios, error: errorFuncionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, error: errorTarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, error: errorAgenda, refetch: refetchAgenda } = useAgenda()

  // Inicializar ordem das colunas quando funcionários carregam
  useEffect(() => {
    if (funcionarios && funcionarios.length > 0 && ordemColunas.length === 0) {
      const ordemInicial = funcionarios
        .filter(f => f.id && f.id.trim() !== '')
        .map(f => f.id)
      setOrdemColunas(ordemInicial)
    }
  }, [funcionarios, ordemColunas.length])

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
    console.log('🔍 Dados do agendamento clicado:', agendamento)
    
    const agendamentoFormatado = {
      ...agendamento,
      funcionario_id: agendamento.funcionario || agendamento.funcionario_id,
      tarefa_id: agendamento.tarefa || agendamento.tarefa_id
    }
    
    console.log('📝 Agendamento formatado para o modal:', agendamentoFormatado)
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

  // Funções para duplicação de tarefas
  const handleDuplicarTarefas = () => {
    const tarefasDoDia = dadosFiltrados.filter(tarefa => tarefa.data === dataSelecionada)

    if (tarefasDoDia.length === 0) {
      showError('Não há tarefas para duplicar neste dia')
      return
    }

    setModalDuplicacao(true)
  }

  const handleConfirmarDuplicacao = async () => {
    if (datasDuplicacao.length === 0) {
      showError('Selecione pelo menos uma data para duplicar')
      return
    }

    setDuplicandoTarefas(true)

    try {
      const tarefasDoDia = dadosFiltrados.filter(tarefa => tarefa.data === dataSelecionada)
      const promises = []

      for (const novaData of datasDuplicacao) {
        for (const tarefa of tarefasDoDia) {
          // Verificar se já existe tarefa no mesmo horário e funcionário na data destino
          const tarefaExistente = agenda?.find(a =>
            a.data === novaData &&
            a.horario === tarefa.horario &&
            a.funcionario === tarefa.funcionario
          )

          if (!tarefaExistente) {
            const novaTarefa = {
              tarefa_id: tarefa.tarefa,
              funcionario_id: tarefa.funcionario,
              data: novaData,
              horario: tarefa.horario,
              status: 'nao_iniciada',
              observacoes: tarefa.observacoes || null
            }
            promises.push(supabaseService.createAgendamento(novaTarefa))
          }
        }
      }

      await Promise.all(promises)

      const totalDuplicadas = promises.length
      showSuccess(`${totalDuplicadas} tarefa(s) duplicada(s) para ${datasDuplicacao.length} dia(s)!`)

      setModalDuplicacao(false)
      setDatasDuplicacao([])
      refetchAgenda()
    } catch (error) {
      showError('Erro ao duplicar tarefas: ' + error.message)
    } finally {
      setDuplicandoTarefas(false)
    }
  }

  const adicionarDataDuplicacao = (data) => {
    if (!datasDuplicacao.includes(data) && data !== dataSelecionada) {
      setDatasDuplicacao([...datasDuplicacao, data])
    }
  }

  const removerDataDuplicacao = (data) => {
    setDatasDuplicacao(datasDuplicacao.filter(d => d !== data))
  }

  const gerarProximosDias = (quantidade = 7) => {
    const dias = []
    const hoje = new Date(dataSelecionada)

    for (let i = 1; i <= quantidade; i++) {
      const proximoDia = new Date(hoje)
      proximoDia.setDate(hoje.getDate() + i)
      dias.push(proximoDia.toISOString().split('T')[0])
    }

    return dias
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

  const excluirTarefasSelecionadas = async () => {
    if (tarefasSelecionadas.size === 0) {
      showError('Nenhuma tarefa selecionada')
      return
    }

    // Confirmar exclusão
    const confirmacao = window.confirm(
      `Deseja realmente excluir ${tarefasSelecionadas.size} agendamento(s) selecionado(s)?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmacao) {
      return
    }

    try {
      const promises = Array.from(tarefasSelecionadas).map(tarefaId => {
        return supabaseService.deleteAgendamento(tarefaId)
      })

      await Promise.all(promises)
      showSuccess(`${tarefasSelecionadas.size} agendamento(s) excluído(s) com sucesso!`)
      setTarefasSelecionadas(new Set())
      setModoSelecaoMultipla(false)
      refetchAgenda()
    } catch (error) {
      showError('Erro ao excluir agendamentos: ' + error.message)
    }
  }

  // Funções de drag and drop
  const handleDragStart = (e, tarefa) => {
    console.log('🎯 Iniciando drag:', tarefa)
    setDraggedTask(tarefa)
    setIsDragging(true)

    // Configurar dados do drag
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: tarefa.id,
      horario: tarefa.horario,
      funcionario: tarefa.funcionario,
      tarefa: tarefa.tarefa
    }))

    // Marcar elemento como sendo arrastado
    e.target.setAttribute('data-dragging', 'true')
  }

  const handleDragEnd = (e) => {
    console.log('🏁 Finalizando drag')

    // Limpar estados
    setDraggedTask(null)
    setDragOverCell(null)
    setIsDragging(false)

    // Remover atributo de drag do elemento
    e.target.removeAttribute('data-dragging')
  }

  const handleDragOver = (e, horario, funcionarioId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    const cellKey = `${funcionarioId}-${horario}`
    if (dragOverCell !== cellKey) {
      setDragOverCell(cellKey)
    }
  }

  const handleDragLeave = (e) => {
    // Só limpar se realmente saiu da célula
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCell(null)
    }
  }

  const handleDrop = async (e, novoHorario, novoFuncionarioId) => {
    e.preventDefault()
    setDragOverCell(null)

    if (!draggedTask) return

    console.log('📦 Drop realizado:', {
      tarefa: draggedTask,
      novoHorario,
      novoFuncionarioId,
      horarioOriginal: draggedTask.horario,
      funcionarioOriginal: draggedTask.funcionario
    })

    // Verificar se houve mudança
    if (draggedTask.horario === novoHorario && draggedTask.funcionario === novoFuncionarioId) {
      console.log('ℹ️ Sem mudança, cancelando')
      return
    }

    // Verificar se já existe tarefa no destino
    const tarefaExistente = cronogramaPorFuncionario[novoFuncionarioId]?.tarefas[novoHorario]
    if (tarefaExistente) {
      const confirmar = window.confirm(
        `Já existe uma tarefa "${tarefaExistente.tarefaInfo?.nome}" às ${novoHorario} para ${cronogramaPorFuncionario[novoFuncionarioId]?.nome}.\n\nDeseja substituir?`
      )
      if (!confirmar) return

      // Deletar tarefa existente
      try {
        await supabaseService.deleteAgendamento(tarefaExistente.id)
      } catch (error) {
        showError('Erro ao remover tarefa existente: ' + error.message)
        return
      }
    }

    try {
      // Atualizar o agendamento
      await supabaseService.updateAgendamento(draggedTask.id, {
        horario: novoHorario,
        funcionario_id: novoFuncionarioId,
        // Manter outros dados
        tarefa_id: draggedTask.tarefa,
        data: draggedTask.data || dataSelecionada,
        status: draggedTask.status || 'nao_iniciada'
      })

      showSuccess(`Tarefa movida para ${cronogramaPorFuncionario[novoFuncionarioId]?.nome} às ${novoHorario}`)

      // Adicionar animação de sucesso
      const targetCell = document.querySelector(`[data-cell="${novoFuncionarioId}-${novoHorario}"]`)
      if (targetCell) {
        targetCell.classList.add('drop-success')
        setTimeout(() => targetCell.classList.remove('drop-success'), 500)
      }

      refetchAgenda()
    } catch (error) {
      showError('Erro ao mover tarefa: ' + error.message)
    }
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

  // Funcionários ordenados pela ordem das colunas
  const funcionariosOrdenados = useMemo(() => {
    if (!funcionarios || ordemColunas.length === 0) return []
    
    const funcionariosFiltrados = funcionarioSelecionado === 'todos'
      ? funcionarios.filter(f => f.id && f.id.trim() !== '')
      : funcionarios.filter(f => f.id === funcionarioSelecionado)

    // Ordenar de acordo com a ordem das colunas
    return ordemColunas
      .map(id => funcionariosFiltrados.find(f => f.id === id))
      .filter(Boolean) // Remove undefined
      .concat(funcionariosFiltrados.filter(f => !ordemColunas.includes(f.id))) // Adiciona novos funcionários
  }, [funcionarios, ordemColunas, funcionarioSelecionado])

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
    const cellKey = `${funcionarioId}-${horario}`
    const isDropTarget = dragOverCell === cellKey
    const isValidDropTarget = draggedTask && (draggedTask.horario !== horario || draggedTask.funcionario !== funcionarioId)

    if (!tarefa) {
      return (
        <div
          className={`grid-cell text-gray-300 text-xs text-center h-8 flex items-center justify-center bg-gray-50/30 dark:bg-gray-700/20 rounded border border-dashed border-gray-200/50 dark:border-gray-600/30 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-600/40 transition-all group opacity-30 hover:opacity-60 ${isDropTarget && isValidDropTarget ? 'drop-zone-valid valid-drop-indicator' : ''
            } ${isDragging ? 'no-select' : ''}`}
          onClick={() => handleAddAgendamento(horario, funcionarioId)}
          onDragOver={(e) => handleDragOver(e, horario, funcionarioId)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, horario, funcionarioId)}
          title="Clique para adicionar tarefa • Arraste tarefas aqui"
        >
          <span className={`text-gray-300 group-hover:text-gray-500 text-xs ${isDropTarget && isValidDropTarget ? 'text-blue-500' : ''}`}>
            {isDropTarget && isValidDropTarget ? '📥' : '+'}
          </span>
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
          className={`p-1 ${corCategoria} rounded text-white text-xs min-h-8 shadow-sm transition-all cursor-pointer relative ${isCompleted ? 'opacity-75 ring-1 ring-green-400' : ''
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
        className={`task-card p-1 ${corCategoria} rounded text-white text-xs min-h-8 shadow-sm hover:shadow-md transition-all group relative ${isCompleted ? 'ring-1 ring-green-400' : ''
          } ${isLongTask ? 'border-r-2 border-white/30' : ''
          } ${isDropTarget && isValidDropTarget ? 'drop-zone-valid' : ''} ${isDragging ? 'no-select' : ''}`}
        data-completed={isCompleted ? 'true' : 'false'}
        draggable={!modoSelecaoMultipla}
        onDragStart={(e) => handleDragStart(e, tarefa)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, horario, funcionarioId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, horario, funcionarioId)}
        onClick={() => handleEditAgendamento(tarefa)}
        onContextMenu={(e) => {
          e.preventDefault()
          if (window.confirm(`Deseja excluir o agendamento "${tarefa.tarefaInfo?.nome || tarefa.tarefa}" às ${tarefa.horario}?`)) {
            handleDeleteAgendamento(tarefa)
          }
        }}
        title={`Arraste para mover • Clique para editar • Clique direito para excluir${isLongTask ? ` • Duração: ${duracao}min` : ''}`}
      >
        {/* Checkbox - só no primeiro slot */}
        <button
          className={`absolute top-0.5 left-0.5 w-3 h-3 rounded border flex items-center justify-center transition-all ${modoSelecaoMultipla && tarefasSelecionadas.has(tarefa.id)
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

        {/* Ícone de drag - só no primeiro slot */}
        {!modoSelecaoMultipla && (
          <div className="drag-handle absolute top-0.5 right-5 opacity-0 group-hover:opacity-70 transition-opacity">
            <Move className="w-3 h-3 text-white/80" />
          </div>
        )}

        {/* Conteúdo da tarefa */}
        <div className="ml-4 pr-8">
          <div className={`font-medium leading-tight break-words ${isCompleted ? 'line-through' : ''}`}>
            {tarefa.tarefaInfo?.nome || tarefa.tarefa}
            {tarefa.tarefaInfo?.computar_horas === false && (
              <span className="ml-1 text-xs opacity-60" title="Não computado nas horas de trabalho">⏸️</span>
            )}
          </div>
          {tarefa.tarefaInfo?.computar_horas === false && (
            <div className="text-xs opacity-60 leading-tight">
              (não computado)
            </div>
          )}
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Grade Vertical de Horários</CardTitle>
            <CardDescription>
              Visualização em grade vertical com horários nas linhas
              {isResizing && <span className="text-blue-600 ml-2">(Redimensionando...)</span>}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetarOrdemColunas}
              className="text-xs"
              title="Resetar ordem original das colunas"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar Ordem
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetColumnWidths}
              className="text-xs"
              title="Resetar larguras das colunas"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetar Larguras
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={syncPreferences}
              className="text-xs"
              title="Sincronizar preferências com a nuvem"
            >
              <Shuffle className="w-3 h-3 mr-1" />
              Sincronizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
        <div className="overflow-x-auto" style={{ position: 'relative' }}>
          <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed', minWidth: '800px' }}>
            <thead>
              <tr>
                <th className="border border-gray-200 p-2 bg-gray-50 text-center font-medium text-xs" style={{ width: '120px' }}>
                  Horário
                </th>
                {funcionariosOrdenados.map((funcionario, index) => (
                  <th
                    key={funcionario.id}
                    className="border border-gray-200 p-1 bg-gray-50 text-center font-medium text-xs relative"
                    style={{ width: `${getColumnWidth(funcionario.id)}px`, minWidth: '60px' }}
                  >
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="flex items-center justify-center space-x-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: funcionario.cor }}
                        />
                        <span className="text-xs leading-tight">{funcionario.nome}</span>
                      </div>
                      
                      {/* Controles de troca de coluna */}
                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moverColuna(funcionario.id, 'esquerda')}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover coluna para a esquerda"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                        </button>
                        <button
                          onClick={() => moverColuna(funcionario.id, 'direita')}
                          disabled={index === funcionariosOrdenados.length - 1}
                          className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover coluna para a direita"
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Handle de redimensionamento */}
                    <div
                      className={`absolute top-0 right-0 w-1 h-full cursor-col-resize ${resizingColumn === funcionario.id
                        ? 'bg-blue-500'
                        : 'hover:bg-gray-400'
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
                  {funcionariosOrdenados.map(funcionario => (
                    <td
                      key={funcionario.id}
                      className="border border-gray-200 p-1"
                      style={{ width: `${getColumnWidth(funcionario.id)}px` }}
                      data-cell={`${funcionario.id}-${horario}`}
                    >
                      <TarefaCard
                        key={`task-${funcionario.id}-${horario}`}
                        tarefa={cronogramaPorFuncionario[funcionario.id]?.tarefas[horario]}
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
      {/* Overlay durante drag */}
      {isDragging && <div className="drag-overlay" />}

      {/* Feedback visual durante drag */}
      {isDragging && draggedTask && (
        <div className="drag-feedback">
          🎯 Movendo: {draggedTask.tarefaInfo?.nome || draggedTask.tarefa}
        </div>
      )}

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

        <CardHeader className="relative z-10 p-6">
          <div className="space-y-3">
            {/* Linha 1: Título, Data e Navegação */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg flex items-center gap-2">
                    Cronograma
                    <Clock className="w-5 h-5 animate-pulse" />
                  </h2>
                  <p className="text-blue-100 text-sm font-medium">
                    Gerencie agendamentos e visualize a agenda da equipe
                  </p>
                </div>
              </div>

              {/* Navegação de data compacta */}
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-xl p-1.5 shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDataSelecionada(new Date().toISOString().split('T')[0])}
                  className="text-white hover:bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium"
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
                  className="text-white hover:bg-white/20 rounded-lg h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <input
                  type="date"
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="font-medium text-white min-w-[140px] text-center px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 focus:ring-2 focus:ring-white/50 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const data = new Date(dataSelecionada)
                    data.setDate(data.getDate() + 1)
                    setDataSelecionada(data.toISOString().split('T')[0])
                  }}
                  className="text-white hover:bg-white/20 rounded-lg h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Linha 2: Informações e Controles */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              {/* Info do dia */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 shadow-lg">
                  <Calendar className="w-4 h-4 text-white/90" />
                  <span className="text-white font-medium text-sm">
                    {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 px-2 py-1 rounded-lg font-medium text-sm">
                  {dadosFiltrados.length} agendamento{dadosFiltrados.length !== 1 ? 's' : ''}
                </Badge>
                {isDragging && (
                  <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 px-2 py-1 rounded-lg font-medium animate-pulse text-sm">
                    🎯 Arrastando...
                  </Badge>
                )}
              </div>

              {/* Controles principais */}
              <div className="flex items-center gap-2">
                {/* Modo de Visualização */}
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                  <Button
                    variant={visualizacao === 'timeline' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setVisualizacao('timeline')}
                    className={`text-white hover:bg-white/20 px-2 py-1 text-xs ${visualizacao === 'timeline' ? 'bg-white/30' : ''}`}
                  >
                    <List className="w-3 h-3 mr-1" />
                    Timeline
                  </Button>
                  <Button
                    variant={visualizacao === 'grade' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setVisualizacao('grade')}
                    className={`text-white hover:bg-white/20 px-2 py-1 text-xs ${visualizacao === 'grade' ? 'bg-white/30' : ''}`}
                  >
                    <Grid3X3 className="w-3 h-3 mr-1" />
                    Grade
                  </Button>
                  <Button
                    variant={visualizacao === 'vertical' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setVisualizacao('vertical')}
                    className={`text-white hover:bg-white/20 px-2 py-1 text-xs ${visualizacao === 'vertical' ? 'bg-white/30' : ''}`}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Vertical
                  </Button>
                </div>

                {/* Ações */}
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                  {!modoSelecaoMultipla ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setModoSelecaoMultipla(true)}
                        className="text-white hover:bg-white/20 px-2 py-1 text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Seleção
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDuplicarTarefas}
                        className="text-white hover:bg-white/20 px-2 py-1 text-xs"
                        disabled={dadosFiltrados.length === 0}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Duplicar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={marcarTodasSelecionadasComoConcluidas}
                        className="text-white hover:bg-white/20 px-2 py-1 text-xs"
                        disabled={tarefasSelecionadas.size === 0}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Concluir ({tarefasSelecionadas.size})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={excluirTarefasSelecionadas}
                        className="text-white hover:bg-red-500/20 px-2 py-1 text-xs hover:text-red-200"
                        disabled={tarefasSelecionadas.size === 0}
                        title="Excluir agendamentos selecionados"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir ({tarefasSelecionadas.size})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelarSelecaoMultipla}
                        className="text-white hover:bg-white/20 px-2 py-1 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Linha 3: Filtros por Funcionário */}
            <div className="flex flex-wrap gap-2 items-center">


              <Button
                variant={funcionarioSelecionado === 'todos' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFuncionarioSelecionado('todos')}
                className={`text-white hover:bg-white/20 text-xs px-2 py-1 ${funcionarioSelecionado === 'todos' ? 'bg-white/30' : ''}`}
              >
                <Users className="w-3 h-3 mr-1" />
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
                    className="text-white hover:bg-white/20 text-xs px-2 py-1"
                    style={{
                      backgroundColor: isSelected ? funcionario.cor : 'rgba(255,255,255,0.1)',
                      borderColor: funcionario.cor,
                      color: 'white'
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: funcionario.cor }}
                    />
                    {funcionario.nome} ({tarefasFuncionario})
                  </Button>
                )
              })}

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



      {/* Resumo do dia - Ultra Compacto */}
      {dadosFiltrados.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/50 backdrop-blur-sm rounded-md p-2 border border-white/20">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-blue-600">{dadosFiltrados.length}</p>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-md p-2 border border-white/20">
            <div className="text-center">
              <p className="text-xs text-gray-500">Ativos</p>
              <p className="text-lg font-bold text-green-600">
                {new Set(dadosFiltrados.map(item => item.funcionario)).size}
              </p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-md p-2 border border-white/20">
            <div className="text-center">
              <p className="text-xs text-gray-500">Tempo</p>
              <p className="text-lg font-bold text-orange-600">
                {Math.round(dadosFiltrados.reduce((acc, item) => {
                  const tarefa = tarefas?.find(t => t.id === item.tarefa)
                  return acc + (tarefa?.tempo_estimado || 30)
                }, 0) / 60)}h
              </p>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-md p-2 border border-white/20">
            <div className="text-center">
              <p className="text-xs text-gray-500">Concluídas</p>
              <p className="text-lg font-bold text-purple-600">
                {dadosFiltrados.filter(item => item.status === 'concluida').length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legenda de categorias - Ultra Compacta */}
      <div className="bg-white/40 backdrop-blur-sm rounded-md p-2 border border-white/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-medium text-gray-600">Categorias:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoriasCores).map(([categoria, cor]) => (
              <div key={categoria} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${cor}`} />
                <span className="text-xs text-gray-600 capitalize">{categoria}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

      {/* Modal de Duplicação de Tarefas */}
      {modalDuplicacao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Duplicar Tarefas do Dia
              </CardTitle>
              <CardDescription>
                Selecione as datas para onde deseja duplicar as {dadosFiltrados.filter(t => t.data === dataSelecionada).length} tarefa(s) do dia {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Datas selecionadas */}
              {datasDuplicacao.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Datas selecionadas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {datasDuplicacao.map(data => (
                      <Badge key={data} variant="secondary" className="flex items-center gap-1">
                        {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-100"
                          onClick={() => removerDataDuplicacao(data)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Seleção manual de data */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Adicionar data:</h4>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 border rounded-md"
                    onChange={(e) => {
                      if (e.target.value) {
                        adicionarDataDuplicacao(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
              </div>

              {/* Atalhos para próximos dias */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Atalhos:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      gerarProximosDias(7).forEach(data => adicionarDataDuplicacao(data))
                    }}
                  >
                    Próximos 7 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Próximos dias úteis (segunda a sexta)
                      const diasUteis = []
                      const hoje = new Date(dataSelecionada)
                      let contador = 0
                      let dia = 1

                      while (contador < 5) {
                        const proximoDia = new Date(hoje)
                        proximoDia.setDate(hoje.getDate() + dia)
                        const diaSemana = proximoDia.getDay()

                        if (diaSemana >= 1 && diaSemana <= 5) { // Segunda a sexta
                          diasUteis.push(proximoDia.toISOString().split('T')[0])
                          contador++
                        }
                        dia++
                      }

                      diasUteis.forEach(data => adicionarDataDuplicacao(data))
                    }}
                  >
                    Próximos 5 dias úteis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Próxima semana (mesmo dia da semana)
                      const proximaSemana = new Date(dataSelecionada)
                      proximaSemana.setDate(proximaSemana.getDate() + 7)
                      adicionarDataDuplicacao(proximaSemana.toISOString().split('T')[0])
                    }}
                  >
                    Próxima semana
                  </Button>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalDuplicacao(false)
                    setDatasDuplicacao([])
                  }}
                  disabled={duplicandoTarefas}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarDuplicacao}
                  disabled={datasDuplicacao.length === 0 || duplicandoTarefas}
                >
                  {duplicandoTarefas ? 'Duplicando...' : `Duplicar para ${datasDuplicacao.length} dia(s)`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Cronograma