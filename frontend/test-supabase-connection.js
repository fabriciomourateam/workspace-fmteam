// Teste de conectividade com Supabase
// Execute este arquivo para verificar se há problemas de conexão

import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://odwouhhxvlkpkjklwoxo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd291aGh4dmxrcGtqa2x3b3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mjc2ODEsImV4cCI6MjA2OTQwMzY4MX0.e7RR0PHzyWlrQ3Ci9V9ZCLrPKmtIO0PMef0ue3yBce8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabaseConnection() {
  console.log('🔍 Testando conectividade com Supabase...')
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('📡 Teste 1: Conectividade básica...')
    const { data, error } = await supabase.from('tarefas_a_fazer').select('count')
    
    if (error) {
      console.error('❌ Erro na conexão:', error)
      
      // Teste 2: Verificar se a tabela existe
      console.log('📋 Teste 2: Verificando se a tabela existe...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'tarefas_a_fazer')
      
      if (tablesError) {
        console.error('❌ Erro ao verificar tabelas:', tablesError)
      } else if (tables && tables.length > 0) {
        console.log('✅ Tabela tarefas_a_fazer existe')
        
        // Teste 3: Verificar estrutura da tabela
        console.log('🔍 Teste 3: Verificando estrutura da tabela...')
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', 'tarefas_a_fazer')
          .order('ordinal_position')
        
        if (columnsError) {
          console.error('❌ Erro ao verificar colunas:', columnsError)
        } else {
          console.log('📊 Colunas da tabela tarefas_a_fazer:')
          columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
          })
        }
        
        // Teste 4: Tentar inserir uma tarefa de teste
        console.log('🧪 Teste 4: Tentando inserir tarefa de teste...')
        const tarefaTeste = {
          titulo: 'Tarefa de Teste',
          descricao: 'Esta é uma tarefa de teste para verificar a funcionalidade',
          funcionario_responsavel_id: '1',
          importancia: 'media',
          concluida: false,
          prazo: '2024-12-31',
          telefone_whatsapp: '5511999999999',
          mensagem_whatsapp: 'Teste de mensagem',
          observacoes: 'Tarefa criada para teste do sistema'
        }
        
        const { data: insertData, error: insertError } = await supabase
          .from('tarefas_a_fazer')
          .insert([tarefaTeste])
          .select()
        
        if (insertError) {
          console.error('❌ Erro ao inserir tarefa de teste:', insertError)
        } else {
          console.log('✅ Tarefa de teste inserida com sucesso:', insertData[0])
          
          // Limpar tarefa de teste
          const { error: deleteError } = await supabase
            .from('tarefas_a_fazer')
            .delete()
            .eq('id', insertData[0].id)
          
          if (deleteError) {
            console.error('⚠️ Erro ao limpar tarefa de teste:', deleteError)
          } else {
            console.log('🧹 Tarefa de teste removida')
          }
        }
        
      } else {
        console.log('❌ Tabela tarefas_a_fazer NÃO existe')
        console.log('💡 Execute o SQL do arquivo CREATE_TAREFAS_TABLE.sql no Supabase')
      }
      
    } else {
      console.log('✅ Conexão com Supabase funcionando!')
      console.log('📊 Total de tarefas:', data)
    }
    
  } catch (error) {
    console.error('💥 Erro geral no teste:', error)
  }
}

// Executar teste
testSupabaseConnection()

export { testSupabaseConnection }

