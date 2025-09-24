import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://odwouhhxvlkpkjklwoxo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd291aGh4dmxrcGtqa2x3b3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mjc2ODEsImV4cCI6MjA2OTQwMzY4MX0.e7RR0PHzyWlrQ3Ci9V9ZCLrPKmtIO0PMef0ue3yBce8'

// Debug das configurações
console.log('🔧 Configurações Supabase:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKey: import.meta.env.VITE_SUPABASE_ANON_KEY
})

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

  // Tarefas a Fazer (tabela específica para tarefas delegadas)
  async getTarefasAFazer() {
    try {
      // Primeiro, tenta buscar com relacionamento
      let { data, error } = await supabase
        .from('tarefas_a_fazer')
        .select(`
          *,
          funcionario:funcionarios(nome, email)
        `)
        .order('prazo', { ascending: true })

      if (error) {
        console.warn('Erro ao buscar com relacionamento, tentando sem:', error.message)
        
        // Se falhar com relacionamento, tenta sem
        const { data: simpleData, error: simpleError } = await supabase
          .from('tarefas_a_fazer')
          .select('*')
          .order('prazo', { ascending: true })

        if (simpleError) {
          console.error('Erro ao buscar tarefas_a_fazer:', simpleError)
          return []
        }

        return simpleData || []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao buscar tarefas a fazer:', error)
      return []
    }
  }

  async createTarefaAFazer(tarefa) {
    try {
      // Validar dados obrigatórios
      if (!tarefa.titulo || !tarefa.descricao || !tarefa.funcionario_responsavel_id || !tarefa.prazo) {
        throw new Error('Campos obrigatórios: título, descrição, funcionário responsável e prazo')
      }

      // Formatar dados antes de inserir
      const tarefaFormatada = {
        titulo: tarefa.titulo.trim(),
        descricao: tarefa.descricao.trim(),
        funcionario_responsavel_id: tarefa.funcionario_responsavel_id,
        importancia: tarefa.importancia || 'media',
        concluida: tarefa.concluida || false,
        prazo: tarefa.prazo,
        telefone_whatsapp: tarefa.telefone_whatsapp || '',
        mensagem_whatsapp: tarefa.mensagem_whatsapp || '',
        observacoes: tarefa.observacoes || '',
        data_criacao: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tarefas_a_fazer')
        .insert([tarefaFormatada])
        .select()

      if (error) {
        console.error('Erro ao criar tarefa:', error)
        throw new Error(`Erro ao criar tarefa: ${error.message}`)
      }

      return data[0]
    } catch (error) {
      console.error('Erro na função createTarefaAFazer:', error)
      throw error
    }
  }

  async updateTarefaAFazer(id, updates) {
    const { data, error } = await supabase
      .from('tarefas_a_fazer')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  async deleteTarefaAFazer(id) {
    const { error } = await supabase
      .from('tarefas_a_fazer')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async toggleTarefaConcluida(id, concluida) {
    const { data, error } = await supabase
      .from('tarefas_a_fazer')
      .update({ concluida })
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  }

  // Agenda
  async getAgenda() {
    // Buscar todos os agendamentos sem limite de data ou quantidade
    const { data, error } = await supabase
      .from('agenda')
      .select(`
        *,
        funcionario:funcionarios(nome, cor),
        tarefa:tarefas(nome, categoria)
      `)
      .order('data', { ascending: false })
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
    console.log('🗑️ Iniciando exclusão de IDs:', ids)
    
    if (!ids || ids.length === 0) {
      console.warn('⚠️ Nenhum ID fornecido para exclusão')
      return { deleted: 0 }
    }
    
    // Primeiro, verificar quais registros existem
    const { data: existingRecords, error: checkError } = await supabase
      .from('agenda')
      .select('id')
      .in('id', ids)
    
    if (checkError) {
      console.error('❌ Erro ao verificar registros:', checkError)
      throw checkError
    }
    
    console.log(`📋 Encontrados ${existingRecords?.length || 0} registros de ${ids.length} solicitados`)
    
    if (!existingRecords || existingRecords.length === 0) {
      console.warn('⚠️ Nenhum registro encontrado para exclusão')
      return { deleted: 0 }
    }
    
    // Executar exclusão
    const { error } = await supabase
      .from('agenda')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('❌ Erro na exclusão:', error)
      throw error
    }
    
    // Verificar se os registros foram realmente excluídos
    const { data: remainingRecords, error: verifyError } = await supabase
      .from('agenda')
      .select('id')
      .in('id', ids)
    
    if (verifyError) {
      console.warn('⚠️ Erro ao verificar exclusão:', verifyError)
    } else {
      const actualDeleted = existingRecords.length - (remainingRecords?.length || 0)
      console.log(`✅ Exclusão verificada: ${actualDeleted} registros realmente excluídos`)
      
      if (remainingRecords && remainingRecords.length > 0) {
        console.warn(`⚠️ ${remainingRecords.length} registros ainda existem:`, remainingRecords.map(r => r.id))
      }
      
      return { deleted: actualDeleted }
    }
    
    console.log(`✅ Exclusão concluída: ${existingRecords.length} registros`)
    
    // Aguardar um pouco para garantir que a exclusão foi processada
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return { deleted: existingRecords.length }
  }

  // Método alternativo: exclusão individual em loop (para debug)
  async deleteMultipleAgendamentosIndividual(ids) {
    console.log('Tentando exclusão individual para IDs:', ids)
    let deletedCount = 0
    const errors = []

    for (const id of ids) {
      try {
        const { error } = await supabase
          .from('agenda')
          .delete()
          .eq('id', id)

        if (error) {
          console.error(`Erro ao excluir ID ${id}:`, error)
          errors.push({ id, error })
        } else {
          deletedCount++
          console.log(`ID ${id} excluído com sucesso`)
        }
      } catch (err) {
        console.error(`Exceção ao excluir ID ${id}:`, err)
        errors.push({ id, error: err })
      }
    }

    if (errors.length > 0) {
      console.error('Erros durante exclusão individual:', errors)
      throw new Error(`Falha ao excluir ${errors.length} de ${ids.length} registros`)
    }

    return { deleted: deletedCount }
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

  // Agenda de hoje (otimizada)
  async getAgendaHoje() {
    const hoje = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('agenda')
      .select(`
        *,
        funcionario:funcionarios(nome, cor),
        tarefa:tarefas(nome, categoria)
      `)
      .eq('data', hoje)
      .order('horario')

    if (error) throw error
    return data
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