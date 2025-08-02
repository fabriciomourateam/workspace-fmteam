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