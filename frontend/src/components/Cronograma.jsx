import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, User, Filter, Calendar } from 'lucide-react'
import agendaData from '../data/agenda.json'

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

  // Horários únicos ordenados
  const horarios = useMemo(() => {
    const horariosSet = new Set(agendaData.agenda.map(item => item.horario))
    return Array.from(horariosSet).sort()
  }, [])

  // Dados filtrados
  const dadosFiltrados = useMemo(() => {
    if (funcionarioSelecionado === 'todos') {
      return agendaData.agenda
    }
    return agendaData.agenda.filter(item => item.funcionario === funcionarioSelecionado)
  }, [funcionarioSelecionado])

  // Organizar dados por funcionário e horário
  const cronogramaPorFuncionario = useMemo(() => {
    const resultado = {}
    
    agendaData.funcionarios.forEach(funcionario => {
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
        const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
        resultado[item.funcionario].tarefas[item.horario] = {
          ...item,
          tarefaInfo: tarefa
        }
      }
    })
    
    return resultado
  }, [dadosFiltrados, horarios])

  const TarefaCard = ({ tarefa, horario }) => {
    if (!tarefa) {
      return (
        <div className="h-16 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Livre</span>
        </div>
      )
    }

    const categoria = tarefa.tarefaInfo?.categoria || 'interno'
    const corCategoria = categoriasCores[categoria] || 'bg-gray-500'

    return (
      <div className={`h-16 ${corCategoria} rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="text-sm font-medium truncate">
          {tarefa.tarefaInfo?.nome || tarefa.tarefa}
        </div>
        <div className="text-xs opacity-90">
          {tarefa.tarefaInfo?.tempoEstimado || 30} min
        </div>
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
                  {funcionario.horarioInicio === 'flexible' 
                    ? 'Horário Flexível' 
                    : `${funcionario.horarioInicio} - ${funcionario.horarioFim}`
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

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cronograma</h2>
          <p className="text-gray-600">Visualização das atividades por funcionário e horário</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={funcionarioSelecionado} onValueChange={setFuncionarioSelecionado}>
            <SelectTrigger className="w-[180px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Funcionário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os funcionários</SelectItem>
              {agendaData.funcionarios.map(funcionario => (
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
    </div>
  )
}

export default Cronograma

