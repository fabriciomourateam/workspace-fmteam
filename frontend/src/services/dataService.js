/**
 * Service unificado para dados - Supabase + Fallback
 */
import { supabaseService } from './supabase.js'

// Verificar se Supabase está configurado
const USE_SUPABASE = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

// Dados estáticos para fallback
const STATIC_DATA = {
  funcionarios: [
    {"id": "guido", "nome": "Guido", "horario_inicio": "09:00", "horario_fim": "17:30", "cor": "#2563eb"},
    {"id": "pedro", "nome": "Pedro", "horario_inicio": "09:00", "horario_fim": "17:30", "cor": "#10b981"},
    {"id": "michelle", "nome": "Michelle", "horario_inicio": "13:00", "horario_fim": "17:30", "cor": "#f59e0b"},
    {"id": "dayana", "nome": "Dayana", "horario_inicio": "09:00", "horario_fim": "17:30", "cor": "#ef4444"},
    {"id": "jean", "nome": "Jean", "horario_inicio": "08:00", "horario_fim": "17:30", "cor": "#8b5cf6"},
    {"id": "andreia", "nome": "Andreia", "horario_inicio": "14:00", "horario_fim": "17:30", "cor": "#06b6d4"},
    {"id": "thais", "nome": "Thais", "horario_inicio": "flexible", "horario_fim": "flexible", "cor": "#ec4899"},
    {"id": "teste_funcionario", "nome": "Funcionário de Teste", "horario_inicio": "", "horario_fim": "16:00", "cor": "#2563eb"}
  ],
  tarefas: [
    {"id": "checkins", "nome": "Check-ins", "categoria": "gestao", "tempo_estimado": 30, "descricao": "Acompanhamento individual dos alunos", "prioridade": "alta"},
    {"id": "reuniao_diaria", "nome": "Reunião diária", "categoria": "gestao", "tempo_estimado": 30, "descricao": "Alinhamento da equipe e planejamento do dia", "prioridade": "alta"},
    {"id": "suporte", "nome": "Suporte", "categoria": "atendimento", "tempo_estimado": 30, "descricao": "Atendimento aos clientes e resolução de dúvidas", "prioridade": "alta"},
    {"id": "social_selling", "nome": "Social Selling Insta", "categoria": "marketing", "tempo_estimado": 30, "descricao": "Atividades de marketing no Instagram", "prioridade": "media"},
    {"id": "engajamento_grupo", "nome": "Enviar mensagens de engajamento no grupo", "categoria": "engajamento", "tempo_estimado": 30, "descricao": "Comunicação ativa com grupos de alunos", "prioridade": "alta"},
    {"id": "separar_alunos", "nome": "Separar alunos para engajamento", "categoria": "engajamento", "tempo_estimado": 30, "descricao": "Segmentação de alunos para ações específicas", "prioridade": "media"},
    {"id": "material_renovacao", "nome": "Elaborar material para alunos de renovação", "categoria": "conteudo", "tempo_estimado": 30, "descricao": "Criação de conteúdo para retenção de clientes", "prioridade": "alta"},
    {"id": "montar_planos", "nome": "Montar planos novos", "categoria": "produto", "tempo_estimado": 30, "descricao": "Desenvolvimento de novos produtos e serviços", "prioridade": "media"},
    {"id": "engajamento_alunos", "nome": "Engajamento dos alunos", "categoria": "engajamento", "tempo_estimado": 30, "descricao": "Ativação e motivação dos alunos", "prioridade": "alta"},
    {"id": "conteudo_desengajados", "nome": "Produção de conteúdo para alunos desengajados", "categoria": "conteudo", "tempo_estimado": 30, "descricao": "Material específico para reativação de alunos", "prioridade": "media"},
    {"id": "engajamento_time", "nome": "Engajamento no grupo do Time", "categoria": "interno", "tempo_estimado": 30, "descricao": "Comunicação e motivação da equipe interna", "prioridade": "baixa"}
  ],
  agenda: [
    {"horario": "08:00", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "09:00", "funcionario": "guido", "tarefa": "checkins"},
    {"horario": "09:00", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "09:00", "funcionario": "dayana", "tarefa": "social_selling"},
    {"horario": "09:30", "funcionario": "guido", "tarefa": "reuniao_diaria"},
    {"horario": "09:30", "funcionario": "pedro", "tarefa": "reuniao_diaria"},
    {"horario": "10:00", "funcionario": "guido", "tarefa": "reuniao_diaria"},
    {"horario": "10:30", "funcionario": "guido", "tarefa": "checkins"},
    {"horario": "11:00", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "13:00", "funcionario": "michelle", "tarefa": "checkins"},
    {"horario": "14:00", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "15:00", "funcionario": "pedro", "tarefa": "material_renovacao"},
    {"horario": "16:00", "funcionario": "michelle", "tarefa": "material_renovacao"},
    {"horario": "17:00", "funcionario": "thais", "tarefa": "checkins"}
  ]
};

class DataService {
  constructor() {
    this.isSupabaseEnabled = USE_SUPABASE;
    this._cache = new Map();
    console.log('DataService initialized:', {
      supabaseEnabled: this.isSupabaseEnabled,
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });
  }

  // Limpar cache
  clearCache(key = null) {
    if (key) {
      this._cache.delete(key);
    } else {
      this._cache.clear();
    }
    console.log('🧹 Cache limpo:', key || 'todos');
  }

  // Funcionários
  async getFuncionarios() {
    if (this.isSupabaseEnabled) {
      try {
        const data = await supabaseService.getFuncionarios();
        console.log('Funcionários carregados do Supabase:', data.length);
        return data;
      } catch (error) {
        console.error('Erro no Supabase, usando fallback:', error);
      }
    }
    
    console.log('Usando dados estáticos para funcionários');
    return STATIC_DATA.funcionarios;
  }

  async createFuncionario(funcionario) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.createFuncionario(funcionario);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  async updateFuncionario(id, updates) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.updateFuncionario(id, updates);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  async deleteFuncionario(id) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.deleteFuncionario(id);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  // Tarefas
  async getTarefas() {
    if (this.isSupabaseEnabled) {
      try {
        const data = await supabaseService.getTarefas();
        console.log('Tarefas carregadas do Supabase:', data.length);
        return data;
      } catch (error) {
        console.error('Erro no Supabase, usando fallback:', error);
      }
    }
    
    console.log('Usando dados estáticos para tarefas');
    return STATIC_DATA.tarefas;
  }

  async createTarefa(tarefa) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.createTarefa(tarefa);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  async updateTarefa(id, updates) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.updateTarefa(id, updates);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  async deleteTarefa(id) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.deleteTarefa(id);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  // Agenda
  async getAgenda() {
    if (this.isSupabaseEnabled) {
      try {
        // Buscar apenas dados do Supabase (sem duplicação)
        const data = await supabaseService.getAgenda();
        // Transformar dados do Supabase para formato esperado
        const transformedData = data.map(item => ({
          id: item.id,
          horario: item.horario,
          funcionario: item.funcionario_id,
          tarefa: item.tarefa_id,
          data: item.data,
          status: item.status || 'nao_iniciada',
          tempo_real: item.tempo_real || 0,
          tempo_inicio: item.tempo_inicio,
          tempo_fim: item.tempo_fim,
          funcionario_nome: item.funcionario?.nome,
          tarefa_nome: item.tarefa?.nome,
          // Novas colunas para agendamentos longos
          duracao: item.duracao || 30,
          horarios_ocupados: item.horarios_ocupados || [item.horario]
        }));
        
        return transformedData;
      } catch (error) {
        console.error('Erro no Supabase, usando fallback:', error);
      }
    }
    
    return STATIC_DATA.agenda;
  }

  async createAgendamento(agendamento) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.createAgendamento(agendamento);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  async updateAgendamento(id, updates) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.updateAgendamento(id, updates);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  async deleteAgendamento(id) {
    if (this.isSupabaseEnabled) {
      return await supabaseService.deleteAgendamento(id);
    }
    throw new Error('Edição não disponível sem Supabase');
  }

  // Métodos de conveniência
  async getFuncionario(id) {
    const funcionarios = await this.getFuncionarios();
    return funcionarios.find(f => f.id === id);
  }

  async getTarefa(id) {
    const tarefas = await this.getTarefas();
    return tarefas.find(t => t.id === id);
  }

  async getAgendaFuncionario(funcionarioId) {
    const agenda = await this.getAgenda();
    return agenda.filter(item => item.funcionario === funcionarioId);
  }

  // Status
  getStatus() {
    return {
      supabaseEnabled: this.isSupabaseEnabled,
      canEdit: this.isSupabaseEnabled,
      dataSource: this.isSupabaseEnabled ? 'Supabase' : 'Estático'
    };
  }
}

// Instância singleton
const dataService = new DataService();

export default dataService;