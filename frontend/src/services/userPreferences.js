import supabaseService from './supabase'

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

  // Salvar preferência na nuvem
  async savePreference(type, data) {
    try {
      const { data: result, error } = await supabaseService.supabase
        .from('user_preferences')
        .upsert({
          user_id: this.userId,
          preference_type: type,
          preference_data: data,
          updated_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Erro ao salvar preferência:', error)
        return false
      }

      console.log(`✅ Preferência ${type} salva na nuvem:`, data)
      return true
    } catch (error) {
      console.error('Erro ao salvar preferência:', error)
      return false
    }
  }

  // Carregar preferência da nuvem
  async loadPreference(type) {
    try {
      const { data, error } = await supabaseService.supabase
        .from('user_preferences')
        .select('preference_data')
        .eq('user_id', this.userId)
        .eq('preference_type', type)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao carregar preferência:', error)
        return null
      }

      if (data) {
        console.log(`📥 Preferência ${type} carregada da nuvem:`, data.preference_data)
        return data.preference_data
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
