-- Versão simplificada para criar apenas a tabela demandas
-- Execute este código no SQL Editor do Supabase

CREATE TABLE demandas (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  funcionario_id TEXT NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  tarefa_id TEXT REFERENCES tarefas(id) ON DELETE SET NULL,
  importancia TEXT NOT NULL CHECK (importancia IN ('alta', 'media', 'baixa')) DEFAULT 'media',
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida')) DEFAULT 'pendente',
  prazo DATE NOT NULL,
  observacoes TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política RLS para permitir acesso
CREATE POLICY "Permitir acesso total às demandas" ON demandas
  FOR ALL USING (true) WITH CHECK (true);

-- Verificar se foi criada
SELECT 'Tabela demandas criada com sucesso!' as resultado;