import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Star
} from 'lucide-react'
import { useFuncionarios, useTarefas, useDemandas } from '../hooks/useApi'
import supabaseService from '../services/supabase'
import DemandaForm from './forms/DemandaForm'
import { usePersonalizacao } from '../hooks/usePersonalizacao'

// Dados de exemplo - depois pode vir do Supabase
const demandasExemplo = [
  {
    id: 1,
    titulo: 'Implementar sistema de notificações',
    descricao: 'Criar sistema push para alertar sobre deadlines importantes',
    funcionario_id: 'func1',
    tarefa_id: 'desenvolvimento',
    importancia: 'alta',
    prazo: '2025-08-10',
    status: 'pendente',
    data_criacao: '2025-08-03',
    observacoes: 'Prioridade máxima para o lançamento'
  },
  {
    id: 2,
    titulo: 'Revisar conteúdo do curso avançado',
    descricao: 'Atualizar material didático com as últimas tendências',
    funcionario_id: 'func2',
    tarefa_id: 'conteudo',
    importancia: 'media',
    prazo: '2025-08-15',
    status: 'em_andamento',
    data_criacao: '2025-08-01',
    observacoes: 'Focar nos módulos 3 e 4'
  },
  {
    id: 3,
    titulo: 'Campanha de marketing Q3',
    descricao: 'Planejar e executar campanha para o terceiro trimestre',
    funcionario_id: 'func3',
    tarefa_id: 'marketing',
    importancia: 'alta',
    prazo: '2025-08-08',
    status: 'pendente',
    data_criacao: '2025-07-30',
    observacoes: 'Incluir análise de concorrência'
  },
  {
    id: 4,
    titulo: 'Atualizar documentação da API',
    descricao: 'Documentar novos endpoints e funcionalidades',
    funcionario_id: 'func1',
    tarefa_id: 'documentacao',
    importancia: 'baixa',
    prazo: '2025-08-20',
    status: 'concluida',
    data_criacao: '2025-07-25',
    observacoes: 'Incluir exemplos práticos'
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
  em_andamento: {
    label: 'Em Andamento',
    color: 'bg-blue-500',
    icon: Zap
  },
  concluida: {
    label: 'Concluída',
    color: 'bg-green-500',
    icon: CheckCircle2
  }
}

export default function DemandasImportantes() {
  const [filtroImportancia, setFiltroImportancia] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroFuncionario, setFiltroFuncionario] = useState('todos')
  const [demandaFormOpen, setDemandaFormOpen] = useState(false)
  const [editingDemanda, setEditingDemanda] = useState(null)
  const [detalheDemandaOpen, setDetalheDemandaOpen] = useState(false)
  const [demandaSelecionada, setDemandaSelecionada] = useState(null)

  // Carrega dados da API
  const { data: funcionarios } = useFuncionarios()
  const { data: tarefas } = useTarefas()
  const { data: demandasData, loading, error, refetch: refetchDemandas } = useDemandas()

  // Usar dados do Supabase ou fallback para dados de exemplo
  // Se houver erro (tabela não existe), usar sempre os dados de exemplo
  const demandas = error ? demandasExemplo : (demandasData || demandasExemplo)

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

  // Filtrar demandas
  const demandasFiltradas = useMemo(() => {
    return demandas.filter(demanda => {
      const matchImportancia = filtroImportancia === 'todas' || demanda.importancia === filtroImportancia
      const matchStatus = filtroStatus === 'todos' || demanda.status === filtroStatus
      const matchFuncionario = filtroFuncionario === 'todos' || demanda.funcionario_id === filtroFuncionario
      
      return matchImportancia && matchStatus && matchFuncionario
    })
  }, [demandas, filtroImportancia, filtroStatus, filtroFuncionario])

  // Ordenar por data de vencimento (mais urgente primeiro)
  const demandasOrdenadas = useMemo(() => {
    return [...demandasFiltradas].sort((a, b) => {
      // Primeiro por status (pendentes e em andamento primeiro)
      if (a.status === 'concluida' && b.status !== 'concluida') return 1
      if (a.status !== 'concluida' && b.status === 'concluida') return -1
      
      // Depois por prazo (mais urgente primeiro)
      const diffPrazo = new Date(a.prazo) - new Date(b.prazo)
      if (diffPrazo !== 0) return diffPrazo
      
      // Por último por importância
      const importanciaOrder = { alta: 3, media: 2, baixa: 1 }
      return importanciaOrder[b.importancia] - importanciaOrder[a.importancia]
    })
  }, [demandasFiltradas])

  // Estatísticas
  const stats = useMemo(() => {
    const total = demandas.length
    const pendentes = demandas.filter(d => d.status === 'pendente').length
    const emAndamento = demandas.filter(d => d.status === 'em_andamento').length
    const concluidas = demandas.filter(d => d.status === 'concluida').length
    const atrasadas = demandas.filter(d => {
      const diasRestantes = calcularDiasRestantes(d.prazo)
      return diasRestantes < 0 && d.status !== 'concluida'
    }).length
    
    return { total, pendentes, emAndamento, concluidas, atrasadas }
  }, [demandas])

  const handleNovaDemanda = () => {
    setEditingDemanda(null)
    setDemandaFormOpen(true)
  }

  const handleEditDemanda = (demanda) => {
    setEditingDemanda(demanda)
    setDemandaFormOpen(true)
  }

  const handleViewDemanda = (demanda) => {
    setDemandaSelecionada(demanda)
    setDetalheDemandaOpen(true)
  }

  const handleSaveDemanda = async (demandaData) => {
    try {
      if (editingDemanda) {
        await supabaseService.updateDemanda(editingDemanda.id, demandaData)
      } else {
        await supabaseService.createDemanda(demandaData)
      }
      refetchDemandas()
      setDemandaFormOpen(false)
      setEditingDemanda(null)
    } catch (error) {
      console.error('Erro ao salvar demanda:', error)
      if (error.message.includes('does not exist')) {
        alert('A tabela de demandas ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_DEMANDAS_TABLE.sql no painel do Supabase.')
      } else {
        alert('Erro ao salvar demanda: ' + error.message)
      }
    }
  }

  const handleDeleteDemanda = async (demanda) => {
    if (window.confirm(`Tem certeza que deseja excluir a demanda "${demanda.titulo}"?`)) {
      try {
        await supabaseService.deleteDemanda(demanda.id)
        refetchDemandas()
      } catch (error) {
        console.error('Erro ao excluir demanda:', error)
        if (error.message.includes('does not exist')) {
          alert('A tabela de demandas ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_DEMANDAS_TABLE.sql no painel do Supabase.')
        } else {
          alert('Erro ao excluir demanda: ' + error.message)
        }
      }
    }
  }

  const handleStatusChange = async (demandaId, novoStatus) => {
    try {
      await supabaseService.updateDemanda(demandaId, { status: novoStatus })
      refetchDemandas()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      if (error.message.includes('does not exist')) {
        alert('A tabela de demandas ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_DEMANDAS_TABLE.sql no painel do Supabase.')
      } else {
        alert('Erro ao atualizar status: ' + error.message)
      }
    }
  }

  const DemandaCard = ({ demanda }) => {
    const funcionario = funcionarios?.find(f => f.id === demanda.funcionario_id)
    const tarefa = tarefas?.find(t => t.id === demanda.tarefa_id)
    const diasRestantes = calcularDiasRestantes(demanda.prazo)
    const importanciaInfo = importanciaConfig[demanda.importancia]
    const statusInfo = statusConfig[demanda.status]
    const IconeImportancia = importanciaInfo.icon
    const IconeStatus = statusInfo.icon

    const isAtrasada = diasRestantes < 0 && demanda.status !== 'concluida'
    const isUrgente = diasRestantes <= 2 && demanda.status !== 'concluida'

    return (
      <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 min-h-[120px] overflow-hidden ${
        isAtrasada ? 'border-red-500 bg-red-50' : 
        isUrgente ? 'border-orange-500 bg-orange-50' : 
        importanciaInfo.borderColor
      }`}>
        <CardContent className="p-3 h-full">
          <div className="flex items-start justify-between gap-2 h-full">
            {/* Informações principais */}
            <div className="flex-1 min-w-0 max-w-[calc(100%-120px)] overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <IconeImportancia className={`w-3 h-3 ${importanciaInfo.textColor}`} />
                <Badge variant="outline" className={`${importanciaInfo.color} text-white border-0 text-xs px-1 py-0`}>
                  {importanciaInfo.label}
                </Badge>
                <Badge variant="outline" className={`${statusInfo.color} text-white border-0 text-xs px-1 py-0`}>
                  <IconeStatus className="w-2 h-2 mr-1" />
                  {statusInfo.label}
                </Badge>
                
                {/* Data de vencimento com destaque */}
                <div className="flex items-center gap-1 ml-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className={`text-xs font-medium ${
                    isAtrasada ? 'text-red-600' : 
                    isUrgente ? 'text-orange-600' : 
                    'text-gray-700'
                  }`}>
                    {new Date(demanda.prazo).toLocaleDateString('pt-BR')}
                  </span>
                  {isAtrasada && (
                    <span className="text-xs text-red-600 font-semibold">
                      ({Math.abs(diasRestantes)}d atraso)
                    </span>
                  )}
                  {isUrgente && !isAtrasada && (
                    <span className="text-xs text-orange-600 font-semibold">
                      ({diasRestantes}d restantes)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight break-words line-clamp-2">
                  {demanda.titulo}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 opacity-75">
                  {demanda.descricao}
                </p>
                
                {/* Informações adicionais */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-2 h-2" />
                    <span>{funcionario?.nome || 'Não atribuído'}</span>
                  </div>
                  {tarefa && (
                    <div className="flex items-center gap-1">
                      <span>•</span>
                      <span>{tarefa.nome}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex items-center gap-1 flex-shrink-0 w-[110px] justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorito({
                    id: demanda.id,
                    nome: demanda.titulo,
                    tipo: 'demanda'
                  })
                }}
                className="h-6 w-6 p-0"
                title={isFavorito(demanda.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Star className={`w-3 h-3 ${isFavorito(demanda.id) ? 'favorito-star' : 'text-gray-400'}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDemanda(demanda)}
                className="h-6 w-6 p-0"
                title="Visualizar detalhes"
              >
                <Eye className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditDemanda(demanda)}
                className="h-6 w-6 p-0"
                title="Editar demanda"
              >
                <Edit className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteDemanda(demanda)}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Excluir demanda"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              
              {/* Seletor de status rápido */}
              {demanda.status !== 'concluida' && (
                <Select
                  value={demanda.status}
                  onValueChange={(value) => handleStatusChange(demanda.id, value)}
                >
                  <SelectTrigger className="h-6 w-20 text-xs ml-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Demandas Importantes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state com fallback
  if (error && !demandasData) {
    console.warn('Erro ao carregar demandas, usando dados de exemplo:', error)
  }

  return (
    <div className="space-y-6">
      {/* Aviso sobre tabela demandas */}
      {error && !demandasData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Tabela de demandas não encontrada</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Para habilitar o gerenciamento completo de demandas, execute o arquivo <code className="bg-yellow-100 px-1 rounded">CREATE_DEMANDAS_TABLE.sql</code> no SQL Editor do Supabase.
                Atualmente, apenas dados de exemplo estão sendo exibidos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demandas Importantes</h2>
          <p className="text-gray-600">Acompanhe tarefas prioritárias e prazos críticos</p>
        </div>
        <Button onClick={handleNovaDemanda} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Demanda
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-gray-600 mt-1">{stats.pendentes}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Em Andamento</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.emAndamento}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Concluídas</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.concluidas}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Atrasadas</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.atrasadas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filtroImportancia} onValueChange={setFiltroImportancia}>
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroFuncionario} onValueChange={setFiltroFuncionario}>
              <SelectTrigger className="w-[160px]">
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

            <Badge variant="outline" className="ml-auto">
              {demandasOrdenadas.length} demanda{demandasOrdenadas.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Demandas */}
      <div className={getClassesDensidade('spacing')}>
        {demandasOrdenadas.map(demanda => (
          <DemandaCard key={demanda.id} demanda={demanda} />
        ))}
      </div>

      {demandasOrdenadas.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma demanda encontrada</h3>
            <p className="text-gray-600 mb-4">
              Não há demandas que correspondam aos filtros selecionados.
            </p>
            <Button onClick={handleNovaDemanda}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira demanda
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={detalheDemandaOpen} onOpenChange={setDetalheDemandaOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Demanda</DialogTitle>
            <DialogDescription>
              Informações completas sobre a demanda selecionada
            </DialogDescription>
          </DialogHeader>
          
          {demandaSelecionada && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{demandaSelecionada.titulo}</h3>
                <p className="text-gray-600 mt-1">{demandaSelecionada.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Responsável:</span>
                  <p className="text-sm">{funcionarios?.find(f => f.id === demandaSelecionada.funcionario_id)?.nome || 'Não atribuído'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Prazo:</span>
                  <p className="text-sm">{new Date(demandaSelecionada.prazo).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Importância:</span>
                  <p className="text-sm">{importanciaConfig[demandaSelecionada.importancia].label}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-sm">{statusConfig[demandaSelecionada.status].label}</p>
                </div>
              </div>
              
              {demandaSelecionada.observacoes && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Observações:</span>
                  <p className="text-sm mt-1">{demandaSelecionada.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Formulário */}
      <DemandaForm
        isOpen={demandaFormOpen}
        onClose={() => setDemandaFormOpen(false)}
        demanda={editingDemanda}
        funcionarios={funcionarios || []}
        tarefas={tarefas || []}
        onSave={handleSaveDemanda}
      />
    </div>
  )
}