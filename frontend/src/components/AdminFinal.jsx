import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Save, X, Settings, Users, Calendar, FileText, Clock, Filter } from 'lucide-react'
import { useFuncionarios, useTarefas, useAgenda } from '../hooks/useApi'
import { useNotifications } from '../contexts/NotificationContext'
import { formatarHorarioIntervalo } from '../utils/timeUtils'
import dataService from '../services/dataService'
import AgendamentoForm from './forms/AgendamentoForm'
import ExclusaoMassa from './ExclusaoMassa'

function AdminFinal() {
  const [modalAberto, setModalAberto] = useState(false)
  const [tipoModal, setTipoModal] = useState('')
  const [itemEditando, setItemEditando] = useState(null)
  const { addNotification } = useNotifications()

  // Carrega dados da API
  const { data: funcionarios, loading: loadingFuncionarios, refetch: refetchFuncionarios } = useFuncionarios()
  const { data: tarefas, loading: loadingTarefas, refetch: refetchTarefas } = useTarefas()
  const { data: agenda, loading: loadingAgenda, refetch: refetchAgenda } = useAgenda()

  // Estados para modais avançados
  const [agendamentoFormOpen, setAgendamentoFormOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState(null)
  const [exclusaoMassaOpen, setExclusaoMassaOpen] = useState(false)

  const abrirModal = (tipo, item = null) => {
    setTipoModal(tipo)
    setItemEditando(item)
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setTipoModal('')
    setItemEditando(null)
  }

  // Estados de formulário
  const [formDataFuncionario, setFormDataFuncionario] = useState({
    id: '', nome: '', horarioInicio: '', horarioFim: '', cor: '#2563eb'
  })

  const [formDataTarefa, setFormDataTarefa] = useState({
    id: '', nome: '', categoria: '', tempoEstimado: 30, descricao: '', prioridade: 'media'
  })

  const [formDataAgenda, setFormDataAgenda] = useState({
    horario: '', funcionario: '', tarefa: ''
  })

  // Efeitos para atualizar formulários
  useEffect(() => {
    if (itemEditando && tipoModal === 'funcionario') {
      setFormDataFuncionario({
        id: itemEditando.id,
        nome: itemEditando.nome,
        horarioInicio: itemEditando.horario_inicio || itemEditando.horarioInicio,
        horarioFim: itemEditando.horario_fim || itemEditando.horarioFim,
        cor: itemEditando.cor
      })
    } else if (tipoModal === 'funcionario') {
      setFormDataFuncionario({
        id: '', nome: '', horarioInicio: '', horarioFim: '', cor: '#2563eb'
      })
    }
  }, [itemEditando, tipoModal])

  useEffect(() => {
    if (itemEditando && tipoModal === 'tarefa') {
      setFormDataTarefa({
        id: itemEditando.id,
        nome: itemEditando.nome,
        categoria: itemEditando.categoria,
        tempoEstimado: itemEditando.tempo_estimado || itemEditando.tempoEstimado,
        descricao: itemEditando.descricao,
        prioridade: itemEditando.prioridade
      })
    } else if (tipoModal === 'tarefa') {
      setFormDataTarefa({
        id: '', nome: '', categoria: '', tempoEstimado: 30, descricao: '', prioridade: 'media'
      })
    }
  }, [itemEditando, tipoModal])

  // Funções CRUD - Funcionários
  const salvarFuncionario = async () => {
    try {
      const funcionarioData = {
        id: formDataFuncionario.id,
        nome: formDataFuncionario.nome,
        horario_inicio: formDataFuncionario.horarioInici