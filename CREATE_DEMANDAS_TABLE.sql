-- SQL para criar a tabela demandas no Supabase
-- Execute este código no SQL Editor do Supabase

-- 1. Criar a tabela demandas
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

-- 2. Criar índices para melhor performance
CREATE INDEX idx_demandas_funcionario ON demandas(funcionario_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_demandas_importancia ON demandas(importancia);
CREATE INDEX idx_demandas_prazo ON demandas(prazo);

-- 3. Criar política RLS para permitir acesso
CREATE POLICY "Permitir acesso total às demandas" ON demandas
  FOR ALL USING (true) WITH CHECK (true);

-- 4. A tabela está pronta para uso
-- Você pode inserir demandas através da interface web
-- Dados de exemplo serão mostrados automaticamente até que você crie demandas reais

-- 5. Verificar se a tabela foi criada corretamente
SELECT * FROM demandas ORDER BY importancia DESC, prazo ASC;