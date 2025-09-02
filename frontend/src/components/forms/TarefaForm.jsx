import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Save, X, Target, MessageCircle } from 'lucide-react'

export default function TarefaForm({ isOpen, onClose, tarefa, funcionarios, onSave }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    funcionario_responsavel_id: '',
    importancia: 'media',
    concluida: false,
    prazo: '',
    observacoes: ''
  })

  useEffect(() => {
    if (tarefa) {
      setFormData({
        titulo: tarefa.titulo || '',
        descricao: tarefa.descricao || '',
        funcionario_responsavel_id: tarefa.funcionario_responsavel_id || '',
        importancia: tarefa.importancia || 'media',
        concluida: tarefa.concluida || false,
        prazo: tarefa.prazo || '',
        observacoes: tarefa.observacoes || ''
      })
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        funcionario_responsavel_id: '',
        importancia: 'media',
        concluida: false,
        prazo: '',
        observacoes: ''
      })
    }
  }, [tarefa])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      alert('Erro ao salvar tarefa: ' + error.message)
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

  // Mensagem padrão gerada automaticamente no sistema

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {tarefa ? 'Atualize as informações da tarefa' : 'Crie uma nova tarefa à fazer'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título da Tarefa *</Label>
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
                placeholder="Descreva detalhadamente o que precisa ser feito"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Responsável */}
          <div>
            <Label htmlFor="funcionario_responsavel">Responsável *</Label>
            <Select
              value={formData.funcionario_responsavel_id}
              onValueChange={(value) => handleChange('funcionario_responsavel_id', value)}
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

          {/* Importância e Concluída */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="importancia">Importância</Label>
              <Select
                value={formData.importancia}
                onValueChange={(value) => handleChange('importancia', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="concluida"
                checked={formData.concluida}
                onCheckedChange={(checked) => handleChange('concluida', checked)}
              />
              <Label htmlFor="concluida" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tarefa Concluída
              </Label>
            </div>
          </div>

          {/* Prazo */}
          <div>
            <Label htmlFor="prazo">Prazo *</Label>
            <Input
              id="prazo"
              type="date"
              value={formData.prazo}
              onChange={(e) => handleChange('prazo', e.target.value)}
              required
            />
            {statusPrazo && (
              <div className={`mt-2 text-sm ${
                statusPrazo.tipo === 'atrasado' ? 'text-red-600' :
                statusPrazo.tipo === 'urgente' ? 'text-yellow-600' :
                statusPrazo.tipo === 'proximo' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {statusPrazo.tipo === 'atrasado' && `⚠️ ${statusPrazo.dias} dias atrasado`}
                {statusPrazo.tipo === 'hoje' && '⚠️ Vence hoje'}
                {statusPrazo.tipo === 'urgente' && `⚠️ Vence em ${statusPrazo.dias} dias`}
                {statusPrazo.tipo === 'proximo' && `Vence em ${statusPrazo.dias} dias`}
                {statusPrazo.tipo === 'normal' && `${statusPrazo.dias} dias restantes`}
              </div>
            )}
          </div>

          {/* WhatsApp configurado no n8n - não é necessário preencher aqui */}

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Informações adicionais, contexto, etc."
              rows={2}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}