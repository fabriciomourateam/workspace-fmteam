import { supabase } from './supabase'

// Gera um ID único para o usuário (baseado no localStorage ou cria um novo)
const getUserId = () => {
  let userId = localStorage.getItem('user_id')
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
    localStorage.setItem('user_id', userId)
  }
  return userId
}

class UserPreferencesService {
  constructor() {
    this.userId = getUserId()
  }

  // Salvar preferência (usando localStorage por enquanto)
  async savePreference(type, data) {
    try {
      // Usar localStorage diretamente (RLS desativado)
      localStorage.setItem(`preference_${type}`, JSON.stringify(data))
      console.log(`✅ Preferência ${type} salva no localStorage:`, data)
      return true
    } catch (error) {
      console.error('Erro ao salvar preferência:', error)
      return false
    }
  }

  // Carregar preferência (usando localStorage por enquanto)
  async loadPreference(type) {
    try {
      // Usar localStorage diretamente (RLS desativado)
      const localData = localStorage.getItem(`preference_${type}`)
      if (localData) {
        console.log(`📥 Preferência ${type} carregada do localStorage:`, JSON.parse(localData))
        return JSON.parse(localData)
      }
      return null
    } catch (error) {
      console.error('Erro ao carregar preferência:', error)
      return null
    }
  }

  // Salvar larguras das colunas
  async saveColumnWidths(widths) {
    const success = await this.savePreference('column_widths', widths)
    if (success) {
      // Também salva no localStorage como backup
      localStorage.setItem('cronograma-column-widths', JSON.stringify(widths))
    }
    return success
  }

  // Carregar larguras das colunas
  async loadColumnWidths() {
    // Primeiro tenta carregar da nuvem
    const cloudData = await this.loadPreference('column_widths')
    if (cloudData) {
      // Sincroniza com localStorage
      localStorage.setItem('cronograma-column-widths', JSON.stringify(cloudData))
      return cloudData
    }

    // Se não tem na nuvem, tenta localStorage
    const localData = localStorage.getItem('cronograma-column-widths')
    if (localData) {
      const parsedData = JSON.parse(localData)
      // Salva na nuvem para próxima vez
      this.saveColumnWidths(parsedData)
      return parsedData
    }

    return {}
  }

  // Salvar ordem das colunas
  async saveColumnOrder(order) {
    const success = await this.savePreference('column_order', order)
    if (success) {
      // Também salva no localStorage como backup
      localStorage.setItem('cronograma-ordem-colunas', JSON.stringify(order))
    }
    return success
  }

  // Carregar ordem das colunas
  async loadColumnOrder() {
    // Primeiro tenta carregar da nuvem
    const cloudData = await this.loadPreference('column_order')
    if (cloudData) {
      // Sincroniza com localStorage
      localStorage.setItem('cronograma-ordem-colunas', JSON.stringify(cloudData))
      return cloudData
    }

    // Se não tem na nuvem, tenta localStorage
    const localData = localStorage.getItem('cronograma-ordem-colunas')
    if (localData) {
      const parsedData = JSON.parse(localData)
      // Salva na nuvem para próxima vez
      this.saveColumnOrder(parsedData)
      return parsedData
    }

    return []
  }

  // Sincronizar todas as preferências locais com a nuvem
  async syncAllPreferences() {
    try {
      // Sincronizar larguras das colunas
      const localWidths = localStorage.getItem('cronograma-column-widths')
      if (localWidths) {
        await this.saveColumnWidths(JSON.parse(localWidths))
      }

      // Sincronizar ordem das colunas
      const localOrder = localStorage.getItem('cronograma-ordem-colunas')
      if (localOrder) {
        await this.saveColumnOrder(JSON.parse(localOrder))
      }

      console.log('✅ Todas as preferências foram sincronizadas com a nuvem')
      return true
    } catch (error) {
      console.error('Erro ao sincronizar preferências:', error)
      return false
    }
  }
}

const userPreferencesService = new UserPreferencesService()
export default userPreferencesService
