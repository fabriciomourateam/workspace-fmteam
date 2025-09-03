import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Eye,
  Edit,
  Trash2,
  Star,
  MessageCircle,
  Phone,
  Send,
  CheckSquare,
  Square,
  Zap as ZapIcon,
  Loader2
} from 'lucide-react'
import { useFuncionarios, useTarefasAFazer } from '../hooks/useApi'
import supabaseService from '../services/supabase'
import { usePersonalizacao } from '../hooks/usePersonalizacao'
import TarefaForm from './forms/TarefaForm'

// Dados de exemplo - depois pode vir do Supabase
const tarefasExemplo = [
  {
    id: 1,
    titulo: 'Implementar nova funcionalidade de relatórios',
    descricao: 'Criar sistema de relatórios avançados com gráficos e exportação',
    funcionario_responsavel_id: '1',
    importancia: 'alta',
    concluida: false,
    prazo: '2024-01-15',
    telefone_whatsapp: '5511999999999',
    mensagem_whatsapp: 'Olá! Você foi designado para implementar a nova funcionalidade de relatórios. Prazo: 15/01/2024',
    observacoes: 'Prioridade máxima - cliente aguardando',
    data_criacao: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    titulo: 'Corrigir bugs no sistema de login',
    descricao: 'Resolver problemas de autenticação e sessão',
    funcionario_responsavel_id: '1',
    importancia: 'media',
    concluida: false,
    prazo: '2024-01-20',
    telefone_whatsapp: '5511888888888',
    mensagem_whatsapp: 'Olá! Você foi designado para corrigir os bugs no sistema de login. Prazo: 20/01/2024',
    observacoes: 'Usuários reclamando de problemas de acesso',
    data_criacao: '2024-01-10T10:00:00Z'
  },
  {
    id: 3,
    titulo: 'Atualizar documentação do projeto',
    descricao: 'Revisar e atualizar toda a documentação técnica',
    funcionario_responsavel_id: '1',
    importancia: 'baixa',
    concluida: true,
    prazo: '2024-01-25',
    telefone_whatsapp: '5511777777777',
    mensagem_whatsapp: 'Olá! Você foi designado para atualizar a documentação do projeto. Prazo: 25/01/2024',
    observacoes: 'Documentação desatualizada há 3 meses',
    data_criacao: '2024-01-10T10:00:00Z',
    data_conclusao: '2024-01-12T15:30:00Z'
  }
]

const importanciaConfig = {
  alta: {
    label: 'Alta',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertTriangle
  },
  media: {
    label: 'Média',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertCircle
  },
  baixa: {
    label: 'Baixa',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: Target
  }
}

const statusConfig = {
  pendente: {
    label: 'Pendente',
    color: 'bg-gray-500',
    icon: Clock
  },
  concluida: {
    label: 'Concluída',
    color: 'bg-green-500',
    icon: CheckCircle2
  }
}

export default function TarefasAFazer() {
  const [filtroImportancia, setFiltroImportancia] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos')
  const [tarefaFormOpen, setTarefaFormOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState(null)
  const [detalheTarefaOpen, setDetalheTarefaOpen] = useState(false)
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null)
  const [whatsappOpen, setWhatsappOpen] = useState(false)
  const [tarefaWhatsapp, setTarefaWhatsapp] = useState(null)
  const [enviandoWebhook, setEnviandoWebhook] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState(null)

  // Carrega dados da API
  const { data: funcionarios } = useFuncionarios()
  const { data: tarefasData, loading, error, refetch: refetchTarefas } = useTarefasAFazer()

  // Usar dados do Supabase ou fallback para dados de exemplo
  const tarefas = error ? tarefasExemplo : (tarefasData || tarefasExemplo)

  // Hook de personalização
  const { getClassesDensidade, toggleFavorito, isFavorito } = usePersonalizacao()

  // Calcular dias restantes
  const calcularDiasRestantes = (prazo) => {
    const hoje = new Date()
    const dataPrazo = new Date(prazo)
    const diffTime = dataPrazo - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Filtrar tarefas
  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter(tarefa => {
      const matchImportancia = filtroImportancia === 'todas' || tarefa.importancia === filtroImportancia
      const matchStatus = filtroStatus === 'todos' || 
        (filtroStatus === 'pendente' && !tarefa.concluida) ||
        (filtroStatus === 'concluida' && tarefa.concluida)
      const matchFuncionario = filtroFuncionario === 'todos' || 
        tarefa.funcionario_responsavel_id === filtroFuncionario
      
      return matchImportancia && matchStatus && matchFuncionario
    })
  }, [tarefas, filtroImportancia, filtroStatus, filtroFuncionario])

  // Ordenar por data de vencimento (mais urgente primeiro)
  const tarefasOrdenadas = useMemo(() => {
    return [...tarefasFiltradas].sort((a, b) => {
      // Primeiro por status (pendentes primeiro)
      if (a.concluida && !b.concluida) return 1
      if (!a.concluida && b.concluida) return -1
      
      // Depois por prazo (mais urgente primeiro)
      const diffPrazo = new Date(a.prazo) - new Date(b.prazo)
      if (diffPrazo !== 0) return diffPrazo
      
      // Por último por importância
      const importanciaOrder = { alta: 3, media: 2, baixa: 1 }
      return importanciaOrder[b.importancia] - importanciaOrder[a.importancia]
    })
  }, [tarefasFiltradas])

  // Estatísticas
  const stats = useMemo(() => {
    const total = tarefas.length
    const pendentes = tarefas.filter(t => !t.concluida).length
    const concluidas = tarefas.filter(t => t.concluida).length
    const atrasadas = tarefas.filter(t => {
      const diasRestantes = calcularDiasRestantes(t.prazo)
      return diasRestantes < 0 && !t.concluida
    }).length
    
    return { total, pendentes, concluidas, atrasadas }
  }, [tarefas])

  const handleNovaTarefa = () => {
    setEditingTarefa(null)
    setTarefaFormOpen(true)
  }

  const handleEditTarefa = (tarefa) => {
    setEditingTarefa(tarefa)
    setTarefaFormOpen(true)
  }

  const handleViewTarefa = (tarefa) => {
    setTarefaSelecionada(tarefa)
    setDetalheTarefaOpen(true)
  }

  const handleSaveTarefa = async (tarefaData) => {
    try {
      if (editingTarefa) {
        await supabaseService.updateTarefaAFazer(editingTarefa.id, tarefaData)
      } else {
        await supabaseService.createTarefaAFazer(tarefaData)
      }
      refetchTarefas()
      setTarefaFormOpen(false)
      setEditingTarefa(null)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      if (error.message.includes('does not exist')) {
        alert('A tabela de tarefas ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_TAREFAS_TABLE.sql no painel do Supabase.')
      } else {
        alert('Erro ao salvar tarefa: ' + error.message)
      }
    }
  }

  const handleDeleteTarefa = async (tarefa) => {
    if (window.confirm(`Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`)) {
      try {
        await supabaseService.deleteTarefaAFazer(tarefa.id)
        refetchTarefas()
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error)
        if (error.message.includes('does not exist')) {
          alert('A tabela de tarefas ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_TAREFAS_TABLE.sql no painel do Supabase.')
        } else {
          alert('Erro ao excluir tarefa: ' + error.message)
        }
      }
    }
  }

  const handleToggleConcluida = async (tarefaId, concluida) => {
    try {
      await supabaseService.toggleTarefaConcluida(tarefaId, concluida)
      refetchTarefas()
    } catch (error) {
      console.error('Erro ao marcar como concluída:', error)
      if (error.message.includes('does not exist')) {
        alert('A tabela de tarefas ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_TAREFAS_TABLE.sql no painel do Supabase.')
      } else {
        alert('Erro ao marcar como concluída: ' + error.message)
      }
    }
  }

  const handleWhatsapp = (tarefa) => {
    setTarefaWhatsapp(tarefa)
    setWhatsappOpen(true)
    setWebhookStatus(null)
  }

  // Função para enviar via webhook (n8n + Evolution API)
  const enviarViaWebhook = async (tarefa) => {
    // Telefone configurado no n8n, não precisa validar aqui

    setEnviandoWebhook(true)
    setWebhookStatus('enviando')

    try {
      // Dados para enviar via webhook (telefone configurado no n8n)
      const webhookData = {
        tarefa: {
          id: tarefa.id,
          titulo: tarefa.titulo,
          descricao: tarefa.descricao,
          prazo: tarefa.prazo,
          importancia: tarefa.importancia,
          funcionario_responsavel_id: tarefa.funcionario_responsavel_id
        },
        funcionario: funcionarios?.find(f => f.id === tarefa.funcionario_responsavel_id),
        mensagem: tarefa.mensagem_whatsapp || `Olá! Você foi designado para: ${tarefa.titulo}. Prazo: ${new Date(tarefa.prazo).toLocaleDateString('pt-BR')}`,
        timestamp: new Date().toISOString()
      }

          // URL do webhook do n8n (configurada para produção)
    const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.shapepro.shop/webhook/zap'
      
      console.log('🔗 Enviando para webhook:', webhookUrl)
      console.log('📤 Dados sendo enviados:', webhookData)
      
      console.log('🔗 Enviando para webhook (POST):', webhookUrl)
      console.log('📤 Dados sendo enviados:', webhookData)
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })
      
      console.log('📥 Resposta do webhook:', response.status, response.statusText)

      if (response.ok) {
        setWebhookStatus('sucesso')
        // Salvar histórico de envio no Supabase se necessário
        await salvarHistoricoEnvio(tarefa.id, webhookData)
        
        // Fechar modal após sucesso
        setTimeout(() => {
          setWhatsappOpen(false)
          setWebhookStatus(null)
        }, 2000)
      } else {
        const errorText = await response.text()
        throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Erro ao enviar via webhook:', error)
      setWebhookStatus('erro')
    } finally {
      setEnviandoWebhook(false)
    }
  }

  // Função para salvar histórico de envio
  const salvarHistoricoEnvio = async (tarefaId, webhookData) => {
    try {
      // Aqui você pode salvar no Supabase se quiser manter histórico
      // await supabaseService.createHistoricoEnvio({
      //   tarefa_id: tarefaId,
      //   telefone: webhookData.telefone,
      //   mensagem: webhookData.mensagem,
      //   timestamp: webhookData.timestamp,
      //   status: 'enviado'
      // })
    } catch (error) {
      console.error('Erro ao salvar histórico:', error)
    }
  }

  const enviarWhatsapp = (tarefa) => {
    // Para envio direto via WhatsApp Web, precisamos do telefone
    // Se não tiver telefone na tarefa, buscar do funcionário responsável
    const funcionarioResponsavel = funcionarios?.find(f => f.id === tarefa.funcionario_responsavel_id)
    const telefone = tarefa.telefone_whatsapp || funcionarioResponsavel?.telefone || ''
    
    if (!telefone) {
      alert('Telefone não encontrado. Use o botão "Enviar Direto" para enviar via webhook.')
      return
    }
    
    const mensagem = tarefa.mensagem_whatsapp || `Olá! Você foi designado para: ${tarefa.titulo}. Prazo: ${new Date(tarefa.prazo).toLocaleDateString('pt-BR')}`
    
    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
    window.open(url, '_blank')
  }

  const TarefaCard = ({ tarefa }) => {
    const funcionarioResponsavel = funcionarios?.find(f => f.id === tarefa.funcionario_responsavel_id)
    const diasRestantes = calcularDiasRestantes(tarefa.prazo)
    const importanciaInfo = importanciaConfig[tarefa.importancia]
    const statusInfo = statusConfig[tarefa.concluida ? 'concluida' : 'pendente']
    const IconeImportancia = importanciaInfo.icon
    const IconeStatus = statusInfo.icon

    const isAtrasada = diasRestantes < 0 && !tarefa.concluida
    const isUrgente = diasRestantes <= 2 && !tarefa.concluida

    return (
      <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 min-h-[120px] overflow-hidden ${
        tarefa.concluida 
          ? 'border-green-500 bg-green-50/50 opacity-90' 
          : isAtrasada 
            ? 'border-red-500 bg-red-50/50' 
            : isUrgente 
              ? 'border-yellow-500 bg-yellow-50/50' 
              : `border-${importanciaInfo.color.replace('bg-', '')}-500`
      } ${getClassesDensidade('card')} ${tarefa.concluida ? 'ring-2 ring-green-200' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Checkbox e conteúdo principal */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1 pt-1">
                <Checkbox
                  checked={tarefa.concluida}
                  onCheckedChange={(checked) => handleToggleConcluida(tarefa.id, checked)}
                  className="h-5 w-5 border-2 hover:border-blue-500 transition-colors"
                />
                <span className="text-xs text-gray-500 font-medium">
                  {tarefa.concluida ? 'Concluída' : 'Concluir'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`font-semibold text-sm leading-tight ${
                    tarefa.concluida ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {tarefa.titulo}
                  </h3>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-1 ${importanciaInfo.bgColor} ${importanciaInfo.textColor} ${importanciaInfo.borderColor}`}
                    >
                      <IconeImportancia className="w-3 h-3 mr-1" />
                      {importanciaInfo.label}
                    </Badge>
                  </div>
                </div>

                <p className={`text-xs text-gray-600 mb-3 line-clamp-2 ${
                  tarefa.concluida ? 'line-through' : ''
                }`}>
                  {tarefa.descricao}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Responsável: {funcionarioResponsavel?.nome || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de prazo/status e botões de ação */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Informações de prazo e status */}
              <div className="flex flex-col items-end gap-1 text-xs">
                <div className={`flex items-center gap-1 ${
                  tarefa.concluida ? 'text-green-600 font-semibold' :
                  isAtrasada ? 'text-red-600 font-semibold' : 
                  isUrgente ? 'text-yellow-600 font-semibold' : 'text-gray-500'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>
                    {tarefa.concluida ? `Concluída em ${new Date(tarefa.data_conclusao || new Date()).toLocaleDateString('pt-BR')}` :
                     isAtrasada ? `${Math.abs(diasRestantes)} dias atrasado` :
                     isUrgente ? `${diasRestantes} dias restantes` :
                     `${diasRestantes} dias restantes`}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <IconeStatus className="w-3 h-3" />
                  <span className={tarefa.concluida ? 'text-green-600 font-semibold' : ''}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewTarefa(tarefa)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTarefa(tarefa)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>

                {/* Botão de WhatsApp com indicador de envio direto */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleWhatsapp(tarefa)}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 relative"
                  disabled={false}
                  title="Enviar WhatsApp via webhook (telefone configurado no n8n)"
                >
                  <MessageCircle className="w-4 h-4" />
                  <ZapIcon className="w-2 h-2 absolute -top-1 -right-1 text-blue-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTarefa(tarefa)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tarefas à Fazer</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Carregando...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Error state com fallback
  if (error && !tarefasData) {
    console.warn('Erro ao carregar tarefas, usando dados de exemplo:', error)
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
      
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header premium com design igual às outras páginas */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 border-0 shadow-2xl rounded-3xl">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-[0.08]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white rounded-full -translate-y-40 translate-x-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full translate-y-30 -translate-x-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <CardHeader className="relative z-10 p-6">
          <div className="space-y-3">
            {/* Linha 1: Título e Botão */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg flex items-center gap-2">
                    Tarefas à Fazer
                    <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  </h2>
                  <p className="text-blue-100 text-sm font-medium">
                    Tarefas individuais delegadas para funcionários específicos
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Diferente dos processos padrão do sistema
                  </p>
                </div>
              </div>

              {/* Botão Nova Tarefa */}
              <Button 
                onClick={handleNovaTarefa} 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md shadow-lg transition-all duration-300 rounded-xl px-4 py-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa Delegada
              </Button>
            </div>

            {/* Linha 2: Estatísticas */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 shadow-lg">
                <Target className="w-4 h-4 text-white/90" />
                <span className="text-white font-semibold">
                  {stats.total} total
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 shadow-lg">
                <Clock className="w-4 h-4 text-white/90" />
                <span className="text-white font-semibold">
                  {stats.pendentes} pendentes
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white/90" />
                <span className="text-white font-semibold">
                  {stats.concluidas} concluídas
                </span>
              </div>
              {stats.atrasadas > 0 && (
                <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-red-400/30 shadow-lg">
                  <AlertTriangle className="w-4 h-4 text-red-200" />
                  <span className="text-red-100 font-semibold">
                    {stats.atrasadas} atrasadas
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
            </div>

            <Select value={filtroImportancia} onValueChange={setFiltroImportancia}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Importância" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[140px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Funcionário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {funcionarios?.map(funcionario => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 rounded-full px-3 py-1">
              {tarefasOrdenadas.length} tarefa{tarefasOrdenadas.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <div className={getClassesDensidade('spacing')}>
        {tarefasOrdenadas.map(tarefa => (
          <TarefaCard key={tarefa.id} tarefa={tarefa} />
        ))}
      </div>

      {tarefasOrdenadas.length === 0 && (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma tarefa delegada encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filtroImportancia !== 'todas' || filtroStatus !== 'todos' || filtroFuncionario !== 'todos'
                ? 'Tente ajustar os filtros para ver mais tarefas'
                : 'Esta seção é para tarefas individuais delegadas para funcionários específicos. Diferente dos processos padrão do sistema.'}
            </p>
            <div className="space-y-3">
              <Button onClick={handleNovaTarefa} className="bg-blue-600 hover:bg-blue-700 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa Delegada
              </Button>
              <div className="text-sm text-gray-500">
                <p>💡 <strong>Dica:</strong> As "Tarefas à Fazer" são diferentes dos "Processos"</p>
                <p>• <strong>Processos:</strong> Tarefas padrão do sistema (check-ins, reuniões)</p>
                <p>• <strong>Tarefas à Fazer:</strong> Tarefas individuais delegadas para funcionários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={detalheTarefaOpen} onOpenChange={setDetalheTarefaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detalhes da Tarefa
            </DialogTitle>
          </DialogHeader>
          
          {tarefaSelecionada && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Título</Label>
                <p className="text-gray-900 font-semibold">{tarefaSelecionada.titulo}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                <p className="text-gray-900">{tarefaSelecionada.descricao}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Responsável</Label>
                <p className="text-gray-900">
                  {funcionarios?.find(f => f.id === tarefaSelecionada.funcionario_responsavel_id)?.nome || 'N/A'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Prazo</Label>
                  <p className="text-gray-900">
                    {new Date(tarefaSelecionada.prazo).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge className={`${statusConfig[tarefaSelecionada.concluida ? 'concluida' : 'pendente'].color} text-white`}>
                    {statusConfig[tarefaSelecionada.concluida ? 'concluida' : 'pendente'].label}
                  </Badge>
                </div>
              </div>
              
              {tarefaSelecionada.observacoes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Observações</Label>
                  <p className="text-gray-900">{tarefaSelecionada.observacoes}</p>
                </div>
              )}
              
              {/* Telefone configurado no n8n, não exibido aqui */}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de WhatsApp */}
      <Dialog open={whatsappOpen} onOpenChange={setWhatsappOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Enviar WhatsApp
            </DialogTitle>
            <DialogDescription>
              Escolha como enviar a mensagem: via webhook (automático) ou WhatsApp Web (manual)
            </DialogDescription>
          </DialogHeader>
          
          {tarefaWhatsapp && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Tarefa</Label>
                <p className="text-gray-900 font-semibold">{tarefaWhatsapp.titulo}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Mensagem</Label>
                <Textarea
                  value={tarefaWhatsapp.mensagem_whatsapp || ''}
                  onChange={(e) => setTarefaWhatsapp({
                    ...tarefaWhatsapp,
                    mensagem_whatsapp: e.target.value
                  })}
                  placeholder="Digite sua mensagem..."
                  rows={4}
                />
              </div>
              
              {/* Status do webhook */}
              {webhookStatus && (
                <div className={`p-3 rounded-lg text-sm ${
                  webhookStatus === 'enviando' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  webhookStatus === 'sucesso' ? 'bg-green-50 text-green-700 border border-green-200' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {webhookStatus === 'enviando' && <Loader2 className="w-4 h-4 animate-spin" />}
                    {webhookStatus === 'sucesso' && <CheckCircle2 className="w-4 h-4" />}
                    {webhookStatus === 'erro' && <AlertTriangle className="w-4 h-4" />}
                    <span>
                      {webhookStatus === 'enviando' && 'Enviando mensagem...'}
                      {webhookStatus === 'sucesso' && 'Mensagem enviada com sucesso!'}
                      {webhookStatus === 'erro' && 'Erro ao enviar mensagem. Tente novamente.'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="text-sm text-gray-600">
                  <p><strong>Webhook (Recomendado):</strong> Envio automático via n8n + Evolution API</p>
                  <p><strong>WhatsApp Web:</strong> Abre o WhatsApp Web para envio manual</p>
                </div>
                
                <div className="flex gap-2">
                  {/* Botão de envio direto via webhook */}
                  <Button
                    onClick={() => enviarViaWebhook(tarefaWhatsapp)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={enviandoWebhook}
                  >
                    {enviandoWebhook ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <ZapIcon className="w-4 h-4 mr-2" />
                        Enviar via Webhook
                      </>
                    )}
                  </Button>
                  
                  {/* Botão de envio via WhatsApp Web */}
                  <Button
                    onClick={() => enviarWhatsapp(tarefaWhatsapp)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={false}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    WhatsApp Web
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSaveTarefa(tarefaWhatsapp)}
                  variant="outline"
                  className="flex-1"
                >
                  Salvar
                </Button>
                
                <Button
                  onClick={() => setWhatsappOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <TarefaForm
        isOpen={tarefaFormOpen}
        onClose={() => setTarefaFormOpen(false)}
        tarefa={editingTarefa}
        funcionarios={funcionarios || []}
        onSave={handleSaveTarefa}
      />
    </div>
  )
}
