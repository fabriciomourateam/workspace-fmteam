import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Clock, Target, Download, Calendar, FileSpreadsheet, FileText, File } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'



const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('hoje')
  const [tipoRelatorio, setTipoRelatorio] = useState('geral')

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

  // Funções de exportação
  const exportarCSV = (dados, nomeArquivo) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + dados.map(row => Object.values(row).join(",")).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${nomeArquivo}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarJSON = (dados, nomeArquivo) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2))
    const link = document.createElement("a")
    link.setAttribute("href", dataStr)
    link.setAttribute("download", `${nomeArquivo}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarExcel = (dados, nomeArquivo) => {
    // Criar conteúdo HTML que o Excel pode interpretar
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Relatório de Produtividade</title>
        </head>
        <body>
          <h1>Relatório de Produtividade - ${new Date().toLocaleDateString('pt-BR')}</h1>
          <h2>Resumo Geral</h2>
          <table border="1">
            <tr><td>Total de Funcionários</td><td>${funcionarios?.length || 0}</td></tr>
            <tr><td>Total de Agendamentos</td><td>${agenda?.length || 0}</td></tr>
            <tr><td>Tempo Total (minutos)</td><td>${agenda?.reduce((total, item) => {
              const tarefaId = item.tarefa || item.tarefa_id
              const tarefa = tarefas?.find(t => t.id === tarefaId)
              return total + (tarefa?.tempo_estimado || 30)
            }, 0) || 0}</td></tr>
          </table>
          
          <h2>Produtividade por Funcionário</h2>
          <table border="1">
            <tr>
              <th>Funcionário</th>
              <th>Total de Tarefas</th>
              <th>Tempo Total (min)</th>
              <th>Tempo Médio (min)</th>
            </tr>
    `
    
    dados.forEach(func => {
      htmlContent += `
        <tr>
          <td>${func.Funcionario}</td>
          <td>${func.TotalTarefas}</td>
          <td>${func.TempoTotal}</td>
          <td>${func.TempoMedio}</td>
        </tr>
      `
    })
    
    htmlContent += `
          </table>
          
          <h2>Distribuição por Categoria</h2>
          <table border="1">
            <tr><th>Categoria</th><th>Quantidade</th></tr>
    `
    
    analisePorCategoria.forEach(cat => {
      htmlContent += `
        <tr>
          <td>${cat.nome}</td>
          <td>${cat.quantidade}</td>
        </tr>
      `
    })
    
    htmlContent += `
          </table>
        </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${nomeArquivo}.xls`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }













  const exportarRelatorio = (formato) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const dadosRelatorio = {
      geradoEm: new Date().toLocaleString('pt-BR'),
      funcionarios: funcionarios?.length || 0,
      tarefas: agenda?.length || 0,
      tempoTotal: agenda?.reduce((total, item) => {
        const tarefa = tarefas?.find(t => t.id === (item.tarefa || item.tarefa_id))
        return total + (tarefa?.tempo_estimado || 30)
      }, 0) || 0,
      produtividadePorFuncionario: produtividadePorFuncionario,
      analisePorCategoria: analisePorCategoria,
      analiseHorarios: analiseHorarios
    }

    const dadosCSV = produtividadePorFuncionario.map(func => ({
      Funcionario: func.nome,
      TotalTarefas: func.totalTarefas,
      TempoTotal: func.tempoTotal,
      TempoMedio: func.eficiencia
    }))

    if (formato === 'csv') {
      exportarCSV(dadosCSV, `relatorio-funcionarios-${timestamp}`)
      alert('✅ Relatório CSV exportado com sucesso!')
    } else if (formato === 'excel') {
      exportarExcel(dadosCSV, `relatorio-completo-${timestamp}`)
      alert('✅ Relatório Excel exportado com sucesso!')
    } else if (formato === 'json') {
      exportarJSON(dadosRelatorio, `relatorio-completo-${timestamp}`)
      alert('✅ Relatório JSON exportado com sucesso!')
    }
  }

  // Análise de produtividade por funcionário
  const produtividadePorFuncionario = useMemo(() => {
    if (!funcionarios || !agenda || !tarefas) return []
    
    const resultado = {}
    
    funcionarios.forEach(funcionario => {
      const tarefasFuncionario = agenda.filter(item => 
        (item.funcionario || item.funcionario_id) === funcionario.id
      )
      const tempoTotal = tarefasFuncionario.reduce((total, item) => {
        const tarefaId = item.tarefa || item.tarefa_id
        const tarefa = tarefas.find(t => t.id === tarefaId)
        return total + (tarefa?.tempo_estimado || 30)
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
        const tarefaId = item.tarefa || item.tarefa_id
        const tarefa = tarefas.find(t => t.id === tarefaId)
        if (tarefa) {
          resultado[funcionario.id].categorias[tarefa.categoria] = 
            (resultado[funcionario.id].categorias[tarefa.categoria] || 0) + 1
        }
      })
    })
    
    return Object.values(resultado)
  }, [funcionarios, agenda, tarefas])

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
    if (!agenda || !tarefas) return []
    
    const categorias = {}
    
    agenda.forEach(item => {
      const tarefaId = item.tarefa || item.tarefa_id
      const funcionarioId = item.funcionario || item.funcionario_id
      const tarefa = tarefas.find(t => t.id === tarefaId)
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
        categorias[tarefa.categoria].tempoTotal += (tarefa.tempo_estimado || 30)
        categorias[tarefa.categoria].funcionarios.add(funcionarioId)
      }
    })
    
    return Object.values(categorias).map(cat => ({
      ...cat,
      funcionarios: cat.funcionarios.size,
      tempoMedio: (cat.tempoTotal / cat.quantidade).toFixed(1)
    }))
  }, [agenda, tarefas])

  // Análise de horários de pico
  const analiseHorarios = useMemo(() => {
    if (!agenda) return []
    
    const porHorario = {}
    
    agenda.forEach(item => {
      const hora = item.horario.split(':')[0]
      porHorario[hora] = (porHorario[hora] || 0) + 1
    })
    
    return Object.entries(porHorario)
      .map(([hora, quantidade]) => ({
        horario: `${hora}:00`,
        quantidade
      }))
      .sort((a, b) => parseInt(a.horario) - parseInt(b.horario))
  }, [agenda])

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
            <div className="text-2xl font-bold">{agenda?.length || 0}</div>
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
              {Math.round((agenda?.reduce((total, item) => {
                const tarefaId = item.tarefa || item.tarefa_id
                const tarefa = tarefas?.find(t => t.id === tarefaId)
                return total + (tarefa?.tempo_estimado || 30)
              }, 0) || 0) / 60)}h
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
              {new Set(agenda?.map(item => item.funcionario || item.funcionario_id) || []).size}
            </div>
            <p className="text-xs text-muted-foreground">
              de {funcionarios?.length || 0} funcionários
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
          <Loading message="Carregando dados para relatórios..." />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios</h2>
        </div>
        <ErrorMessage error={error} onRetry={refetchAll} />
      </div>
    )
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/20 -m-6 p-6">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/5 to-pink-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header premium com design igual ao cronograma */}
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
                    <BarChart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-lg flex items-center gap-3">
                      Relatórios
                      <TrendingUp className="w-6 h-6 animate-pulse" />
                    </h2>
                    <p className="text-blue-100 text-lg font-medium mt-1">
                      Análises e métricas de produtividade da equipe
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 shadow-lg">
                    <Target className="w-5 h-5 text-white/90" />
                    <span className="text-white font-semibold">
                      {agenda?.length || 0} tarefa{agenda?.length !== 1 ? 's' : ''} analisada{agenda?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 px-3 py-1 rounded-full font-semibold">
                    {Math.round((agenda?.reduce((total, item) => {
                      const tarefaId = item.tarefa || item.tarefa_id
                      const tarefa = tarefas?.find(t => t.id === tarefaId)
                      return total + (tarefa?.tempo_estimado || 30)
                    }, 0) || 0) / 60)}h de trabalho
                  </Badge>
                </div>
              </div>
              
              {/* Controles premium */}
              <div className="flex flex-col gap-3 bg-white/15 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger className="w-[200px] bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:ring-white/50">
                    <BarChart className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Relatório Geral</SelectItem>
                    <SelectItem value="funcionarios">Por Funcionários</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => exportarRelatorio('excel')}
                    className="text-white hover:bg-white/20 rounded-xl px-3 py-2 font-medium flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => exportarRelatorio('csv')}
                    className="text-white hover:bg-white/20 rounded-xl px-3 py-2 font-medium flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>CSV</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo do relatório */}
      <div id="relatorio-container" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        {/* Header do relatório para exportação */}
        <div style={{ marginBottom: '24px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            Relatório de Produtividade
          </h1>
          <p style={{ color: '#6b7280', margin: '8px 0', fontSize: '14px' }}>
            Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0' }}>
            Workspace Visual - Sistema de Gestão de Tempo
          </p>
        </div>
        
        {tipoRelatorio === 'geral' ? <RelatorioGeral /> : <RelatorioFuncionarios />}
        
        {/* Footer do relatório */}
        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
          <p style={{ margin: '4px 0' }}>Este relatório foi gerado automaticamente pelo sistema Workspace Visual</p>
          <p style={{ margin: '4px 0' }}>Dados atualizados em tempo real do banco de dados</p>
        </div>
      </div>
    </div>
  )
}

export default Relatorios

