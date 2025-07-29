import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Clock, Target, Download, Calendar } from 'lucide-react'
import agendaData from '../data/agenda.json'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('hoje')
  const [tipoRelatorio, setTipoRelatorio] = useState('geral')

  // Análise de produtividade por funcionário
  const produtividadePorFuncionario = useMemo(() => {
    const resultado = {}
    
    agendaData.funcionarios.forEach(funcionario => {
      const tarefasFuncionario = agendaData.agenda.filter(item => item.funcionario === funcionario.id)
      const tempoTotal = tarefasFuncionario.reduce((total, item) => {
        const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
        return total + (tarefa?.tempoEstimado || 30)
      }, 0)
      
      resultado[funcionario.id] = {
        nome: funcionario.nome,
        totalTarefas: tarefasFuncionario.length,
        tempoTotal: tempoTotal,
        eficiencia: tarefasFuncionario.length > 0 ? (tempoTotal / tarefasFuncionario.length).toFixed(1) : 0,
        categorias: {}
      }
      
      // Análise por categoria
      tarefasFuncionario.forEach(item => {
        const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
        if (tarefa) {
          resultado[funcionario.id].categorias[tarefa.categoria] = 
            (resultado[funcionario.id].categorias[tarefa.categoria] || 0) + 1
        }
      })
    })
    
    return Object.values(resultado)
  }, [])

  // Análise de distribuição de carga de trabalho
  const distribuicaoCarga = useMemo(() => {
    return produtividadePorFuncionario.map(funcionario => ({
      nome: funcionario.nome,
      tarefas: funcionario.totalTarefas,
      tempo: funcionario.tempoTotal
    }))
  }, [produtividadePorFuncionario])

  // Análise por categoria
  const analisePorCategoria = useMemo(() => {
    const categorias = {}
    
    agendaData.agenda.forEach(item => {
      const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
      if (tarefa) {
        if (!categorias[tarefa.categoria]) {
          categorias[tarefa.categoria] = {
            nome: tarefa.categoria,
            quantidade: 0,
            tempoTotal: 0,
            funcionarios: new Set()
          }
        }
        categorias[tarefa.categoria].quantidade += 1
        categorias[tarefa.categoria].tempoTotal += tarefa.tempoEstimado
        categorias[tarefa.categoria].funcionarios.add(item.funcionario)
      }
    })
    
    return Object.values(categorias).map(cat => ({
      ...cat,
      funcionarios: cat.funcionarios.size,
      tempoMedio: (cat.tempoTotal / cat.quantidade).toFixed(1)
    }))
  }, [])

  // Análise de horários de pico
  const analiseHorarios = useMemo(() => {
    const porHorario = {}
    
    agendaData.agenda.forEach(item => {
      const hora = item.horario.split(':')[0]
      porHorario[hora] = (porHorario[hora] || 0) + 1
    })
    
    return Object.entries(porHorario)
      .map(([hora, quantidade]) => ({
        horario: `${hora}:00`,
        quantidade
      }))
      .sort((a, b) => parseInt(a.horario) - parseInt(b.horario))
  }, [])

  // Dados para gráfico de pizza das categorias
  const dadosPieCategoria = analisePorCategoria.map(cat => ({
    name: cat.nome.charAt(0).toUpperCase() + cat.nome.slice(1),
    value: cat.quantidade
  }))

  const RelatorioGeral = () => (
    <div className="space-y-6">
      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agendaData.agenda.length}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(agendaData.agenda.reduce((total, item) => {
                const tarefa = agendaData.tarefas.find(t => t.id === item.tarefa)
                return total + (tarefa?.tempoEstimado || 30)
              }, 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Horas de trabalho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(agendaData.agenda.map(item => item.funcionario)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              de {agendaData.funcionarios.length} funcionários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analisePorCategoria.length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos de atividades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Carga de Trabalho</CardTitle>
            <CardDescription>
              Número de tarefas por funcionário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoCarga}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tarefas" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades por Categoria</CardTitle>
            <CardDescription>
              Distribuição dos tipos de tarefas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPieCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPieCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise de horários */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Atividades por Horário</CardTitle>
          <CardDescription>
            Identificação dos horários de maior atividade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analiseHorarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="horario" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="quantidade" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )

  const RelatorioFuncionarios = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtividadePorFuncionario.map((funcionario, index) => (
          <Card key={funcionario.nome}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{funcionario.nome}</span>
                <Badge variant="outline">
                  {funcionario.totalTarefas} tarefas
                </Badge>
              </CardTitle>
              <CardDescription>
                Análise de produtividade individual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tempo total:</span>
                    <div className="font-semibold">{Math.round(funcionario.tempoTotal / 60)}h {funcionario.tempoTotal % 60}min</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tempo médio:</span>
                    <div className="font-semibold">{funcionario.eficiencia} min/tarefa</div>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Categorias:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(funcionario.categorias).map(([categoria, quantidade]) => (
                      <Badge key={categoria} variant="secondary" className="text-xs">
                        {categoria}: {quantidade}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600">Análises e métricas de produtividade da equipe</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
            <SelectTrigger className="w-[180px]">
              <BarChart className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Relatório Geral</SelectItem>
              <SelectItem value="funcionarios">Por Funcionários</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      {tipoRelatorio === 'geral' ? <RelatorioGeral /> : <RelatorioFuncionarios />}
    </div>
  )
}

export default Relatorios

