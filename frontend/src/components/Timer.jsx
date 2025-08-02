import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import supabaseService from '../services/supabase'
import { formatarHorarioIntervalo } from '../utils/timeUtils'

const statusConfig = {
  'nao_iniciada': { 
    label: 'Pendente', 
    color: 'bg-gray-500', 
    icon: Clock 
  },
  'concluida': { 
    label: 'Concluída', 
    color: 'bg-green-500', 
    icon: CheckCircle 
  }
}

export default function Timer({ agendamento, tarefa, funcionario, onUpdate }) {
  const [status, setStatus] = useState(agendamento?.status || 'nao_iniciada')
  const [isChecked, setIsChecked] = useState(agendamento?.status === 'concluida')

  const toggleTarefa = async () => {
    try {
      const novoStatus = isChecked ? 'nao_iniciada' : 'concluida'
      const agora = new Date()
      
      await supabaseService.updateAgendamento(agendamento.id, {
        status: novoStatus,
        tempo_fim: novoStatus === 'concluida' ? agora.toISOString() : null,
        tempo_real: novoStatus === 'concluida' ? (tarefa?.tempo_estimado || 30) : null
      })
      
      setStatus(novoStatus)
      setIsChecked(!isChecked)
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const tempoEstimado = tarefa?.tempo_estimado || 30
  const StatusIcon = statusConfig[status]?.icon || Clock

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIcon className="w-5 h-5" />
            {tarefa?.nome}
          </CardTitle>
          <Badge className={`${statusConfig[status]?.color} text-white`}>
            {statusConfig[status]?.label}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          {funcionario?.nome} • {formatarHorarioIntervalo(agendamento?.horario)} • {tempoEstimado}min estimado
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Checkbox Principal */}
          <div className="flex items-center justify-center">
            <button
              onClick={toggleTarefa}
              className={`flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all duration-300 hover:scale-105 ${
                isChecked 
                  ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                  : 'bg-white border-gray-300 text-gray-400 hover:border-green-400'
              }`}
            >
              {isChecked ? (
                <CheckCircle className="w-10 h-10" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-current" />
              )}
            </button>
          </div>

          {/* Status e Ação */}
          <div className="text-center">
            <div className={`text-xl font-semibold ${isChecked ? 'text-green-600' : 'text-gray-600'}`}>
              {isChecked ? '✓ Tarefa Concluída' : 'Clique para marcar como concluída'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {isChecked ? 'Parabéns! Tarefa finalizada.' : 'Marque quando terminar esta tarefa'}
            </div>
          </div>

          {/* Informações da Tarefa */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Categoria:</span>
                <div className="text-gray-600">{tarefa?.categoria || 'Geral'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tempo Estimado:</span>
                <div className="text-gray-600">{tempoEstimado} minutos</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Prioridade:</span>
                <div className={`capitalize ${
                  tarefa?.prioridade === 'alta' ? 'text-red-600' :
                  tarefa?.prioridade === 'media' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {tarefa?.prioridade || 'Normal'}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <div className={`${
                  status === 'concluida' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {statusConfig[status]?.label}
                </div>
              </div>
            </div>
            
            {tarefa?.descricao && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-700">Descrição:</span>
                <div className="text-gray-600 text-sm mt-1">{tarefa.descricao}</div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}