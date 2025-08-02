import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  User, 
  Filter,
  CheckSquare,
  Square,
  Clock
} from 'lucide-react'
import { useFuncionarios, useAgenda } from '../hooks/useApi'
import supabaseService from '../services/supabase'
import { formatarHorarioIntervalo } from '../utils/timeUtils'

export default function ExclusaoMassa({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [agendamentosSelecionados, setAgendamentosSelecionados] = useState([])
  const [filtros, setFiltros] = useState({
    funcionario_id: 'todos',
    data_inicio: '',
    data_fim: '',
    status: 'todos'
  })
  const [busca, setBusca] = useState('')

  // Carrega dados da API
  const { data: funcionarios } = useFuncionarios()
  const { data: agenda } = useAgenda()

  const showSuccess = (message) => alert('Sucesso: ' + message)
  const showError = (message) => alert('Erro: ' + message)

  // Filtrar agendamentos baseado nos filtros e busca
  const agendamentosFiltrados = agenda?.filter(item => {
    // Filtros
    if (filtros.funcionario_id !== 'todos' && item.funcionario !== filtros.funcionario_id) return false
    if (filtros.data_inicio && item.data < filtros.data_inicio) return false
    if (filtros.data_fim && item.data > filtros.data_fim) return false
    if (filtros.status !== 'todos' && item.status !== filtros.status) return false
    
    // Busca por texto
    if (busca) {
      const funcionario = funcionarios?.find(f => f.id === item.funcionario)
      const buscaLower = busca.toLowerCase()
      const matchFuncionario = funcionario?.nome.toLowerCase().includes(buscaLower)
      const matchData = item.data?.includes(busca)
      const matchHorario = item.horario?.includes(busca)
      
      if (!matchFuncionario && !matchData && !matchHorario) return false
    }
    
    return true
  }) || []

  // Toggle seleção de agendamento
  const toggleAgendamento = (agendamentoId) => {
    setAgendamentosSelecionados(prev => 
      prev.includes(agendamentoId)
        ? prev.filter(id => id !== agendamentoId)
        : [...prev, agendamentoId]
    )
  }

  // Selecionar todos os filtrados
  const selecionarTodos = () => {
    const ids = agendamentosFiltrados.map(item => item.id)
    setAgendamentosSelecionados(ids)
  }

  // Limpar seleção
  const limparSelecao = () => {
    setAgendamentosSelecionados([])
  }

  // Executar exclusão
  const executarExclusao = async () => {
    if (agendamentosSelecionados.length === 0) {
      showError('Nenhum agendamento selecionado')
      return
    }

    if (!window.confirm(`Tem certeza que deseja excluir ${agendamentosSelecionados.length} agendamento(s) selecionado(s)? Esta ação não pode ser desfeita.`)) {
      return
    }

    setLoading(true)
    try {
      const resultado = await supabaseService.deleteMultipleAgendamentos(agendamentosSelecionados)
      showSuccess(`${resultado.deleted} agendamento(s) excluído(s) com sucesso!`)
      onSuccess?.()
      onClose()
    } catch (error) {
      showError('Erro ao excluir agendamentos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset ao fechar
  const handleClose = () => {
    setAgendamentosSelecionados([])
    setBusca('')
    setFiltros({
      funcionario_id: 'todos',
      data_inicio: '',
      data_fim: '',
      status: 'todos'
    })
    onClose()
  }

  const statusOptions = [
    { value: 'nao_iniciada', label: 'Não Iniciada' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluida', label: 'Concluída' },
    { value: 'atrasada', label: 'Atrasada' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Exclusão Seletiva de Agendamentos
          </DialogTitle>
          <DialogDescription>
            Selecione individualmente os agendamentos que deseja excluir. Use os filtros para facilitar a busca.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Busca */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar Agendamentos</label>
            <input
              type="text"
              placeholder="Buscar por funcionário, data ou horário..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Funcionário</label>
                  <Select value={filtros.funcionario_id} onValueChange={(value) => setFiltros(prev => ({ ...prev, funcionario_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Início</label>
                  <input
                    type="date"
                    value={filtros.data_inicio}
                    onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Fim</label>
                  <input
                    type="date"
                    value={filtros.data_fim}
                    onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filtros.status} onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Agendamentos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Agendamentos ({agendamentosFiltrados.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selecionarTodos}>
                    Selecionar Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={limparSelecao}>
                    Limpar Seleção
                  </Button>
                </div>
              </div>
              {agendamentosSelecionados.length > 0 && (
                <Badge variant="destructive" className="w-fit">
                  {agendamentosSelecionados.length} selecionado(s)
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-2">
                {agendamentosFiltrados.map(agendamento => {
                  const funcionario = funcionarios?.find(f => f.id === agendamento.funcionario)
                  const isSelected = agendamentosSelecionados.includes(agendamento.id)
                  
                  return (
                    <div
                      key={agendamento.id}
                      onClick={() => toggleAgendamento(agendamento.id)}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-red-50 border-red-300 shadow-sm' 
                          : 'hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-red-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: funcionario?.cor }}
                            />
                            <span className="font-medium text-gray-900">{funcionario?.nome}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              agendamento.status === 'concluida' ? 'border-green-500 text-green-700' :
                              agendamento.status === 'em_andamento' ? 'border-blue-500 text-blue-700' :
                              agendamento.status === 'atrasada' ? 'border-red-500 text-red-700' :
                              'border-gray-500 text-gray-700'
                            }`}
                          >
                            {agendamento.status === 'nao_iniciada' ? 'Não iniciada' :
                             agendamento.status === 'em_andamento' ? 'Em andamento' :
                             agendamento.status === 'concluida' ? 'Concluída' :
                             agendamento.status === 'atrasada' ? 'Atrasada' :
                             'Não iniciada'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(agendamento.data || new Date()).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatarHorarioIntervalo(agendamento.horario)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              ID: {agendamento.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {agendamentosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum agendamento encontrado com os filtros aplicados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo da Exclusão */}
          {agendamentosSelecionados.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Atenção!</span>
              </div>
              <p className="text-red-700 mt-1">
                <strong>{agendamentosSelecionados.length}</strong> agendamento(s) será(ão) excluído(s) permanentemente.
              </p>
              <div className="mt-2 text-sm text-red-600">
                Esta ação não pode ser desfeita. Verifique cuidadosamente os agendamentos selecionados.
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={executarExclusao}
              disabled={loading || agendamentosSelecionados.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Excluindo...' : `Excluir ${agendamentosSelecionados.length} Agendamento(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}