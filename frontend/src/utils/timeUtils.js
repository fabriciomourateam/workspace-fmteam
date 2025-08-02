/**
 * Utilitários para formatação de horários
 */

/**
 * Converte um horário simples em um intervalo de 30 minutos
 * @param {string} horario - Horário no formato "HH:MM"
 * @returns {string} - Horário no formato "HH:MM às HH:MM"
 */
export function formatarHorarioIntervalo(horario) {
  if (!horario) return ''
  
  try {
    // Parse do horário inicial
    const [horas, minutos] = horario.split(':').map(Number)
    
    // Criar objeto Date para facilitar cálculos
    const inicio = new Date()
    inicio.setHours(horas, minutos, 0, 0)
    
    // Adicionar 30 minutos
    const fim = new Date(inicio)
    fim.setMinutes(fim.getMinutes() + 30)
    
    // Formatar horários
    const horaInicio = inicio.getHours().toString().padStart(2, '0')
    const minutoInicio = inicio.getMinutes().toString().padStart(2, '0')
    const horaFim = fim.getHours().toString().padStart(2, '0')
    const minutoFim = fim.getMinutes().toString().padStart(2, '0')
    
    return `${horaInicio}:${minutoInicio} às ${horaFim}:${minutoFim}`
  } catch (error) {
    console.error('Erro ao formatar horário:', error)
    return horario // Retorna o horário original em caso de erro
  }
}

/**
 * Converte um horário simples em um intervalo personalizado
 * @param {string} horario - Horário no formato "HH:MM"
 * @param {number} duracaoMinutos - Duração em minutos (padrão: 30)
 * @returns {string} - Horário no formato "HH:MM às HH:MM"
 */
export function formatarHorarioIntervaloCustom(horario, duracaoMinutos = 30) {
  if (!horario) return ''
  
  try {
    const [horas, minutos] = horario.split(':').map(Number)
    
    const inicio = new Date()
    inicio.setHours(horas, minutos, 0, 0)
    
    const fim = new Date(inicio)
    fim.setMinutes(fim.getMinutes() + duracaoMinutos)
    
    const horaInicio = inicio.getHours().toString().padStart(2, '0')
    const minutoInicio = inicio.getMinutes().toString().padStart(2, '0')
    const horaFim = fim.getHours().toString().padStart(2, '0')
    const minutoFim = fim.getMinutes().toString().padStart(2, '0')
    
    return `${horaInicio}:${minutoInicio} às ${horaFim}:${minutoFim}`
  } catch (error) {
    console.error('Erro ao formatar horário:', error)
    return horario
  }
}

/**
 * Extrai apenas o horário de início de um intervalo
 * @param {string} intervalo - Horário no formato "HH:MM às HH:MM"
 * @returns {string} - Horário de início "HH:MM"
 */
export function extrairHorarioInicio(intervalo) {
  if (!intervalo) return ''
  
  if (intervalo.includes(' às ')) {
    return intervalo.split(' às ')[0]
  }
  
  return intervalo
}

/**
 * Formata uma data para exibição em português brasileiro
 * @param {string|Date} data - Data no formato ISO ou objeto Date
 * @returns {string} - Data formatada "DD/MM/AAAA"
 */
export function formatarData(data) {
  if (!data) return ''
  
  try {
    const dataObj = typeof data === 'string' ? new Date(data + 'T00:00:00') : new Date(data)
    
    // Verificar se a data é válida
    if (isNaN(dataObj.getTime())) {
      console.warn('Data inválida:', data)
      return data.toString()
    }
    
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return data.toString()
  }
}

/**
 * Formata uma data para exibição completa
 * @param {string|Date} data - Data no formato ISO ou objeto Date
 * @returns {string} - Data formatada "Segunda, 02/08/2025"
 */
export function formatarDataCompleta(data) {
  if (!data) return ''
  
  try {
    const dataObj = typeof data === 'string' ? new Date(data + 'T00:00:00') : new Date(data)
    
    if (isNaN(dataObj.getTime())) {
      return formatarData(data)
    }
    
    return dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Erro ao formatar data completa:', error)
    return formatarData(data)
  }
}

/**
 * Verifica se uma data está no formato correto para comparação
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {boolean} - True se a data está no formato correto
 */
export function isDataValida(data) {
  if (!data) return false
  
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(data)) return false
  
  const dataObj = new Date(data + 'T00:00:00')
  return !isNaN(dataObj.getTime())
}