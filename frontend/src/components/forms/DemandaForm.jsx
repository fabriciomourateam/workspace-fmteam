import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Save, X } from 'lucide-react'

export default function DemandaForm({ isOpen, onClose, demanda, funcionarios, tarefas, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    funcionario_id: '',
    tarefa_id: '',
    importancia: 'media',
    prazo: '',
    status: 'pendente',
    observacoes: ''
  })

  useEffect(() => {
    if (demanda) {
      setFormData({
        titulo: demanda.titulo || '',
        descricao: demanda.descricao || '',
        funcionario_id: demanda.funcionario_id || '',
        tarefa_id: demanda.tarefa_id || '',
        importancia: demanda.importancia || 'media',
        prazo: demanda.prazo || '',
        status: demanda.status || 'pendente',
        observacoes: demanda.observacoes || ''
      })
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        funcionario_id: '',
        tarefa_id: '',
        importancia: 'media',
        prazo: '',
        status: 'pendente',
        observacoes: ''
      })
    }
  }, [demanda])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar demanda:', error)
      alert('Erro ao salvar demanda: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calcular se o prazo está próximo ou passou
  const calcularStatusPrazo = (prazo) => {
    if (!prazo) return null
    
    const hoje = new Date()
    const dataPrazo = new Date(prazo)
    const diffTime = dataPrazo - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { tipo: 'atrasado', dias: Math.abs(diffDays) }
    if (diffDays === 0) return { tipo: 'hoje', dias: 0 }
    if (diffDays <= 2) return { tipo: 'urgente', dias: diffDays }
    if (diffDays <= 7) return { tipo: 'proximo', dias: diffDays }
    return { tipo: 'normal', dias: diffDays }
  }

  const statusPrazo = calcularStatusPrazo(formData.prazo)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {demanda ? 'Editar Demanda' : 'Nova Demanda'}
          </DialogTitle>
          <DialogDescription>
            {demanda ? 'Atualize as informações da demanda' : 'Crie uma nova demanda importante'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título da Demanda *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleChange('titulo', e.target.value)}
                placeholder="Ex: Implementar nova funcionalidade"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descreva detalhadamente o que precisa ser feito..."
                rows={3}
                required
              />
            </div>
          </div>

          {/* Atribuição e Categorização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="funcionario">Responsável *</Label>
              <Select
                value={formData.funcionario_id}
                onValueChange={(value) => handleChange('funcionario_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarios.map(funcionario => (
                    <SelectItem key={funcionario.id} value={funcionario.id}>
                      {funcionario.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tarefa">Categoria da Tarefa</Label>
              <Select
                value={formData.tarefa_id}
                onValueChange={(value) => handleChange('tarefa_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {tarefas.map(tarefa => (
                    <SelectItem key={tarefa.id} value={tarefa.id}>
                      {tarefa.nome} ({tarefa.categoria})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prioridade e Prazo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="importancia">Importância *</Label>
              <Select
                value={formData.importancia}
                onValueChange={(value) => handleChange('importancia', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Alta
                    </div>
                  </SelectItem>
                  <SelectItem value="media">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem value="baixa">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Baixa
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prazo">Prazo *</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => handleChange('prazo', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {statusPrazo && (
                <p className={`text-xs mt-1 ${
                  statusPrazo.tipo === 'atrasado' ? 'text-red-600' :
                  statusPrazo.tipo === 'hoje' ? 'text-orange-600' :
                  statusPrazo.tipo === 'urgente' ? 'text-orange-600' :
                  statusPrazo.tipo === 'proximo' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {statusPrazo.tipo === 'atrasado' ? `${statusPrazo.dias} dias atrasado` :
                   statusPrazo.tipo === 'hoje' ? 'Vence hoje' :
                   statusPrazo.tipo === 'urgente' ? `${statusPrazo.dias} dias restantes (urgente)` :
                   statusPrazo.tipo === 'proximo' ? `${statusPrazo.dias} dias restantes` :
                   `${statusPrazo.dias} dias restantes`}
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Informações adicionais, contexto, dependências..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.titulo || !formData.descricao || !formData.funcionario_id || !formData.prazo}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : demanda ? 'Atualizar' : 'Criar Demanda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}