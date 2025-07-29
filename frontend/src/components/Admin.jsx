import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Save, X, Settings, Users, Calendar, FileText } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
import { useNotifications } from '../contexts/NotificationContext'

function Admin() {
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoModal, setTipoModal] = useState('') // 'funcionario', 'tarefa', 'agendamento'
  const [itemEditando, setItemEditando] = useState(null)
  const { addNotification } = useNotifications()

  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios, error: errorFuncionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, error: errorTarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, error: errorAgenda, refetch: refetchAgenda } = useAgenda()

  // Estados de loading e error
  const isLoading = loadingFuncionarios || loadingTarefas || loadingAgenda
  const hasError = errorFuncionarios || errorTarefas || errorAgenda
  const error = errorFuncionarios || errorTarefas || errorAgenda

  // Função para recarregar todos os dados
  const refetchAll = () => {
    refetchFuncionarios()
    refetchTarefas()
    refetchAgenda()
  }

  // Carrega dados iniciais
  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dados-completos`)
      if (response.ok) {
        const data = await response.json()
        setDados(data)
      } else {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão com a API",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (tipo, item = null) => {
    setTipoModal(tipo)
    setItemEditando(item)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setTipoModal('')
    setItemEditando(null)
  }

  // Componente para gerenciar funcionários
  const GerenciarFuncionarios = () => {
    const [formData, setFormData] = useState({
      id: '',
      nome: '',
      horarioInicio: '',
      horarioFim: '',
      cor: '#2563eb'
    })

    useEffect(() => {
      if (itemEditando) {
        setFormData(itemEditando)
      } else {
        setFormData({
          id: '',
          nome: '',
          horarioInicio: '',
          horarioFim: '',
          cor: '#2563eb'
        })
      }
    }, [itemEditando])

    const salvarFuncionario = async () => {
      try {
        const url = itemEditando 
          ? `${API_BASE_URL}/funcionarios/${itemEditando.id}`
          : `${API_BASE_URL}/funcionarios`
        
        const method = itemEditando ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: `Funcionário ${itemEditando ? 'atualizado' : 'adicionado'} com sucesso`
          })
          fecharModal()
          carregarDados()
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Erro ao salvar funcionário",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro de conexão",
          variant: "destructive"
        })
      }
    }

    const excluirFuncionario = async (funcionarioId) => {
      if (!confirm('Tem certeza que deseja excluir este funcionário? Todos os agendamentos dele serão removidos.')) {
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/funcionarios/${funcionarioId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Funcionário excluído com sucesso"
          })
          carregarDados()
        } else {
          toast({
            title: "Erro",
            description: "Erro ao excluir funcionário",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro de conexão",
          variant: "destructive"
        })
      }
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Funcionários</h3>
          <Button onClick={() => abrirModal('funcionario')}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Funcionário
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dados.funcionarios.map(funcionario => (
            <Card key={funcionario.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: funcionario.cor }}
                    />
                    <CardTitle className="text-base">{funcionario.nome}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => abrirModal('funcionario', funcionario)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => excluirFuncionario(funcionario.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <div>ID: {funcionario.id}</div>
                  <div>
                    Horário: {funcionario.horarioInicio === 'flexible' 
                      ? 'Flexível' 
                      : `${funcionario.horarioInicio} - ${funcionario.horarioFim}`
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de funcionário */}
        <Dialog open={modalAberto && tipoModal === 'funcionario'} onOpenChange={fecharModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {itemEditando ? 'Editar Funcionário' : 'Adicionar Funcionário'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="funcionario-id">ID do Funcionário</Label>
                <Input
                  id="funcionario-id"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  disabled={!!itemEditando}
                  placeholder="ex: joao_silva"
                />
              </div>
              <div>
                <Label htmlFor="funcionario-nome">Nome</Label>
                <Input
                  id="funcionario-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funcionario-inicio">Horário Início</Label>
                  <Input
                    id="funcionario-inicio"
                    type="time"
                    value={formData.horarioInicio}
                    onChange={(e) => setFormData({...formData, horarioInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="funcionario-fim">Horário Fim</Label>
                  <Input
                    id="funcionario-fim"
                    type="time"
                    value={formData.horarioFim}
                    onChange={(e) => setFormData({...formData, horarioFim: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="funcionario-cor">Cor</Label>
                <Input
                  id="funcionario-cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) => setFormData({...formData, cor: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={fecharModal}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={salvarFuncionario}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Componente para gerenciar tarefas
  const GerenciarTarefas = () => {
    const [formData, setFormData] = useState({
      id: '',
      nome: '',
      categoria: '',
      tempoEstimado: 30,
      descricao: '',
      prioridade: 'media'
    })

    useEffect(() => {
      if (itemEditando) {
        setFormData(itemEditando)
      } else {
        setFormData({
          id: '',
          nome: '',
          categoria: '',
          tempoEstimado: 30,
          descricao: '',
          prioridade: 'media'
        })
      }
    }, [itemEditando])

    const salvarTarefa = async () => {
      try {
        const url = itemEditando 
          ? `${API_BASE_URL}/tarefas/${itemEditando.id}`
          : `${API_BASE_URL}/tarefas`
        
        const method = itemEditando ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: `Tarefa ${itemEditando ? 'atualizada' : 'adicionada'} com sucesso`
          })
          fecharModal()
          carregarDados()
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Erro ao salvar tarefa",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro de conexão",
          variant: "destructive"
        })
      }
    }

    const excluirTarefa = async (tarefaId) => {
      if (!confirm('Tem certeza que deseja excluir esta tarefa? Todos os agendamentos dela serão removidos.')) {
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/tarefas/${tarefaId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Tarefa excluída com sucesso"
          })
          carregarDados()
        } else {
          toast({
            title: "Erro",
            description: "Erro ao excluir tarefa",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro de conexão",
          variant: "destructive"
        })
      }
    }

    const categorias = ['gestao', 'atendimento', 'marketing', 'engajamento', 'conteudo', 'produto', 'interno']
    const prioridades = ['baixa', 'media', 'alta']

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Tarefas</h3>
          <Button onClick={() => abrirModal('tarefa')}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dados.tarefas.map(tarefa => (
            <Card key={tarefa.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tarefa.nome}</CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => abrirModal('tarefa', tarefa)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => excluirTarefa(tarefa.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize">
                      {tarefa.categoria}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {tarefa.prioridade}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>ID: {tarefa.id}</div>
                    <div>Tempo: {tarefa.tempoEstimado} min</div>
                    <div className="mt-2">{tarefa.descricao}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de tarefa */}
        <Dialog open={modalAberto && tipoModal === 'tarefa'} onOpenChange={fecharModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {itemEditando ? 'Editar Tarefa' : 'Adicionar Tarefa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tarefa-id">ID da Tarefa</Label>
                <Input
                  id="tarefa-id"
                  value={formData.id}
                  onChange={(e) => setFormData({...formData, id: e.target.value})}
                  disabled={!!itemEditando}
                  placeholder="ex: nova_tarefa"
                />
              </div>
              <div>
                <Label htmlFor="tarefa-nome">Nome da Tarefa</Label>
                <Input
                  id="tarefa-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome da tarefa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tarefa-categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tarefa-prioridade">Prioridade</Label>
                  <Select value={formData.prioridade} onValueChange={(value) => setFormData({...formData, prioridade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map(pri => (
                        <SelectItem key={pri} value={pri} className="capitalize">
                          {pri}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="tarefa-tempo">Tempo Estimado (minutos)</Label>
                <Input
                  id="tarefa-tempo"
                  type="number"
                  value={formData.tempoEstimado}
                  onChange={(e) => setFormData({...formData, tempoEstimado: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="tarefa-descricao">Descrição</Label>
                <Textarea
                  id="tarefa-descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Descrição da tarefa"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={fecharModal}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={salvarTarefa}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Componente para gerenciar agenda
  const GerenciarAgenda = () => {
    const [formData, setFormData] = useState({
      horario: '',
      funcionario: '',
      tarefa: ''
    })

    const adicionarAgendamento = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/agenda`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Agendamento adicionado com sucesso"
          })
          setFormData({ horario: '', funcionario: '', tarefa: '' })
          carregarDados()
        } else {
          const error = await response.json()
          toast({
            title: "Erro",
            description: error.error || "Erro ao adicionar agendamento",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro de conexão",
          variant: "destructive"
        })
      }
    }

    const excluirAgendamento = async (index) => {
      if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/agenda/${index}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          toast({
            title: "Sucesso",
            description: "Agendamento excluído com sucesso"
          })
          carregarDados()
        } else {
          toast({
            title: "Erro",
            description: "Erro ao excluir agendamento",
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro de conexão",
          variant: "destructive"
        })
      }
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Gerenciar Agenda</h3>
        
        {/* Formulário para adicionar agendamento */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="agenda-horario">Horário</Label>
                <Input
                  id="agenda-horario"
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="agenda-funcionario">Funcionário</Label>
                <Select value={formData.funcionario} onValueChange={(value) => setFormData({...formData, funcionario: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {dados.funcionarios.map(func => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="agenda-tarefa">Tarefa</Label>
                <Select value={formData.tarefa} onValueChange={(value) => setFormData({...formData, tarefa: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {dados.tarefas.map(tarefa => (
                      <SelectItem key={tarefa.id} value={tarefa.id}>
                        {tarefa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={adicionarAgendamento} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Agendamentos Atuais ({dados.agenda.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dados.agenda.map((item, index) => {
                const funcionario = dados.funcionarios.find(f => f.id === item.funcionario)
                const tarefa = dados.tarefas.find(t => t.id === item.tarefa)
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{item.horario}</Badge>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: funcionario?.cor }}
                        />
                        <span className="font-medium">{funcionario?.nome}</span>
                      </div>
                      <span className="text-gray-600">→</span>
                      <Badge variant="secondary">{tarefa?.nome}</Badge>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => excluirAgendamento(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-gray-900">Administração</h2>
      </div>
      
      <p className="text-gray-600">
        Gerencie funcionários, tarefas e agendamentos do seu workspace. 
        Todas as alterações são salvas automaticamente e refletidas em tempo real.
      </p>

      <Tabs defaultValue="funcionarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="funcionarios" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Funcionários</span>
          </TabsTrigger>
          <TabsTrigger value="tarefas" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Tarefas</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Agenda</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="funcionarios">
          <GerenciarFuncionarios />
        </TabsContent>
        
        <TabsContent value="tarefas">
          <GerenciarTarefas />
        </TabsContent>
        
        <TabsContent value="agenda">
          <GerenciarAgenda />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Admin

