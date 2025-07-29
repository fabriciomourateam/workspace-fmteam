import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Settings, Users, Calendar, FileText } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
import { useNotifications } from '../contexts/NotificationContext'

function Admin() {
  const [activeTab, setActiveTab] = useState('funcionarios')
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administração</h2>
          <Loading message="Carregando dados..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administração</h2>
        </div>
        <ErrorMessage error={error} onRetry={refetchAll} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Administração</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie funcionários, tarefas e agendamentos</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Users className="w-3 h-3 mr-1" />
            {funcionarios?.length || 0} Funcionários
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <FileText className="w-3 h-3 mr-1" />
            {tarefas?.length || 0} Tarefas
          </Badge>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            <Calendar className="w-3 h-3 mr-1" />
            {agenda?.length || 0} Agendamentos
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

        {/* Funcionários Tab */}
        <TabsContent value="funcionarios" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Funcionários</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Funcionário
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funcionarios?.map(funcionario => (
              <Card key={funcionario.id} className="hover-lift">
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
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-mono">{funcionario.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Horário:</span>
                      <span>
                        {funcionario.horarioInicio === 'flexible' 
                          ? 'Flexível' 
                          : `${funcionario.horarioInicio} - ${funcionario.horarioFim}`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tarefas Tab */}
        <TabsContent value="tarefas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tarefas</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Tarefa
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tarefas?.map(tarefa => (
              <Card key={tarefa.id} className="hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tarefa.nome}</CardTitle>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categoria:</span>
                      <Badge variant="outline">{tarefa.categoria}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo:</span>
                      <span>{tarefa.tempoEstimado} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridade:</span>
                      <Badge variant={tarefa.prioridade === 'alta' ? 'destructive' : 'secondary'}>
                        {tarefa.prioridade}
                      </Badge>
                    </div>
                    {tarefa.descricao && (
                      <p className="text-gray-600 text-xs mt-2">{tarefa.descricao}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agenda Tab */}
        <TabsContent value="agenda" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Agendamentos</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Agendamento
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Lista de Agendamentos</CardTitle>
              <CardDescription>
                {agenda?.length || 0} agendamentos cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {agenda?.slice(0, 20).map((item, index) => {
                  const funcionario = funcionarios?.find(f => f.id === item.funcionario)
                  const tarefa = tarefas?.find(t => t.id === item.tarefa)
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{item.horario}</Badge>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: funcionario?.cor || '#gray' }}
                          />
                          <span className="font-medium">{funcionario?.nome || item.funcionario}</span>
                        </div>
                        <span className="text-gray-600">→</span>
                        <span className="text-sm">{tarefa?.nome || item.tarefa}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                
                {agenda && agenda.length > 20 && (
                  <div className="text-center py-4 text-gray-500">
                    ... e mais {agenda.length - 20} agendamentos
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Admin