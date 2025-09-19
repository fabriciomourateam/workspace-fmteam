import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePersonalizacao } from '../../hooks/usePersonalizacao'
// import { useNotifications } from '../../contexts/NotificationContext'

export default function AgendamentoForm({ 
  isOpen, 
  onClose, 
  agendamento = null, 
  funcionarios = [],
  tarefas = [],
  onSave,
  horarioInicial = '',
  funcionarioInicial = '',
  dataInicial = ''
}) {
  const showSuccess = (message) => alert('✅ ' + message)
  const showError = (message) => alert('❌ ' + message)
  const [loading, setLoading] = useState(false)
  
  // Hook de personalização
  const { getClassesDensidade } = usePersonalizacao()
  
  const [formData, setFormData] = useState(() => {
    console.log('🎯 AgendamentoForm - Dados recebidos:', { agendamento, horarioInicial, funcionarioInicial, dataInicial })
    
    const dados = {
      horarios: agendamento?.horario ? [agendamento.horario] : (horarioInicial ? [horarioInicial] : []),
      funcionarios_ids: agendamento?.funcionario_id ? [agendamento.funcionario_id] : (funcionarioInicial ? [funcionarioInicial] : []),
      tarefa_id: agendamento?.tarefa_id || '',
      data: agendamento?.data || dataInicial || new Date().toISOString().split('T')[0],
      duracao: agendamento?.duracao || '30'
    }
    
    console.log('📋 FormData inicializado com:', dados)
    return dados
  })

  const [tipoAgendamento, setTipoAgendamento] = useState('unico') // 'unico' ou 'recorrente'
  const [diasSelecionados, setDiasSelecionados] = useState([])
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0])
  const [dataFim, setDataFim] = useState('')

  // Atualizar formData quando agendamento mudar
  useEffect(() => {
    if (agendamento) {
      console.log('🔄 Atualizando formData com novo agendamento:', agendamento)
      
      const novosDados = {
        horarios: agendamento.horario ? [agendamento.horario] : [],
        funcionarios_ids: agendamento.funcionario_id ? [agendamento.funcionario_id] : [],
        tarefa_id: agendamento.tarefa_id || '',
        data: agendamento.data || new Date().toISOString().split('T')[0],
        duracao: agendamento.duracao || '30'
      }
      
      console.log('📝 Novos dados do form:', novosDados)
      setFormData(novosDados)
    } else {
      // Reset para novo agendamento
      setFormData({
        horarios: horarioInicial ? [horarioInicial] : [],
        funcionarios_ids: funcionarioInicial ? [funcionarioInicial] : [],
        tarefa_id: '',
        data: dataInicial || new Date().toISOString().split('T')[0],
        duracao: '30'
      })
    }
  }, [agendamento, horarioInicial, funcionarioInicial, dataInicial])

  const diasSemana = [
    { id: 0, nome: 'Domingo', abrev: 'Dom' },
    { id: 1, nome: 'Segunda', abrev: 'Seg' },
    { id: 2, nome: 'Terça', abrev: 'Ter' },
    { id: 3, nome: 'Quarta', abrev: 'Qua' },
    { id: 4, nome: 'Quinta', abrev: 'Qui' },
    { id: 5, nome: 'Sexta', abrev: 'Sex' },
    { id: 6, nome: 'Sábado', abrev: 'Sáb' }
  ]

  // Gerar horários de 30 em 30 minutos (8h às 19h30)
  const horarios = []
  for (let h = 8; h <= 19; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hora = h.toString().padStart(2, '0')
      const minuto = m.toString().padStart(2, '0')
      horarios.push(`${hora}:${minuto}`)
      
      // Para a hora 19, só adiciona até 19:30 (para de adicionar depois do 19:30)
      if (h === 19 && m === 30) break
    }
  }

  // Função para calcular horários ocupados baseado na duração
  const calcularHorariosOcupados = (horarioInicio, duracao) => {
    const duracaoMinutos = parseInt(duracao)
    const slotsNecessarios = duracaoMinutos / 30
    const indiceInicio = horarios.indexOf(horarioInicio)
    
    if (indiceInicio === -1) return [horarioInicio]
    
    const horariosOcupados = []
    for (let i = 0; i < slotsNecessarios && (indiceInicio + i) < horarios.length; i++) {
      horariosOcupados.push(horarios[indiceInicio + i])
    }
    
    return horariosOcupados
  }

  // Função para verificar se um horário pode acomodar a duração selecionada
  const podeAcomodarDuracao = (horarioInicio, duracao) => {
    const duracaoMinutos = parseInt(duracao)
    const slotsNecessarios = duracaoMinutos / 30
    const indiceInicio = horarios.indexOf(horarioInicio)
    
    return (indiceInicio + slotsNecessarios) <= horarios.length
  }

  // Função para gerar datas recorrentes
  const gerarDatasRecorrentes = (dataInicio, dataFim, diasSemana) => {
    const datas = []
    // Usar Date com formato específico para evitar problemas de timezone
    const inicio = new Date(dataInicio + 'T00:00:00')
    const fim = new Date(dataFim + 'T00:00:00')
    
    // Debug apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Gerando datas recorrentes:', { dataInicio, dataFim, diasSemana })
    }
    console.log('Dias selecionados:', diasSemana)
    
    for (let data = new Date(inicio); data <= fim; data.setDate(data.getDate() + 1)) {
      const diaSemana = data.getDay()
      const dataStr = data.toISOString().split('T')[0]
      
      console.log(`Data: ${dataStr}, Dia da semana: ${diaSemana}, Incluir: ${diasSemana.includes(diaSemana)}`)
      
      if (diasSemana.includes(diaSemana)) {
        datas.push(dataStr)
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Datas geradas:', datas.length, 'agendamentos')
    }
    
    return datas
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.funcionarios_ids.length === 0 || !formData.tarefa_id || formData.horarios.length === 0) {
        throw new Error('Selecione pelo menos um funcionário, um horário e uma tarefa')
      }

      let totalAgendamentos = 0

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

        // Gerar múltiplos agendamentos para cada combinação
        const datas = gerarDatasRecorrentes(dataInicio, dataFim, diasSelecionados)
        
        for (const data of datas) {
          for (const funcionario_id of formData.funcionarios_ids) {
            for (const horario of formData.horarios) {
              const horariosOcupados = calcularHorariosOcupados(horario, formData.duracao)
              const agendamentoData = {
                funcionario_id,
                horario,
                tarefa_id: formData.tarefa_id,
                data: data,
                duracao: parseInt(formData.duracao),
                horarios_ocupados: horariosOcupados
              }
              await onSave(agendamentoData)
              totalAgendamentos++
            }
          }
        }
        
        showSuccess(`${totalAgendamentos} agendamentos criados com sucesso!`)
      } else {
        // Agendamentos múltiplos para data única
        if (agendamento) {
          // Modo edição - manter comportamento original
          const horariosOcupados = calcularHorariosOcupados(formData.horarios[0], formData.duracao)
          const agendamentoData = {
            funcionario_id: formData.funcionarios_ids[0],
            horario: formData.horarios[0],
            tarefa_id: formData.tarefa_id,
            data: formData.data,
            duracao: parseInt(formData.duracao),
            horarios_ocupados: horariosOcupados
          }
          await onSave(agendamentoData)
          showSuccess('Agendamento atualizado com sucesso!')
        } else {
          // Modo criação - múltiplas combinações
          for (const funcionario_id of formData.funcionarios_ids) {
            for (const horario of formData.horarios) {
              const horariosOcupados = calcularHorariosOcupados(horario, formData.duracao)
              const agendamentoData = {
                funcionario_id,
                horario,
                tarefa_id: formData.tarefa_id,
                data: formData.data,
                duracao: parseInt(formData.duracao),
                horarios_ocupados: horariosOcupados
              }
              await onSave(agendamentoData)
              totalAgendamentos++
            }
          }
          showSuccess(`${totalAgendamentos} agendamento${totalAgendamentos > 1 ? 's' : ''} criado${totalAgendamentos > 1 ? 's' : ''} com sucesso!`)
        }
      }
      
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

  const toggleHorario = (horario) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.includes(horario)
        ? prev.horarios.filter(h => h !== horario)
        : [...prev.horarios, horario].sort()
    }))
  }

  const toggleFuncionario = (funcionarioId) => {
    setFormData(prev => ({
      ...prev,
      funcionarios_ids: prev.funcionarios_ids.includes(funcionarioId)
        ? prev.funcionarios_ids.filter(id => id !== funcionarioId)
        : [...prev.funcionarios_ids, funcionarioId]
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
    setDiasSelecionados([1, 2, 3, 4, 5]) // Segunda a Sexta (IDs corretos)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {agendamento 
              ? 'Edite o agendamento abaixo. Você pode trocar a tarefa por qualquer outra disponível.'
              : 'Agende uma tarefa para um funcionário.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className={getClassesDensidade('spacing')}>
          {/* Tipo de agendamento */}
          <div className={getClassesDensidade('spacing')}>
            <Label className={getClassesDensidade('text')}>Tipo de Agendamento</Label>
            <div className={`flex ${getClassesDensidade('gap')}`}>
              <label className={`flex items-center ${getClassesDensidade('gap')}`}>
                <input
                  type="radio"
                  value="unico"
                  checked={tipoAgendamento === 'unico'}
                  onChange={(e) => setTipoAgendamento(e.target.value)}
                  className="text-blue-600"
                />
                <span className={getClassesDensidade('text')}>Agendamento único</span>
              </label>
              <label className={`flex items-center ${getClassesDensidade('gap')}`}>
                <input
                  type="radio"
                  value="recorrente"
                  checked={tipoAgendamento === 'recorrente'}
                  onChange={(e) => setTipoAgendamento(e.target.value)}
                  className="text-blue-600"
                />
                <span className={getClassesDensidade('text')}>Agendamento recorrente</span>
              </label>
            </div>
          </div>

          {/* Data única */}
          {tipoAgendamento === 'unico' && (
            <div className={getClassesDensidade('spacing')}>
              <Label htmlFor="data" className={getClassesDensidade('text')}>Data</Label>
              <input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleChange('data', e.target.value)}
                className={`w-full ${getClassesDensidade('card')} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

          {/* Duração do agendamento */}
          <div className={getClassesDensidade('spacing')}>
            <Label className={getClassesDensidade('text')}>Duração</Label>
            <Select 
              value={formData.duracao || '30'} 
              onValueChange={(value) => handleChange('duracao', value)}
            >
              <SelectTrigger className={getClassesDensidade('card')}>
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h 30min</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="150">2h 30min</SelectItem>
                <SelectItem value="180">3 horas</SelectItem>
                <SelectItem value="210">3h 30min</SelectItem>
                <SelectItem value="240">4 horas</SelectItem>
                <SelectItem value="270">4h 30min</SelectItem>
                <SelectItem value="300">5 horas</SelectItem>
                <SelectItem value="330">5h 30min</SelectItem>
                <SelectItem value="360">6 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seleção múltipla de horários */}
          <div className={getClassesDensidade('spacing')}>
            <Label className={getClassesDensidade('text')}>Horários ({formData.horarios.length} selecionado{formData.horarios.length !== 1 ? 's' : ''})</Label>
            <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-md p-3" style={{ minHeight: '200px' }}>
              <div className={`grid grid-cols-3 ${getClassesDensidade('gap')}`}>
                {horarios.map(horario => {
                  const podeSelecionar = podeAcomodarDuracao(horario, formData.duracao)
                  const horariosOcupados = calcularHorariosOcupados(horario, formData.duracao)
                  
                  return (
                    <button
                      key={horario}
                      type="button"
                      onClick={() => podeSelecionar && toggleHorario(horario)}
                      disabled={!podeSelecionar}
                      className={`${getClassesDensidade('card')} rounded ${getClassesDensidade('text')} font-medium transition-colors ${
                        !podeSelecionar
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : formData.horarios.includes(horario)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={
                        !podeSelecionar 
                          ? `Duração de ${formData.duracao}min não cabe neste horário`
                          : `${horario} - ${horariosOcupados[horariosOcupados.length - 1]} (${formData.duracao}min)`
                      }
                    >
                      {horario}
                      {formData.duracao !== '30' && podeSelecionar && (
                        <div className="text-xs opacity-75">
                          até {horariosOcupados[horariosOcupados.length - 1]}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, horarios: [] }))}
              >
                Limpar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, horarios: horarios.filter(h => parseInt(h.split(':')[0]) >= 8 && parseInt(h.split(':')[0]) <= 18) }))}
              >
                Horário comercial (8h-18h)
              </Button>
            </div>
          </div>

          {/* Seleção múltipla de funcionários */}
          <div className={getClassesDensidade('spacing')}>
            <Label className={getClassesDensidade('text')}>Funcionários ({formData.funcionarios_ids.length} selecionado{formData.funcionarios_ids.length !== 1 ? 's' : ''})</Label>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-300 rounded-md p-3" style={{ minHeight: '200px' }}>
              {funcionarios.filter(funcionario => funcionario.id && funcionario.id.trim() !== '').map(funcionario => (
                <button
                  key={funcionario.id}
                  type="button"
                  onClick={() => toggleFuncionario(funcionario.id)}
                  className={`w-full flex items-center ${getClassesDensidade('gap')} ${getClassesDensidade('card')} rounded-md text-left transition-colors ${
                    formData.funcionarios_ids.includes(funcionario.id)
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: funcionario.cor }}
                  />
                  <span className={`font-medium ${getClassesDensidade('text')}`}>{funcionario.nome}</span>
                  {formData.funcionarios_ids.includes(funcionario.id) && (
                    <span className={`ml-auto text-blue-600 ${getClassesDensidade('text')}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, funcionarios_ids: [] }))}
              >
                Limpar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  funcionarios_ids: funcionarios.filter(f => f.id && f.id.trim() !== '').map(f => f.id) 
                }))}
              >
                Selecionar todos
              </Button>
            </div>
          </div>

          <div className={getClassesDensidade('spacing')}>
            <Label htmlFor="tarefa" className={getClassesDensidade('text')}>
              Tarefa {agendamento && <span className="text-blue-600 text-sm">(clique para trocar)</span>}
            </Label>
            <Select value={formData.tarefa_id} onValueChange={(value) => handleChange('tarefa_id', value)}>
              <SelectTrigger className={`${getClassesDensidade('card')} ${agendamento ? 'ring-2 ring-blue-200 border-blue-300' : ''}`}>
                <SelectValue placeholder="Selecione a tarefa" />
              </SelectTrigger>
              <SelectContent>
                {tarefas.filter(tarefa => tarefa.id && tarefa.id.trim() !== '').map(tarefa => (
                  <SelectItem key={tarefa.id} value={tarefa.id}>
                    <div className="flex flex-col">
                      <span className={`font-medium ${getClassesDensidade('text')}`}>{tarefa.nome}</span>
                      <span className={`${getClassesDensidade('text')} text-gray-500 opacity-75`}>
                        {tarefa.tempo_estimado || 30}min - {tarefa.categoria}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {agendamento && (
              <p className="text-sm text-gray-600 mt-1">
                💡 Dica: Selecione uma tarefa diferente para substituir a atual no mesmo horário
              </p>
            )}
          </div>

          {/* Resumo das combinações */}
          {!agendamento && formData.funcionarios_ids.length > 0 && formData.horarios.length > 0 && (
            <div className={`bg-blue-50 border border-blue-200 rounded-lg ${getClassesDensidade('card')}`}>
              <h4 className={`font-medium text-blue-900 ${getClassesDensidade('text')} mb-2`}>Resumo do Agendamento</h4>
              <div className={`${getClassesDensidade('text')} text-blue-800`}>
                {tipoAgendamento === 'recorrente' ? (
                  <div>
                    <p><strong>Funcionários:</strong> {formData.funcionarios_ids.length}</p>
                    <p><strong>Horários:</strong> {formData.horarios.length}</p>
                    <p><strong>Dias selecionados:</strong> {diasSelecionados.length}</p>
                    <p><strong>Período:</strong> {dataInicio} até {dataFim}</p>
                    {diasSelecionados.length > 0 && dataInicio && dataFim && (
                      <p className="font-semibold mt-2">
                        Total estimado: ~{formData.funcionarios_ids.length * formData.horarios.length * gerarDatasRecorrentes(dataInicio, dataFim, diasSelecionados).length} agendamentos
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p><strong>Data:</strong> {new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    <p><strong>Funcionários:</strong> {formData.funcionarios_ids.length}</p>
                    <p><strong>Horários:</strong> {formData.horarios.length}</p>
                    <p className="font-semibold mt-2">
                      Total: {formData.funcionarios_ids.length * formData.horarios.length} agendamento{formData.funcionarios_ids.length * formData.horarios.length > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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
              {loading ? 'Salvando...' : (agendamento ? 'Atualizar Tarefa' : 'Criar Agendamentos')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}