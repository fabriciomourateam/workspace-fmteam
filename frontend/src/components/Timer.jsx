import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import supabaseService from '../services/supabase'

const statusConfig = {
  'nao_iniciada': { 
    label: 'Não Iniciada', 
    color: 'bg-gray-500', 
    icon: Clock 
  },
  'em_andamento': { 
    label: 'Em Andamento', 
    color: 'bg-blue-500', 
    icon: Play 
  },
  'concluida': { 
    label: 'Concluída', 
    color: 'bg-green-500', 
    icon: CheckCircle 
  },
  'atrasada': { 
    label: 'Atrasada', 
    color: 'bg-red-500', 
    icon: AlertTriangle 
  }
}

export default function Timer({ agendamento, tarefa, funcionario, onUpdate }) {
  const [status, setStatus] = useState(agendamento?.status || 'nao_iniciada')
  const [tempoDecorrido, setTempoDecorrido] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [tempoInicio, setTempoInicio] = useState(agendamento?.tempo_inicio ? new Date(agendamento.tempo_inicio) : null)

  // Calcular tempo decorrido se já iniciou
  useEffect(() => {
    if (tempoInicio && status === 'em_andamento') {
      const agora = new Date()
      const diferenca = Math.floor((agora - tempoInicio) / 1000 / 60) // em minutos
      setTempoDecorrido(diferenca)
      setIsRunning(true)
    }
  }, [tempoInicio, status])

  // Timer em tempo real
  useEffect(() => {
    let interval = null
    if (isRunning && status === 'em_andamento') {
      interval = setInterval(() => {
        setTempoDecorrido(prev => prev + 1)
      }, 60000) // atualiza a cada minuto
    }
    return () => clearInterval(interval)
  }, [isRunning, status])

  const formatarTempo = (minutos) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${horas}h ${mins}m`
  }

  const iniciarTarefa = async () => {
    try {
      const agora = new Date()
      await supabaseService.updateAgendamento(agendamento.id, {
        status: 'em_andamento',
        tempo_inicio: agora.toISOString()
      })
      
      setStatus('em_andamento')
      setTempoInicio(agora)
      setIsRunning(true)
      setTempoDecorrido(0)
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao iniciar tarefa:', error)
    }
  }

  const pausarTarefa = async () => {
    try {
      await supabaseService.updateAgendamento(agendamento.id, {
        status: 'nao_iniciada',
        tempo_inicio: null
      })
      
      setStatus('nao_iniciada')
      setIsRunning(false)
      setTempoDecorrido(0)
      setTempoInicio(null)
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao pausar tarefa:', error)
    }
  }

  const concluirTarefa = async () => {
    try {
      const agora = new Date()
      await supabaseService.updateAgendamento(agendamento.id, {
        status: 'concluida',
        tempo_fim: agora.toISOString(),
        tempo_real: tempoDecorrido
      })
      
      setStatus('concluida')
      setIsRunning(false)
      onUpdate?.()
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error)
    }
  }

  const tempoEstimado = tarefa?.tempo_estimado || 30
  const isAtrasada = tempoDecorrido > tempoEstimado && status === 'em_andamento'
  const StatusIcon = statusConfig[status]?.icon || Clock

  // Atualizar status para atrasada se necessário
  useEffect(() => {
    if (isAtrasada && status === 'em_andamento') {
      setStatus('atrasada')
      supabaseService.updateAgendamento(agendamento.id, { status: 'atrasada' })
    }
  }, [isAtrasada, status, agendamento.id])

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
          {funcionario?.nome} • {agendamento?.horario} • {formatarTempo(tempoEstimado)} estimado
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Display do tempo */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatarTempo(tempoDecorrido)}
            </div>
            <div className="text-sm text-gray-500">
              {status === 'concluida' ? 'Tempo total gasto' : 'Tempo decorrido'}
            </div>
            {tempoDecorrido > 0 && (
              <div className="text-xs mt-1">
                <span className={tempoDecorrido > tempoEstimado ? 'text-red-500' : 'text-green-500'}>
                  {tempoDecorrido > tempoEstimado ? '+' : ''}{tempoDecorrido - tempoEstimado}m do estimado
                </span>
              </div>
            )}
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                tempoDecorrido > tempoEstimado ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: `${Math.min((tempoDecorrido / tempoEstimado) * 100, 100)}%` 
              }}
            />
          </div>

          {/* Controles */}
          <div className="flex gap-2 justify-center">
            {status === 'nao_iniciada' && (
              <Button onClick={iniciarTarefa} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Iniciar
              </Button>
            )}
            
            {status === 'em_andamento' && (
              <>
                <Button variant="outline" onClick={pausarTarefa} className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  Pausar
                </Button>
                <Button onClick={concluirTarefa} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Concluir
                </Button>
              </>
            )}
            
            {status === 'atrasada' && (
              <Button onClick={concluirTarefa} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4" />
                Concluir
              </Button>
            )}
            
            {status === 'concluida' && (
              <Badge className="bg-green-500 text-white px-4 py-2">
                ✓ Tarefa Concluída
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}