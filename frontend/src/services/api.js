/**
 * Service layer para comunicação com a API
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

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

  // Funcionários
  async getFuncionarios() {
    return this.request('/funcionarios');
  }

  async getFuncionario(id) {
    return this.request(`/funcionarios/${id}`);
  }

  // Tarefas
  async getTarefas() {
    return this.request('/tarefas');
  }

  async getTarefa(id) {
    return this.request(`/tarefas/${id}`);
  }

  // Agenda
  async getAgenda() {
    return this.request('/agenda');
  }

  async getAgendaFuncionario(funcionarioId) {
    return this.request(`/agenda/funcionario/${funcionarioId}`);
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }

  // Teste simples de conectividade
  async testConnection() {
    return this.request('/funcionarios');
  }
}

// Instância singleton
const apiService = new ApiService();

export default apiService;