import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://odwouhhxvlkpkjklwoxo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd291aGh4dmxrcGtqa2x3b3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mjc2ODEsImV4cCI6MjA2OTQwMzY4MX0.e7RR0PHzyWlrQ3Ci9V9ZCLrPKmtIO0PMef0ue3yBce8'

export const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseService {
  // Funcionários
  async getFuncionarios() {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*')
      .order('nome')

    if (error) throw error
    return data
  }

  async createFuncionario(funcionario) {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert([funcionario])
      .select()

    if (error) throw error
    return data[0]
  }

  async updateFuncionario(id, updates) {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteFuncionario(id) {
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Tarefas
  async getTarefas() {
    const { data, error } = await supabase
      .from('tarefas')
      .select('*')
      .order('nome')

    if (error) throw error
    return data
  }

  async createTarefa(tarefa) {
    const { data, error } = await supabase
      .from('tarefas')
      .insert([tarefa])
      .select()

    if (error) throw error
    return data[0]
  }

  async updateTarefa(id, updates) {
    const { data, error } = await supabase
      .from('tarefas')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteTarefa(id) {
    const { error } = await supabase
      .from('tarefas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Agenda
  async getAgenda() {
    const { data, error } = await supabase
      .from('agenda')
      .select(`
        *,
        funcionario:funcionarios(nome, cor),
        tarefa:tarefas(nome, categoria)
      `)
      .order('horario')

    if (error) throw error
    return data
  }

  async createAgendamento(agendamento) {
    const { data, error } = await supabase
      .from('agenda')
      .insert([agendamento])
      .select()

    if (error) throw error
    return data[0]
  }

  async updateAgendamento(id, updates) {
    const { data, error } = await supabase
      .from('agenda')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteAgendamento(id) {
    const { error } = await supabase
      .from('agenda')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Exclusão em massa de agendamentos
  async deleteMultipleAgendamentos(ids) {
    const { error } = await supabase
      .from('agenda')
      .delete()
      .in('id', ids)

    if (error) throw error
    return { deleted: ids.length }
  }

  // Exclusão por filtros
  async deleteAgendamentosByFilter(filters) {
    let query = supabase.from('agenda').delete()
    
    if (filters.funcionario_id && filters.funcionario_id !== 'todos') {
      query = query.eq('funcionario_id', filters.funcionario_id)
    }
    if (filters.data) {
      query = query.eq('data', filters.data)
    }
    if (filters.status && filters.status !== 'todos') {
      query = query.eq('status', filters.status)
    }
    if (filters.data_inicio && filters.data_fim) {
      query = query.gte('data', filters.data_inicio).lte('data', filters.data_fim)
    }

    const { error, count } = await query

    if (error) throw error
    return { deleted: count }
  }

  // Exclusão em massa de agendamentos
  async deleteMultipleAgendamentos(ids) {
    const { error } = await supabase
      .from('agenda')
      .delete()
      .in('id', ids)

    if (error) throw error
    return { deleted: ids.length }
  }

  // Exclusão por filtros
  async deleteAgendamentosByFilter(filters) {
    let query = supabase.from('agenda').delete()
    
    if (filters.funcionario_id) {
      query = query.eq('funcionario_id', filters.funcionario_id)
    }
    if (filters.data) {
      query = query.eq('data', filters.data)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.data_inicio && filters.data_fim) {
      query = query.gte('data', filters.data_inicio).lte('data', filters.data_fim)
    }

    const { error, count } = await query

    if (error) throw error
    return { deleted: count }
  }

  // Agenda por funcionário
  async getAgendaFuncionario(funcionarioId) {
    const { data, error } = await supabase
      .from('agenda')
      .select(`
        *,
        funcionario:funcionarios(nome, cor),
        tarefa:tarefas(nome, categoria)
      `)
      .eq('funcionario_id', funcionarioId)
      .order('horario')

    if (error) throw error
    return data
  }

  // Buscar agendamento específico
  async getAgendamentoByHorarioFuncionario(horario, funcionarioId) {
    const { data, error } = await supabase
      .from('agenda')
      .select('*')
      .eq('horario', horario)
      .eq('funcionario_id', funcionarioId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  }

  // Verificar conflitos de agendamento
  async checkAgendamentoConflict(horario, funcionarioId, excludeId = null) {
    let query = supabase
      .from('agenda')
      .select('id')
      .eq('horario', horario)
      .eq('funcionario_id', funcionarioId)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data && data.length > 0
  }
  // Metas
  async getMetas(funcionarioId = null, tipo = null) {
    let query = supabase
      .from('metas')
      .select(`
        *,
        funcionario:funcionarios(nome, cor)
      `)
      .order('periodo', { ascending: false })

    if (funcionarioId) {
      query = query.eq('funcionario_id', funcionarioId)
    }
    
    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  }

  async createMeta(meta) {
    const { data, error } = await supabase
      .from('metas')
      .insert([meta])
      .select()

    if (error) throw error
    return data[0]
  }

  async updateMeta(id, updates) {
    const { data, error } = await supabase
      .from('metas')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteMeta(id) {
    const { error } = await supabase
      .from('metas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Estatísticas avançadas
  async getEstatisticasAvancadas(funcionarioId = null, dataInicio = null, dataFim = null) {
    let query = supabase
      .from('agenda')
      .select(`
        *,
        funcionario:funcionarios(nome, cor),
        tarefa:tarefas(nome, categoria, tempo_estimado)
      `)

    if (funcionarioId) {
      query = query.eq('funcionario_id', funcionarioId)
    }
    
    if (dataInicio) {
      query = query.gte('data', dataInicio)
    }
    
    if (dataFim) {
      query = query.lte('data', dataFim)
    }

    const { data, error } = await query
    if (error) throw error
    
    // Processar estatísticas
    const stats = {
      totalTarefas: data.length,
      tarefasConcluidas: data.filter(t => t.status === 'concluida').length,
      tarefasAtrasadas: data.filter(t => t.status === 'atrasada').length,
      tempoTotalEstimado: data.reduce((acc, t) => acc + (t.tarefa?.tempo_estimado || 0), 0),
      tempoTotalReal: data.reduce((acc, t) => acc + (t.tempo_real || 0), 0),
      eficienciaMedia: 0,
      tarefasPorStatus: {
        'nao_iniciada': data.filter(t => t.status === 'nao_iniciada').length,
        'em_andamento': data.filter(t => t.status === 'em_andamento').length,
        'concluida': data.filter(t => t.status === 'concluida').length,
        'atrasada': data.filter(t => t.status === 'atrasada').length
      }
    }
    
    // Calcular eficiência média
    const tarefasComTempo = data.filter(t => t.tempo_real && t.tarefa?.tempo_estimado)
    if (tarefasComTempo.length > 0) {
      const eficiencias = tarefasComTempo.map(t => (t.tarefa.tempo_estimado / t.tempo_real) * 100)
      stats.eficienciaMedia = eficiencias.reduce((acc, eff) => acc + eff, 0) / eficiencias.length
    }
    
    return { data, stats }
  }

  // Processos
  async getProcessos() {
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .order('titulo')

    if (error) throw error
    return data
  }

  async getProcesso(tarefaId) {
    const { data, error } = await supabase
      .from('processos')
      .select(`
        *,
        tarefa:tarefas(nome, categoria)
      `)
      .eq('tarefa_id', tarefaId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  }

  async createProcesso(processo) {
    const { data, error } = await supabase
      .from('processos')
      .insert([processo])
      .select()

    if (error) throw error
    return data[0]
  }

  async updateProcesso(id, updates) {
    const { data, error } = await supabase
      .from('processos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteProcesso(id) {
    const { error } = await supabase
      .from('processos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Demandas
  async getDemandas() {
    const { data, error } = await supabase
      .from('demandas')
      .select('*')
      .order('importancia', { ascending: false })
      .order('prazo', { ascending: true })

    if (error) throw error
    return data
  }

  async getDemanda(id) {
    const { data, error } = await supabase
      .from('demandas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async createDemanda(demanda) {
    const { data, error } = await supabase
      .from('demandas')
      .insert([demanda])
      .select()

    if (error) throw error
    return data[0]
  }

  async updateDemanda(id, updates) {
    const { data, error } = await supabase
      .from('demandas')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteDemanda(id) {
    const { error } = await supabase
      .from('demandas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Health check
  async healthCheck() {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('count')
      .limit(1)

    if (error) throw error
    return { status: 'ok', message: 'Supabase conectado' }
  }
}

export const supabaseService = new SupabaseService()
export default supabaseService