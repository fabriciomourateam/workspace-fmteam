// Script de debug para verificar agendamentos longos
// Execute no console do navegador para verificar os dados

console.log('🔍 Debug: Verificando agendamentos longos...')

// Verificar se há agendamentos com duração > 30min
const agendamentos = window.__CRONOGRAMA_DEBUG_DATA__ || []

console.log('📊 Total de agendamentos:', agendamentos.length)

const agendamentosLongos = agendamentos.filter(item => 
  item.duracao && item.duracao > 30
)

console.log('⏰ Agendamentos longos encontrados:', agendamentosLongos.length)

agendamentosLongos.forEach(item => {
  console.log('📅 Agendamento longo:', {
    id: item.id,
    horario: item.horario,
    duracao: item.duracao,
    horarios_ocupados: item.horarios_ocupados,
    funcionario: item.funcionario,
    tarefa: item.tarefa
  })
})

// Verificar se horarios_ocupados está sendo preenchido corretamente
const comHorariosOcupados = agendamentos.filter(item => 
  item.horarios_ocupados && item.horarios_ocupados.length > 1
)

console.log('🎯 Agendamentos com múltiplos horários ocupados:', comHorariosOcupados.length)

comHorariosOcupados.forEach(item => {
  console.log('🔗 Horários ocupados:', {
    id: item.id,
    horario_inicio: item.horario,
    horarios_ocupados: item.horarios_ocupados,
    duracao: item.duracao
  })
})