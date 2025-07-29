/**
 * Service layer para comunicação com a API
 * Suporta Supabase, API local e fallback estático
 */
import { supabaseService } from './supabase.js'

const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Configuração para escolher o backend
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true' || import.meta.env.MODE === 'production';

// Dados estáticos para fallback em produção
const STATIC_DATA = {
  funcionarios: [
    {"id": "guido", "nome": "Guido", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#2563eb"},
    {"id": "pedro", "nome": "Pedro", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#10b981"},
    {"id": "michelle", "nome": "Michelle", "horarioInicio": "13:00", "horarioFim": "17:30", "cor": "#f59e0b"},
    {"id": "dayana", "nome": "Dayana", "horarioInicio": "09:00", "horarioFim": "17:30", "cor": "#ef4444"},
    {"id": "jean", "nome": "Jean", "horarioInicio": "08:00", "horarioFim": "17:30", "cor": "#8b5cf6"},
    {"id": "andreia", "nome": "Andreia", "horarioInicio": "14:00", "horarioFim": "17:30", "cor": "#06b6d4"},
    {"id": "thais", "nome": "Thais", "horarioInicio": "flexible", "horarioFim": "flexible", "cor": "#ec4899"},
    {"id": "teste_funcionario", "nome": "Funcionário de Teste", "horarioInicio": "", "horarioFim": "16:00", "cor": "#2563eb"}
  ],
  tarefas: [
    {"id": "checkins", "nome": "Check-ins", "categoria": "gestao", "tempoEstimado": 30, "descricao": "Acompanhamento individual dos alunos", "prioridade": "alta"},
    {"id": "reuniao_diaria", "nome": "Reunião diária", "categoria": "gestao", "tempoEstimado": 30, "descricao": "Alinhamento da equipe e planejamento do dia", "prioridade": "alta"},
    {"id": "suporte", "nome": "Suporte", "categoria": "atendimento", "tempoEstimado": 60, "descricao": "Atendimento aos clientes e resolução de dúvidas", "prioridade": "alta"},
    {"id": "social_selling", "nome": "Social Selling Insta", "categoria": "marketing", "tempoEstimado": 45, "descricao": "Atividades de marketing no Instagram", "prioridade": "media"},
    {"id": "engajamento_grupo", "nome": "Enviar mensagens de engajamento no grupo", "categoria": "engajamento", "tempoEstimado": 30, "descricao": "Comunicação ativa com grupos de alunos", "prioridade": "alta"},
    {"id": "separar_alunos", "nome": "Separar alunos para engajamento", "categoria": "engajamento", "tempoEstimado": 45, "descricao": "Segmentação de alunos para ações específicas", "prioridade": "media"},
    {"id": "material_renovacao", "nome": "Elaborar material para alunos de renovação", "categoria": "conteudo", "tempoEstimado": 90, "descricao": "Criação de conteúdo para retenção de clientes", "prioridade": "alta"},
    {"id": "montar_planos", "nome": "Montar planos novos", "categoria": "produto", "tempoEstimado": 60, "descricao": "Desenvolvimento de novos produtos e serviços", "prioridade": "media"},
    {"id": "engajamento_alunos", "nome": "Engajamento dos alunos", "categoria": "engajamento", "tempoEstimado": 45, "descricao": "Ativação e motivação dos alunos", "prioridade": "alta"},
    {"id": "conteudo_desengajados", "nome": "Produção de conteúdo para alunos desengajados", "categoria": "conteudo", "tempoEstimado": 60, "descricao": "Material específico para reativação de alunos", "prioridade": "media"},
    {"id": "engajamento_time", "nome": "Engajamento no grupo do Time", "categoria": "interno", "tempoEstimado": 15, "descricao": "Comunicação e motivação da equipe interna", "prioridade": "baixa"}
  ],
  agenda: [
    {"horario": "08:00", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "09:00", "funcionario": "guido", "tarefa": "checkins"},
    {"horario": "09:00", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "09:00", "funcionario": "dayana", "tarefa": "social_selling"},
    {"horario": "09:00", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "09:30", "funcionario": "guido", "tarefa": "reuniao_diaria"},
    {"horario": "09:30", "funcionario": "pedro", "tarefa": "reuniao_diaria"},
    {"horario": "09:30", "funcionario": "dayana", "tarefa": "reuniao_diaria"},
    {"horario": "09:30", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "10:00", "funcionario": "guido", "tarefa": "reuniao_diaria"},
    {"horario": "10:00", "funcionario": "pedro", "tarefa": "reuniao_diaria"},
    {"horario": "10:00", "funcionario": "dayana", "tarefa": "reuniao_diaria"},
    {"horario": "10:00", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "10:30", "funcionario": "guido", "tarefa": "checkins"},
    {"horario": "10:30", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "10:30", "funcionario": "dayana", "tarefa": "engajamento_grupo"},
    {"horario": "10:30", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "11:00", "funcionario": "guido", "tarefa": "checkins"},
    {"horario": "11:00", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "11:00", "funcionario": "jean", "tarefa": "suporte"},
    {"horario": "11:00", "funcionario": "thais", "tarefa": "checkins"},
    {"horario": "11:30", "funcionario": "guido", "tarefa": "montar_planos"},
    {"horario": "11:30", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "11:30", "funcionario": "thais", "tarefa": "montar_planos"},
    {"horario": "13:00", "funcionario": "guido", "tarefa": "suporte"},
    {"horario": "13:00", "funcionario": "michelle", "tarefa": "checkins"},
    {"horario": "13:00", "funcionario": "dayana", "tarefa": "social_selling"},
    {"horario": "13:30", "funcionario": "guido", "tarefa": "separar_alunos"},
    {"horario": "13:30", "funcionario": "michelle", "tarefa": "checkins"},
    {"horario": "13:30", "funcionario": "dayana", "tarefa": "social_selling"},
    {"horario": "14:00", "funcionario": "guido", "tarefa": "separar_alunos"},
    {"horario": "14:00", "funcionario": "michelle", "tarefa": "engajamento_grupo"},
    {"horario": "14:00", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "14:30", "funcionario": "guido", "tarefa": "separar_alunos"},
    {"horario": "14:30", "funcionario": "michelle", "tarefa": "engajamento_grupo"},
    {"horario": "14:30", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "15:00", "funcionario": "pedro", "tarefa": "material_renovacao"},
    {"horario": "15:00", "funcionario": "michelle", "tarefa": "engajamento_grupo"},
    {"horario": "15:00", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "15:30", "funcionario": "pedro", "tarefa": "material_renovacao"},
    {"horario": "15:30", "funcionario": "michelle", "tarefa": "material_renovacao"},
    {"horario": "15:30", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "16:00", "funcionario": "pedro", "tarefa": "material_renovacao"},
    {"horario": "16:00", "funcionario": "michelle", "tarefa": "material_renovacao"},
    {"horario": "16:00", "funcionario": "dayana", "tarefa": "engajamento_alunos"},
    {"horario": "16:00", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "16:30", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "16:30", "funcionario": "michelle", "tarefa": "material_renovacao"},
    {"horario": "16:30", "funcionario": "dayana", "tarefa": "checkins"},
    {"horario": "16:30", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "17:00", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "17:00", "funcionario": "michelle", "tarefa": "suporte"},
    {"horario": "17:00", "funcionario": "dayana", "tarefa": "social_selling"},
    {"horario": "17:00", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "17:00", "funcionario": "thais", "tarefa": "checkins"},
    {"horario": "17:30", "funcionario": "pedro", "tarefa": "checkins"},
    {"horario": "17:30", "funcionario": "michelle", "tarefa": "suporte"},
    {"horario": "17:30", "funcionario": "dayana", "tarefa": "social_selling"},
    {"horario": "17:30", "funcionario": "andreia", "tarefa": "suporte"},
    {"horario": "17:30", "funcionario": "thais", "tarefa": "montar_planos"}
  ]
};

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        // Tenta ler o corpo da resposta para mais detalhes
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText.includes('<!doctype') || errorText.includes('<html')) {
            errorMessage = `Servidor retornou HTML em vez de JSON. Verifique se a API está rodando em ${API_BASE_URL}`;
          } else {
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          // Ignora erro ao ler resposta
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta não é JSON válido');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // Melhora a mensagem de erro para problemas de conexão
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Não foi possível conectar com a API em ${API_BASE_URL}. Verifique se o backend está rodando.`);
      }
      
      throw error;
    }
  }

  // FUNCIONÁRIOS
  async getFuncionarios() {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getFuncionarios();
      } catch (error) {
        console.warn('Supabase não disponível, usando dados estáticos:', error.message);
        return STATIC_DATA.funcionarios;
      }
    }
    
    try {
      return await this.request('/funcionarios');
    } catch (error) {
      console.warn('API não disponível, usando dados estáticos:', error.message);
      return STATIC_DATA.funcionarios;
    }
  }

  async getFuncionario(id) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getFuncionario(id);
      } catch (error) {
        console.warn('Supabase não disponível, usando dados estáticos');
        const funcionario = STATIC_DATA.funcionarios.find(f => f.id === id);
        if (funcionario) return funcionario;
        throw new Error('Funcionário não encontrado');
      }
    }
    
    try {
      return await this.request(`/funcionarios/${id}`);
    } catch (error) {
      console.warn('API não disponível, usando dados estáticos');
      const funcionario = STATIC_DATA.funcionarios.find(f => f.id === id);
      if (funcionario) return funcionario;
      throw new Error('Funcionário não encontrado');
    }
  }

  async createFuncionario(funcionario) {
    if (USE_SUPABASE) {
      return await supabaseService.createFuncionario(funcionario);
    }
    throw new Error('Criação de funcionários não disponível no modo estático');
  }

  async updateFuncionario(id, updates) {
    if (USE_SUPABASE) {
      return await supabaseService.updateFuncionario(id, updates);
    }
    throw new Error('Edição de funcionários não disponível no modo estático');
  }

  async deleteFuncionario(id) {
    if (USE_SUPABASE) {
      return await supabaseService.deleteFuncionario(id);
    }
    throw new Error('Exclusão de funcionários não disponível no modo estático');
  }

  // TAREFAS
  async getTarefas() {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getTarefas();
      } catch (error) {
        console.warn('Supabase não disponível, usando dados estáticos:', error.message);
        return STATIC_DATA.tarefas;
      }
    }
    
    try {
      return await this.request('/tarefas');
    } catch (error) {
      console.warn('API não disponível, usando dados estáticos:', error.message);
      return STATIC_DATA.tarefas;
    }
  }

  async getTarefa(id) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getTarefa(id);
      } catch (error) {
        console.warn('Supabase não disponível, usando dados estáticos');
        const tarefa = STATIC_DATA.tarefas.find(t => t.id === id);
        if (tarefa) return tarefa;
        throw new Error('Tarefa não encontrada');
      }
    }
    
    try {
      return await this.request(`/tarefas/${id}`);
    } catch (error) {
      console.warn('API não disponível, usando dados estáticos');
      const tarefa = STATIC_DATA.tarefas.find(t => t.id === id);
      if (tarefa) return tarefa;
      throw new Error('Tarefa não encontrada');
    }
  }

  async createTarefa(tarefa) {
    if (USE_SUPABASE) {
      return await supabaseService.createTarefa(tarefa);
    }
    throw new Error('Criação de tarefas não disponível no modo estático');
  }

  async updateTarefa(id, updates) {
    if (USE_SUPABASE) {
      return await supabaseService.updateTarefa(id, updates);
    }
    throw new Error('Edição de tarefas não disponível no modo estático');
  }

  async deleteTarefa(id) {
    if (USE_SUPABASE) {
      return await supabaseService.deleteTarefa(id);
    }
    throw new Error('Exclusão de tarefas não disponível no modo estático');
  }

  // AGENDA
  async getAgenda() {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getAgenda();
      } catch (error) {
        console.warn('Supabase não disponível, usando dados estáticos:', error.message);
        return STATIC_DATA.agenda;
      }
    }
    
    try {
      return await this.request('/agenda');
    } catch (error) {
      console.warn('API não disponível, usando dados estáticos:', error.message);
      return STATIC_DATA.agenda;
    }
  }

  async getAgendaFuncionario(funcionarioId) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getAgendaFuncionario(funcionarioId);
      } catch (error) {
        console.warn('Supabase não disponível, usando dados estáticos');
        return STATIC_DATA.agenda.filter(item => item.funcionario === funcionarioId);
      }
    }
    
    try {
      return await this.request(`/agenda/funcionario/${funcionarioId}`);
    } catch (error) {
      console.warn('API não disponível, usando dados estáticos');
      return STATIC_DATA.agenda.filter(item => item.funcionario === funcionarioId);
    }
  }

  async createAgendamento(agendamento) {
    if (USE_SUPABASE) {
      return await supabaseService.createAgendamento(agendamento);
    }
    throw new Error('Criação de agendamentos não disponível no modo estático');
  }

  async updateAgendamento(id, updates) {
    if (USE_SUPABASE) {
      return await supabaseService.updateAgendamento(id, updates);
    }
    throw new Error('Edição de agendamentos não disponível no modo estático');
  }

  async deleteAgendamento(id) {
    if (USE_SUPABASE) {
      return await supabaseService.deleteAgendamento(id);
    }
    throw new Error('Exclusão de agendamentos não disponível no modo estático');
  }

  // Health check
  async checkHealth() {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.healthCheck();
      } catch (error) {
        throw new Error('Supabase não disponível');
      }
    }
    return this.request('/health');
  }

  // Teste simples de conectividade
  async testConnection() {
    return this.getFuncionarios();
  }

  // Verifica qual backend está sendo usado
  getBackendType() {
    return USE_SUPABASE ? 'supabase' : 'api';
  }
}

// Instância singleton
const apiService = new ApiService();

export default apiService;