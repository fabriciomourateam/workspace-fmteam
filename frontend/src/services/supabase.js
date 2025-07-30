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
}

export const supabaseService = new SupabaseService()
export default supabaseService