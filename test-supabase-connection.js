#!/usr/bin/env node

/**
 * Script para testar conexão com Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = 'https://odwouhhxvlkpkjklwoxo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd291aGh4dmxrcGtqa2x3b3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mjc2ODEsImV4cCI6MjA2OTQwMzY4MX0.e7RR0PHzyWlrQ3Ci9V9ZCLrPKmtIO0PMef0ue3yBce8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...');
  console.log('📡 URL:', supabaseUrl);
  
  try {
    // Teste 1: Funcionários
    console.log('\n📋 Testando funcionários...');
    const { data: funcionarios, error: errorFunc } = await supabase
      .from('funcionarios')
      .select('*')
      .limit(5);
    
    if (errorFunc) {
      console.error('❌ Erro ao buscar funcionários:', errorFunc);
    } else {
      console.log('✅ Funcionários encontrados:', funcionarios?.length || 0);
      if (funcionarios && funcionarios.length > 0) {
        console.log('   Exemplo:', funcionarios[0]);
      }
    }

    // Teste 2: Tarefas
    console.log('\n📝 Testando tarefas...');
    const { data: tarefas, error: errorTarefas } = await supabase
      .from('tarefas')
      .select('*')
      .limit(5);
    
    if (errorTarefas) {
      console.error('❌ Erro ao buscar tarefas:', errorTarefas);
    } else {
      console.log('✅ Tarefas encontradas:', tarefas?.length || 0);
      if (tarefas && tarefas.length > 0) {
        console.log('   Exemplo:', tarefas[0]);
      }
    }

    // Teste 3: Agenda
    console.log('\n📅 Testando agenda...');
    const { data: agenda, error: errorAgenda } = await supabase
      .from('agenda')
      .select('*')
      .limit(5);
    
    if (errorAgenda) {
      console.error('❌ Erro ao buscar agenda:', errorAgenda);
    } else {
      console.log('✅ Agendamentos encontrados:', agenda?.length || 0);
      if (agenda && agenda.length > 0) {
        console.log('   Exemplo:', agenda[0]);
      }
    }

    // Teste 4: Health check geral
    console.log('\n🏥 Health check...');
    const { data: health, error: errorHealth } = await supabase
      .from('funcionarios')
      .select('count')
      .limit(1);
    
    if (errorHealth) {
      console.error('❌ Health check falhou:', errorHealth);
      return false;
    } else {
      console.log('✅ Supabase está respondendo!');
      return true;
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
    return false;
  }
}

// Executar teste
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Conexão com Supabase funcionando!');
    process.exit(0);
  } else {
    console.log('\n💔 Problemas na conexão com Supabase');
    process.exit(1);
  }
});