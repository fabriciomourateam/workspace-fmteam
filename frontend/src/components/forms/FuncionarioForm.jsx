import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { useNotifications } from '../../contexts/NotificationContext'

const CORES_DISPONIVEIS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'
]

export default function FuncionarioForm({ 
  isOpen, 
  onClose, 
  funcionario = null, 
  onSave 
}) {
  const showSuccess = (message) => alert('✅ ' + message)
  const showError = (message) => alert('❌ ' + message)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    id: funcionario?.id || '',
    nome: funcionario?.nome || '',
    horario_inicio: funcionario?.horario_inicio || '',
    horario_fim: funcionario?.horario_fim || '',
    cor: funcionario?.cor || CORES_DISPONIVEIS[0]
  })

  // Atualizar formData quando funcionario mudar
  React.useEffect(() => {
    if (funcionario) {
      console.log('Carregando funcionário para edição:', funcionario)
      setFormData({
        id: funcionario.id || '',
        nome: funcionario.nome || '',
        horario_inicio: funcionario.horario_inicio || '',
        horario_fim: funcionario.horario_fim || '',
        cor: funcionario.cor || CORES_DISPONIVEIS[0]
      })
    } else {
      setFormData({
        id: '',
        nome: '',
        horario_inicio: '',
        horario_fim: '',
        cor: CORES_DISPONIVEIS[0]
      })
    }
  }, [funcionario, isOpen]) // Adicionar isOpen como dependência

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

      await onSave(formData)
      
      showSuccess(
        funcionario 
          ? 'Funcionário atualizado com sucesso!' 
          : 'Funcionário criado com sucesso!'
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}
          </DialogTitle>
          <DialogDescription>
            {funcionario 
              ? 'Edite as informações do funcionário abaixo.'
              : 'Preencha as informações do novo funcionário.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID do Funcionário</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="ex: joao_silva"
              disabled={!!funcionario} // Não permite editar ID existente
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario_inicio">Horário Início</Label>
              <Input
                id="horario_inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => handleChange('horario_inicio', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_fim">Horário Fim</Label>
              <Input
                id="horario_fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => handleChange('horario_fim', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {CORES_DISPONIVEIS.map(cor => (
                <button
                  key={cor}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.cor === cor 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: cor }}
                  onClick={() => handleChange('cor', cor)}
                />
              ))}
            </div>
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