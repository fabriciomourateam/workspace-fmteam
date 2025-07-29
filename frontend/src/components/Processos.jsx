import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, FileText, CheckCircle, AlertCircle, Play, Users, Target } from 'lucide-react'
import agendaData from '../data/agenda.json'
import processosData from '../data/processos.json'

function Processos() {
  const [processoSelecionado, setProcessoSelecionado] = useState(null)

  const ProcessoModal = ({ processo, isOpen, onClose }) => {
    if (!processo) return null

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{processo.titulo}</span>
            </DialogTitle>
            <DialogDescription>
              {processo.descricao}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações gerais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Tempo:</strong> {processo.tempoEstimado}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  <strong>Frequência:</strong> {processo.frequencia}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="text-sm">
                  <strong>Passos:</strong> {processo.passos.length}
                </span>
              </div>
            </div>

            {/* Passos do processo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passos do Processo</h3>
              {processo.passos.map((passo, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center space-x-2">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {passo.numero}
                        </Badge>
                        <span>{passo.titulo}</span>
                      </CardTitle>
                      <Badge variant="secondary">
                        {passo.tempo}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{passo.descricao}</p>
                    {passo.recursos && passo.recursos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recursos necessários:</h4>
                        <div className="flex flex-wrap gap-2">
                          {passo.recursos.map((recurso, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {recurso}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Observações */}
            {processo.observacoes && processo.observacoes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Observações Importantes</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {processo.observacoes.map((obs, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const ProcessoCard = ({ tarefaId, tarefa }) => {
    const processo = processosData[tarefaId]
    
    if (!processo) {
      return (
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <span>{tarefa.nome}</span>
            </CardTitle>
            <CardDescription>
              Processo em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Documentação do processo ainda não disponível.
            </div>
          </CardContent>
        </Card>
      )
    }

    const categoriasCores = {
      'gestao': 'border-blue-500',
      'atendimento': 'border-green-500',
      'marketing': 'border-yellow-500',
      'engajamento': 'border-red-500',
      'conteudo': 'border-purple-500',
      'produto': 'border-cyan-500',
      'interno': 'border-pink-500'
    }

    const corBorda = categoriasCores[tarefa.categoria] || 'border-gray-500'

    return (
      <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-l-4 ${corBorda}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{processo.titulo}</span>
            </CardTitle>
            <Badge variant="outline" className="capitalize">
              {tarefa.categoria}
            </Badge>
          </div>
          <CardDescription>
            {processo.descricao}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{processo.tempoEstimado}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{processo.passos.length} passos</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {processo.frequencia}
              </Badge>
            </div>
            
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setProcessoSelecionado(processo)}
            >
              <Play className="w-4 h-4 mr-2" />
              Ver Processo Detalhado
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Processos Detalhados</h2>
        <p className="text-gray-600">Instruções passo a passo para cada tipo de tarefa</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(processosData).length}</div>
            <p className="text-xs text-muted-foreground">
              Processos documentados
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
              {Object.values(processosData).reduce((total, processo) => {
                const tempo = parseInt(processo.tempoEstimado.split(' ')[0])
                return total + tempo
              }, 0)} min
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo total dos processos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passos Totais</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(processosData).reduce((total, processo) => {
                return total + processo.passos.length
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Passos documentados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de processos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agendaData.tarefas.map(tarefa => (
          <ProcessoCard 
            key={tarefa.id} 
            tarefaId={tarefa.id} 
            tarefa={tarefa}
          />
        ))}
      </div>

      {/* Modal de processo */}
      <ProcessoModal 
        processo={processoSelecionado}
        isOpen={!!processoSelecionado}
        onClose={() => setProcessoSelecionado(null)}
      />
    </div>
  )
}

export default Processos

