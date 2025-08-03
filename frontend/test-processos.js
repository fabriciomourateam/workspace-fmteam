// Script para testar a tabela processos no Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProcessos() {
  console.log('Testando conexão com a tabela processos...')
  
  try {
    // Testar se a tabela existe
    const { data, error } = await supabase
      .from('processos')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Erro ao acessar processos:', error)
      return
    }
    
    console.log('Tabela processos acessível:', data)
    
    // Testar inserção
    const { data: insertData, error: insertError } = await supabase
      .from('processos')
      .insert([{
        tarefa_id: 'test-' + Date.now(),
        titulo: 'Teste',
        descricao: 'Processo de teste',
        tempo_estimado: '30 min',
        frequencia: 'Teste',
        passos: [],
        observacoes: []
      }])
      .select()
    
    if (insertError) {
      console.error('Erro ao inserir processo:', insertError)
      return
    }
    
    console.log('Processo inserido com sucesso:', insertData)
    
    // Limpar teste
    if (insertData && insertData[0]) {
      await supabase
        .from('processos')
        .delete()
        .eq('id', insertData[0].id)
      console.log('Processo de teste removido')
    }
    
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

testProcessos()