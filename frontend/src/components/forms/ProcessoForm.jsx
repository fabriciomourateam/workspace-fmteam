import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react'

export default function ProcessoForm({ 
  isOpen, 
  onClose, 
  processo = null, 
  tarefaId,
  tarefaNome,
  onSave 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tempo_estimado: '',
    frequencia: '',
    passos: [],
    observacoes: []
  })

  // Inicializar dados quando o processo muda
  useEffect(() => {
    if (processo) {
      setFormData({
        titulo: processo.titulo || '',
        descricao: processo.descricao || '',
        tempo_estimado: processo.tempo_estimado || '',
        frequencia: processo.frequencia || '',
        passos: processo.passos || [],
        observacoes: processo.observacoes || []
      })
    } else {
      setFormData({
        titulo: `Processo: ${tarefaNome}`,
        descricao: '',
        tempo_estimado: '30 minutos',
        frequencia: 'Diária',
        passos: [
          {
            numero: 1,
            titulo: 'Primeiro Passo',
            descricao: 'Descreva o primeiro passo do processo',
            tempo: '5 min',
            recursos: []
          }
        ],
        observacoes: []
      })
    }
  }, [processo, tarefaNome])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        ...formData,
        tarefa_id: tarefaId
      })
      onClose()
    } catch (error) {
      console.error('Erro ao salvar processo:', error)
      alert('Erro ao salvar processo: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const adicionarPasso = () => {
    const novoNumero = formData.passos.length + 1
    setFormData(prev => ({
      ...prev,
      passos: [...prev.passos, {
        numero: novoNumero,
        titulo: `Passo ${novoNumero}`,
        descricao: '',
        tempo: '5 min',
        recursos: []
      }]
    }))
  }

  const removerPasso = (index) => {
    setFormData(prev => ({
      ...prev,
      passos: prev.passos.filter((_, i) => i !== index).map((passo, i) => ({
        ...passo,
        numero: i + 1
      }))
    }))
  }

  const atualizarPasso = (index, campo, valor) => {
    setFormData(prev => ({
      ...prev,
      passos: prev.passos.map((passo, i) => 
        i === index ? { ...passo, [campo]: valor } : passo
      )
    }))
  }

  const adicionarRecurso = (passoIndex) => {
    const recurso = prompt('Digite o nome do recurso:')
    if (recurso) {
      setFormData(prev => ({
        ...prev,
        passos: prev.passos.map((passo, i) => 
          i === passoIndex 
            ? { ...passo, recursos: [...(passo.recursos || []), recurso] }
            : passo
        )
      }))
    }
  }

  const removerRecurso = (passoIndex, recursoIndex) => {
    setFormData(prev => ({
      ...prev,
      passos: prev.passos.map((passo, i) => 
        i === passoIndex 
          ? { ...passo, recursos: passo.recursos.filter((_, ri) => ri !== recursoIndex) }
          : passo
      )
    }))
  }

  const adicionarObservacao = () => {
    const observacao = prompt('Digite a observação:')
    if (observacao) {
      setFormData(prev => ({
        ...prev,
        observacoes: [...prev.observacoes, observacao]
      }))
    }
  }

  const removerObservacao = (index) => {
    setFormData(prev => ({
      ...prev,
      observacoes: prev.observacoes.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {processo ? 'Editar Processo' : 'Criar Novo Processo'}
          </DialogTitle>
          <DialogDescription>
            {processo 
              ? 'Edite as informações e passos do processo'
              : `Crie um processo detalhado para a tarefa: ${tarefaNome}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do Processo</Label>
              <input
                id="titulo"
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo_estimado">Tempo Estimado</Label>
              <input
                id="tempo_estimado"
                type="text"
                value={formData.tempo_estimado}
                onChange={(e) => setFormData(prev => ({ ...prev, tempo_estimado: e.target.value }))}
                placeholder="ex: 30 minutos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequencia">Frequência</Label>
              <select
                id="frequencia"
                value={formData.frequencia}
                onChange={(e) => setFormData(prev => ({ ...prev, frequencia: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Diária">Diária</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
                <option value="Conforme necessário">Conforme necessário</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva o objetivo e contexto do processo..."
            />
          </div>

          {/* Passos do Processo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Passos do Processo</h3>
              <Button type="button" onClick={adicionarPasso} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Passo
              </Button>
            </div>

            {formData.passos.map((passo, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {passo.numero}
                      </Badge>
                      <input
                        type="text"
                        value={passo.titulo}
                        onChange={(e) => atualizarPasso(index, 'titulo', e.target.value)}
                        className="font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:border-blue-500 focus:rounded px-2 py-1"
                        placeholder="Título do passo"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={passo.tempo}
                        onChange={(e) => atualizarPasso(index, 'tempo', e.target.value)}
                        className="text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1 w-20"
                        placeholder="5 min"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerPasso(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <textarea
                      value={passo.descricao}
                      onChange={(e) => atualizarPasso(index, 'descricao', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva detalhadamente este passo..."
                    />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Recursos necessários:</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => adicionarRecurso(index)}
                          className="text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Recurso
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(passo.recursos || []).map((recurso, recursoIndex) => (
                          <Badge 
                            key={recursoIndex} 
                            variant="outline" 
                            className="text-xs flex items-center gap-1"
                          >
                            {recurso}
                            <button
                              type="button"
                              onClick={() => removerRecurso(index, recursoIndex)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Observações */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Observações Importantes</h3>
              <Button type="button" onClick={adicionarObservacao} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Observação
              </Button>
            </div>

            {formData.observacoes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {formData.observacoes.map((obs, index) => (
                    <li key={index} className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-yellow-800">{obs}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removerObservacao(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Processo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}