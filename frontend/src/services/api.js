/**
 * Service layer para comunicação com Supabase
 */
import { supabaseService } from './supabase.js'

// Configuração da API (Railway backend como fallback)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Debug log
console.log('🔧 Backend Configuration:', {
  mode: import.meta.env.MODE,
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiUrl: API_BASE_URL,
  backend: 'Supabase + Railway API'
});



class ApiService {
  // FUNCIONÁRIOS
  async getFuncionarios() {
    console.log('🔄 Buscando funcionários no Supabase...');
    return await supabaseService.getFuncionarios();
  }

  async getFuncionario(id) {
    return await supabaseService.getFuncionarios().then(funcionarios =>
      funcionarios.find(f => f.id === id)
    );
  }

  async createFuncionario(funcionario) {
    return await supabaseService.createFuncionario(funcionario);
  }

  async updateFuncionario(id, updates) {
    return await supabaseService.updateFuncionario(id, updates);
  }

  async deleteFuncionario(id) {
    return await supabaseService.deleteFuncionario(id);
  }

  // TAREFAS
  async getTarefas() {
    console.log('🔄 Buscando tarefas no Supabase...');
    return await supabaseService.getTarefas();
  }

  async getTarefa(id) {
    return await supabaseService.getTarefas().then(tarefas =>
      tarefas.find(t => t.id === id)
    );
  }

  async createTarefa(tarefa) {
    return await supabaseService.createTarefa(tarefa);
  }

  async updateTarefa(id, updates) {
    return await supabaseService.updateTarefa(id, updates);
  }

  async deleteTarefa(id) {
    return await supabaseService.deleteTarefa(id);
  }

  // AGENDA
  async getAgenda() {
    console.log('🔄 Buscando agenda no Supabase...');
    return await supabaseService.getAgenda();
  }

  async getAgendaFuncionario(funcionarioId) {
    return await supabaseService.getAgendaFuncionario(funcionarioId);
  }

  async createAgendamento(agendamento) {
    return await supabaseService.createAgendamento(agendamento);
  }

  async updateAgendamento(id, updates) {
    return await supabaseService.updateAgendamento(id, updates);
  }

  async deleteAgendamento(id) {
    return await supabaseService.deleteAgendamento(id);
  }

  // Health check
  async checkHealth() {
    return await supabaseService.healthCheck();
  }

  // Teste simples de conectividade
  async testConnection() {
    return this.getFuncionarios();
  }

  // Verifica qual backend está sendo usado
  getBackendType() {
    return 'supabase';
  }
}

// Instância singleton
const apiService = new ApiService();

export default apiService;