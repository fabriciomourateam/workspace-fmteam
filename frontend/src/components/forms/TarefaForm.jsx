import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { useNotifications } from '../../contexts/NotificationContext'

const CATEGORIAS = [
  'gestao', 'atendimento', 'marketing', 'engajamento', 
  'conteudo', 'produto', 'interno', 'vendas'
]

const PRIORIDADES = [
  { value: 'baixa', label: 'Baixa', color: 'text-green-600' },
  { value: 'media', label: 'Média', color: 'text-yellow-600' },
  { value: 'alta', label: 'Alta', color: 'text-red-600' }
]

export default function TarefaForm({ 
  isOpen, 
  onClose, 
  tarefa = null, 
  onSave 
}) {
  // const { showSuccess, showError } = useNotifications()
  const showSuccess = (message) => console.log('Sucesso:', message)
  const showError = (message) => console.error('Erro:', message)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    id: tarefa?.id || '',
    nome: tarefa?.nome || '',
    categoria: tarefa?.categoria || 'gestao',
    tempo_estimado: 30, // Sempre 30 minutos
    descricao: tarefa?.descricao || '',
    prioridade: tarefa?.prioridade || 'media'
  })

  // Atualizar formData quando tarefa mudar, mas sempre manter 30 min
  React.useEffect(() => {
    if (tarefa) {
      setFormData({
        id: tarefa.id || '',
        nome: tarefa.nome || '',
        categoria: tarefa.categoria || 'gestao',
        tempo_estimado: 30, // Sempre 30 minutos, independente do valor da tarefa
        descricao: tarefa.descricao || '',
        prioridade: tarefa.prioridade || 'media'
      })
    } else {
      setFormData({
        id: '',
        nome: '',
        categoria: 'gestao',
        tempo_estimado: 30, // Sempre 30 minutos
        descricao: '',
        prioridade: 'media'
      })
    }
  }, [tarefa, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validação básica
      if (!formData.nome.trim()) {
        throw new Error('Nome é obrigatório')
      }
      
      if (!formData.id || !formData.id.trim()) {
        throw new Error('ID é obrigatório e não pode estar vazio')
      }

      // Tempo sempre será 30 minutos, não precisa validar

      await onSave(formData)
      
      showSuccess(
        tarefa 
          ? 'Tarefa atualizada com sucesso!' 
          : 'Tarefa criada com sucesso!'
      )
      
      onClose()
    } catch (error) {
      showError(error.message)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {tarefa 
              ? 'Edite as informações da tarefa abaixo.'
              : 'Preencha as informações da nova tarefa.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID da Tarefa</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="ex: nova_tarefa"
              disabled={!!tarefa} // Não permite editar ID existente
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Tarefa</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Nome da tarefa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => handleChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempo_estimado">Tempo (minutos)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="tempo_estimado"
                  type="number"
                  value={30}
                  readOnly
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <span className="text-sm text-gray-500">
                  ⏱️ Todas as tarefas têm 30 minutos
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select 
              value={formData.prioridade} 
              onValueChange={(value) => handleChange('prioridade', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDADES.map(prioridade => (
                  <SelectItem key={prioridade.value} value={prioridade.value}>
                    <span className={prioridade.color}>
                      {prioridade.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              placeholder="Descrição detalhada da tarefa..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}