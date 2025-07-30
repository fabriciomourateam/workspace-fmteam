import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Users, Clock, Target, Download, Calendar, FileSpreadsheet, FileText, File, FileImage, FileDown } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { Loading } from './ui/loading'
import { ErrorMessage } from './ui/error'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

  const exportarPDF = async () => {
    try {
      // Encontrar o elemento do relatório
      const elemento = document.getElementById('relatorio-container')
      if (!elemento) {
        alert('❌ Erro: Não foi possível encontrar o conteúdo do relatório')
        return
      }

      // Mostrar loading
      const loadingMsg = document.createElement('div')
      loadingMsg.innerHTML = '📄 Gerando PDF... Aguarde...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;font-size:16px;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)

      // Aguardar um pouco para garantir que o DOM está estável
      await new Promise(resolve => setTimeout(resolve, 500))

      // Capturar screenshot com configurações mais robustas
      const canvas = await html2canvas(elemento, {
        scale: 1.5, // Qualidade boa mas não excessiva
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false, // Desabilitar logs
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false, // Evitar problemas com SVG
        ignoreElements: (element) => {
          // Ignorar elementos que podem causar problemas
          return element.tagName === 'IFRAME' || 
                 element.tagName === 'OBJECT' || 
                 element.tagName === 'EMBED' ||
                 element.classList?.contains('recharts-surface') // Ignorar gráficos complexos se necessário
        }
      })

      // Criar PDF
      const imgData = canvas.toDataURL('image/png', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Calcular dimensões para caber na página
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight() - 20
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min((pdfWidth - 20) / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      // Adicionar imagem ao PDF
      const scaledHeight = imgHeight * ratio
      if (scaledHeight > pdfHeight) {
        const newRatio = pdfHeight / imgHeight
        pdf.addImage(imgData, 'PNG', (pdfWidth - imgWidth * newRatio) / 2, imgY, imgWidth * newRatio, imgHeight * newRatio)
      } else {
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, scaledHeight)
      }

      // Salvar
      const timestamp = new Date().toISOString().split('T')[0]
      pdf.save(`relatorio-visual-${timestamp}.pdf`)

      // Remover loading
      document.body.removeChild(loadingMsg)
      alert('✅ Relatório PDF exportado com sucesso!')

    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      // Remover loading se ainda existir
      const existingLoading = document.querySelector('[style*="position:fixed"][style*="z-index:9999"]')
      if (existingLoading) {
        document.body.removeChild(existingLoading)
      }
      alert(`❌ Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}. Tente novamente.`)
    }
  }

  const exportarJPEG = async () => {
    try {
      // Encontrar o elemento do relatório
      const elemento = document.getElementById('relatorio-container')
      if (!elemento) {
        alert('❌ Erro: Não foi possível encontrar o conteúdo do relatório')
        return
      }

      // Mostrar loading
      const loadingMsg = document.createElement('div')
      loadingMsg.innerHTML = '🖼️ Gerando imagem... Aguarde...'
      loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);z-index:9999;font-size:16px;font-family:Arial,sans-serif;'
      document.body.appendChild(loadingMsg)

      // Aguardar um pouco para garantir que o DOM está estável
      await new Promise(resolve => setTimeout(resolve, 500))

      // Capturar screenshot com configurações mais robustas
      const canvas = await html2canvas(elemento, {
        scale: 1.5, // Qualidade boa mas não excessiva
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false, // Desabilitar logs
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false, // Evitar problemas com SVG
        onclone: (clonedDoc) => {
          // Substituir cores problemáticas no documento clonado
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
              border-color: rgb(200, 200, 200) !important;
            }
            .bg-red-600 { background-color: rgb(220, 38, 38) !important; }
            .bg-blue-600 { background-color: rgb(37, 99, 235) !important; }
            .bg-green-600 { background-color: rgb(22, 163, 74) !important; }
            .bg-yellow-500 { background-color: rgb(234, 179, 8) !important; }
            .bg-purple-600 { background-color: rgb(147, 51, 234) !important; }
            .text-red-600 { color: rgb(220, 38, 38) !important; }
            .text-blue-600 { color: rgb(37, 99, 235) !important; }
            .text-green-600 { color: rgb(22, 163, 74) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .text-gray-900 { color: rgb(17, 24, 39) !important; }
          `
          clonedDoc.head.appendChild(style)
        },
        ignoreElements: (element) => {
          // Ignorar elementos que podem causar problemas
          return element.tagName === 'IFRAME' || 
                 element.tagName === 'OBJECT' || 
                 element.tagName === 'EMBED'
        }
      })

      // Converter para JPEG e baixar
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Falha ao gerar imagem')
        }
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        const timestamp = new Date().toISOString().split('T')[0]
        link.href = url
        link.download = `relatorio-visual-${timestamp}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        // Remover loading
        document.body.removeChild(loadingMsg)
        alert('✅ Relatório JPEG exportado com sucesso!')
      }, 'image/jpeg', 0.95)

    } catch (error) {
      console.error('Erro ao gerar JPEG:', error)
      // Remover loading se ainda existir
      const existingLoading = document.querySelector('[style*="position:fixed"][style*="z-index:9999"]')
      if (existingLoading) {
        document.body.removeChild(existingLoading)
      }
      alert(`❌ Erro ao gerar imagem: ${error.message || 'Erro desconhecido'}. Tente novamente.`)
    }
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
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600">Análises e métricas de produtividade da equipe</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
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
          
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-600 font-medium">📊 Exportação Visual:</div>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                onClick={exportarPDF}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 shadow-md"
              >
                <FileDown className="w-4 h-4" />
                <span>PDF</span>
              </Button>
              <Button 
                variant="default" 
                onClick={exportarJPEG}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                <FileImage className="w-4 h-4" />
                <span>JPEG</span>
              </Button>
            </div>
            

            
            <div className="text-xs text-gray-600 font-medium">📄 Exportação de Dados:</div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => exportarRelatorio('excel')}
                className="flex items-center space-x-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => exportarRelatorio('csv')}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>CSV</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

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

