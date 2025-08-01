import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { useNotifications } from '../../contexts/NotificationContext'

export default function AgendamentoForm({ 
  isOpen, 
  onClose, 
  agendamento = null, 
  funcionarios = [],
  tarefas = [],
  onSave,
  horarioInicial = '',
  funcionarioInicial = ''
}) {
  // const { showSuccess, showError } = useNotifications()
  const showSuccess = (message) => console.log('Sucesso:', message)
  const showError = (message) => console.error('Erro:', message)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    horario: agendamento?.horario || horarioInicial || '',
    funcionario_id: agendamento?.funcionario_id || funcionarioInicial || '',
    tarefa_id: agendamento?.tarefa_id || '',
    data: agendamento?.data || new Date().toISOString().split('T')[0]
  })

  const [tipoAgendamento, setTipoAgendamento] = useState('unico') // 'unico' ou 'recorrente'
  const [diasSelecionados, setDiasSelecionados] = useState([])
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState('')

  const diasSemana = [
    { id: 1, nome: 'Segunda', abrev: 'Seg' },
    { id: 2, nome: 'Terça', abrev: 'Ter' },
    { id: 3, nome: 'Quarta', abrev: 'Qua' },
    { id: 4, nome: 'Quinta', abrev: 'Qui' },
    { id: 5, nome: 'Sexta', abrev: 'Sex' },
    { id: 6, nome: 'Sábado', abrev: 'Sáb' },
    { id: 0, nome: 'Domingo', abrev: 'Dom' }
  ]

  // Gerar horários de 30 em 30 minutos
  const horarios = []
  for (let h = 8; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hora = h.toString().padStart(2, '0')
      const minuto = m.toString().padStart(2, '0')
      horarios.push(`${hora}:${minuto}`)
    }
  }

  // Função para gerar datas recorrentes
  const gerarDatasRecorrentes = (dataInicio, dataFim, diasSemana) => {
    const datas = []
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    
    for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
      const diaSemana = data.getDay()
      if (diasSemana.includes(diaSemana)) {
        datas.push(new Date(data).toISOString().split('T')[0])
      }
    }
    
    return datas
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.funcionario_id || !formData.tarefa_id || !formData.horario) {
        throw new Error('Todos os campos são obrigatórios')
      }

      console.log('=== DEBUG AGENDAMENTO FORM ===')
      console.log('Dados do formulário:', formData)
      console.log('Tipo de agendamento:', tipoAgendamento)

      if (tipoAgendamento === 'recorrente') {
        if (diasSelecionados.length === 0) {
          throw new Error('Selecione pelo menos um dia da semana')
        }
        if (!dataInicio || !dataFim) {
          throw new Error('Selecione as datas de início e fim')
        }
        if (new Date(dataFim) < new Date(dataInicio)) {
          throw new Error('Data fim deve ser posterior à data início')
        }

        // Gerar múltiplos agendamentos
        const datas = gerarDatasRecorrentes(dataInicio, dataFim, diasSelecionados)
        
        for (const data of datas) {
          const agendamentoData = {
            ...formData,
            data: data
          }
          console.log('Salvando agendamento recorrente:', agendamentoData)
          await onSave(agendamentoData)
        }
        
        showSuccess(`${datas.length} agendamentos criados com sucesso!`)
      } else {
        // Agendamento único
        console.log('Salvando agendamento único:', formData)
        await onSave(formData)
        
        showSuccess(
          agendamento 
            ? 'Agendamento atualizado com sucesso!' 
            : 'Agendamento criado com sucesso!'
        )
      }
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error)
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

  const toggleDiaSemana = (diaId) => {
    setDiasSelecionados(prev => 
      prev.includes(diaId) 
        ? prev.filter(id => id !== diaId)
        : [...prev, diaId]
    )
  }

  const selecionarDiasUteis = () => {
    setDiasSelecionados([1, 2, 3, 4, 5]) // Segunda a Sexta
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {agendamento 
              ? 'Edite o agendamento abaixo.'
              : 'Agende uma tarefa para um funcionário.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de agendamento */}
          <div className="space-y-2">
            <Label>Tipo de Agendamento</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="unico"
                  checked={tipoAgendamento === 'unico'}
                  onChange={(e) => setTipoAgendamento(e.target.value)}
                  className="text-blue-600"
                />
                <span>Agendamento único</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="recorrente"
                  checked={tipoAgendamento === 'recorrente'}
                  onChange={(e) => setTipoAgendamento(e.target.value)}
                  className="text-blue-600"
                />
                <span>Agendamento recorrente</span>
              </label>
            </div>
          </div>

          {/* Data única */}
          {tipoAgendamento === 'unico' && (
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleChange('data', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Agendamento recorrente */}
          {tipoAgendamento === 'recorrente' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dias da Semana</Label>
                <div className="flex flex-wrap gap-2">
                  {diasSemana.map(dia => (
                    <button
                      key={dia.id}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        diasSelecionados.includes(dia.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {dia.abrev}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={selecionarDiasUteis}
                  className="mt-2"
                >
                  Selecionar dias úteis (Seg-Sex)
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <input
                    id="dataFim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Select value={formData.horario} onValueChange={(value) => handleChange('horario', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {horarios.map(horario => (
                  <SelectItem key={horario} value={horario}>
                    {horario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionário</Label>
            <Select value={formData.funcionario_id} onValueChange={(value) => handleChange('funcionario_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.filter(funcionario => funcionario.id && funcionario.id.trim() !== '').map(funcionario => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: funcionario.cor }}
                      />
                      <span>{funcionario.nome}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tarefa">Tarefa</Label>
            <Select value={formData.tarefa_id} onValueChange={(value) => handleChange('tarefa_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a tarefa" />
              </SelectTrigger>
              <SelectContent>
                {tarefas.filter(tarefa => tarefa.id && tarefa.id.trim() !== '').map(tarefa => (
                  <SelectItem key={tarefa.id} value={tarefa.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{tarefa.nome}</span>
                      <span className="text-xs text-gray-500">
                        30min - {tarefa.categoria}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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