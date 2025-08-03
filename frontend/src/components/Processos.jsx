import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, FileText, CheckCircle, AlertCircle, Play, Users, Target, Edit, Plus, Trash2 } from 'lucide-react'
import { useTarefas } from '../hooks/useApi'
import ProcessoForm from './forms/ProcessoForm'
import supabaseService from '../services/supabase'
import processosData from '../data/processos.json'

function Processos() {
  const [processoSelecionado, setProcessoSelecionado] = useState(null)
  const [processos, setProcessos] = useState([])
  const [loading, setLoading] = useState(true)
  const [processoFormOpen, setProcessoFormOpen] = useState(false)
  const [editingProcesso, setEditingProcesso] = useState(null)
  const [editingTarefaId, setEditingTarefaId] = useState(null)
  const [editingTarefaNome, setEditingTarefaNome] = useState('')

  const { data: tarefas } = useTarefas()

  // Carregar processos
  useEffect(() => {
    carregarProcessos()
  }, [])

  const carregarProcessos = async () => {
    setLoading(true)
    try {
      // Tentar carregar tarefas primeiro
      const tarefas = await supabaseService.getTarefas()
      
      // Tentar carregar processos do Supabase (pode falhar se a tabela não existir)
      let processosSupabase = []
      try {
        processosSupabase = await supabaseService.getProcessos()
      } catch (processosError) {
        console.warn('Tabela processos não existe ainda, usando apenas dados do JSON:', processosError.message)
      }
      
      // Criar mapa de tarefas por ID
      const tarefasMap = {}
      tarefas.forEach(tarefa => {
        tarefasMap[tarefa.id] = tarefa
      })
      
      // Criar mapa de processos do Supabase por tarefa_id
      const processosMap = {}
      processosSupabase.forEach(processo => {
        processosMap[processo.tarefa_id] = {
          ...processo,
          tarefa: tarefasMap[processo.tarefa_id] // Adicionar informações da tarefa
        }
      })
      
      // Combinar com dados do JSON (usar Supabase se existir, senão usar JSON)
      const processosCombinados = []
      
      // Para cada processo no JSON, verificar se existe versão editada no Supabase
      Object.keys(processosData).forEach(tarefaId => {
        const processoJson = processosData[tarefaId]
        const processoSupabase = processosMap[tarefaId]
        
        if (processoSupabase) {
          // Usar versão do Supabase (editada)
          processosCombinados.push({
            ...processoSupabase,
            isEdited: true
          })
        } else {
          // Usar versão do JSON (original)
          processosCombinados.push({
            tarefa_id: tarefaId,
            titulo: processoJson.titulo,
            descricao: processoJson.descricao,
            tempo_estimado: processoJson.tempoEstimado,
            frequencia: processoJson.frequencia,
            passos: processoJson.passos,
            observacoes: processoJson.observacoes,
            tarefa: tarefasMap[tarefaId], // Adicionar informações da tarefa
            isEdited: false,
            isFromJson: true
          })
        }
      })
      
      // Adicionar processos que existem apenas no Supabase (novos)
      processosSupabase.forEach(processo => {
        if (!processosData[processo.tarefa_id]) {
          processosCombinados.push({
            ...processo,
            isEdited: true,
            isNew: true
          })
        }
      })
      
      setProcessos(processosCombinados)
    } catch (error) {
      console.error('Erro ao carregar processos:', error)
      // Em caso de erro geral, usar apenas dados do JSON
      const processosBasicos = Object.keys(processosData).map(tarefaId => ({
        tarefa_id: tarefaId,
        titulo: processosData[tarefaId].titulo,
        descricao: processosData[tarefaId].descricao,
        tempo_estimado: processosData[tarefaId].tempoEstimado,
        frequencia: processosData[tarefaId].frequencia,
        passos: processosData[tarefaId].passos,
        observacoes: processosData[tarefaId].observacoes,
        isEdited: false,
        isFromJson: true
      }))
      setProcessos(processosBasicos)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProcesso = async (processoData) => {
    try {
      if (editingProcesso && editingProcesso.id) {
        // Atualizar processo existente no Supabase
        await supabaseService.updateProcesso(editingProcesso.id, processoData)
      } else {
        // Criar novo processo no Supabase (pode ser uma edição de um processo do JSON)
        await supabaseService.createProcesso(processoData)
      }
      
      carregarProcessos()
      setProcessoFormOpen(false)
      setEditingProcesso(null)
      alert('Processo salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar processo:', error)
      if (error.message.includes('does not exist')) {
        alert('A tabela de processos ainda não foi criada no Supabase. Execute o SQL do arquivo CREATE_PROCESSOS_TABLE.sql no painel do Supabase para habilitar a edição de processos.')
      } else {
        alert('Erro ao salvar processo: ' + error.message)
      }
      throw error
    }
  }

  const handleDeleteProcesso = async (processo) => {
    if (processo.isFromJson && !processo.id) {
      alert('Este é um processo padrão e não pode ser excluído. Você pode editá-lo para criar uma versão personalizada.')
      return
    }

    if (!window.confirm(`Tem certeza que deseja excluir o processo "${processo.titulo}"?`)) {
      return
    }

    try {
      await supabaseService.deleteProcesso(processo.id)
      carregarProcessos()
      alert('Processo excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir processo:', error)
      alert('Erro ao excluir processo: ' + error.message)
    }
  }

  const handleEditProcesso = (processo) => {
    setEditingProcesso(processo)
    setEditingTarefaId(processo.tarefa_id)
    
    // Buscar nome da tarefa
    const tarefa = tarefas?.find(t => t.id === processo.tarefa_id)
    setEditingTarefaNome(tarefa?.nome || processo.tarefa?.nome || 'Tarefa')
    setProcessoFormOpen(true)
  }

  const handleCreateProcesso = (tarefaId, tarefaNome) => {
    setEditingProcesso(null)
    setEditingTarefaId(tarefaId)
    setEditingTarefaNome(tarefaNome)
    setProcessoFormOpen(true)
  }

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
                  <strong>Tempo:</strong> {processo.tempo_estimado}
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
                  <strong>Passos:</strong> {processo.passos?.length || 0}
                </span>
              </div>
            </div>

            {/* Passos do processo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Passos do Processo</h3>
              {(processo.passos || []).map((passo, index) => (
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

  const ProcessoCard = ({ tarefa }) => {
    const processo = processos.find(p => p.tarefa_id === tarefa.id)
    
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

    if (!processo) {
      return (
        <Card className={`hover:shadow-lg transition-shadow border-l-4 ${corBorda} border-dashed`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span>{tarefa.nome}</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {tarefa.categoria}
              </Badge>
            </CardTitle>
            <CardDescription>
              Processo ainda não documentado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-500">
                Clique para criar a documentação deste processo.
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleCreateProcesso(tarefa.id, tarefa.nome)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Processo
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className={`hover:shadow-lg transition-shadow border-l-4 ${corBorda} group relative`}>
        {/* Indicador de status */}
        <div className="absolute top-2 right-2">
          {processo.isEdited ? (
            <Badge variant="default" className="text-xs bg-green-500">
              {processo.isNew ? 'Novo' : 'Editado'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Original
            </Badge>
          )}
        </div>

        <CardHeader className="pr-20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{processo.titulo}</span>
            </CardTitle>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="capitalize">
              {tarefa.categoria}
            </Badge>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditProcesso(processo)}
                className="p-2"
                title={processo.isFromJson ? 'Editar (criará versão personalizada)' : 'Editar processo'}
              >
                <Edit className="w-4 h-4" />
              </Button>
              {processo.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProcesso(processo)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Excluir processo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
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
                  <span>{processo.tempo_estimado}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{processo.passos?.length || 0} passos</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {processo.frequencia}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => setProcessoSelecionado(processo)}
              >
                <Play className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleEditProcesso(processo)}
                className="px-3"
                title={processo.isFromJson ? 'Editar (criará versão personalizada)' : 'Editar processo'}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
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

      {/* Aviso sobre tabela processos */}
      {processos.length > 0 && processos.every(p => p.isFromJson) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Tabela de processos não encontrada</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Para habilitar a edição de processos, execute o arquivo <code className="bg-yellow-100 px-1 rounded">CREATE_PROCESSOS_TABLE.sql</code> no SQL Editor do Supabase.
                Atualmente, apenas a visualização dos processos padrão está disponível.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processos.length}</div>
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
              {processos.reduce((total, processo) => {
                const tempo = parseInt(processo.tempo_estimado?.split(' ')[0] || '0')
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
              {processos.reduce((total, processo) => {
                return total + (processo.passos?.length || 0)
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Passos documentados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de processos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Carregando processos...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tarefas?.map(tarefa => (
            <ProcessoCard 
              key={tarefa.id} 
              tarefa={tarefa}
            />
          ))}
        </div>
      )}

      {/* Modal de processo */}
      <ProcessoModal 
        processo={processoSelecionado}
        isOpen={!!processoSelecionado}
        onClose={() => setProcessoSelecionado(null)}
      />

      {/* Modal de edição */}
      <ProcessoForm
        isOpen={processoFormOpen}
        onClose={() => {
          setProcessoFormOpen(false)
          setEditingProcesso(null)
        }}
        processo={editingProcesso}
        tarefaId={editingTarefaId}
        tarefaNome={editingTarefaNome}
        onSave={handleSaveProcesso}
      />
    </div>
  )
}

export default Processos

