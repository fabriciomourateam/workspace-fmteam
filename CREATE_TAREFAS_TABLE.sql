-- SQL para criar a tabela tarefas_a_fazer no Supabase
-- Execute este código no SQL Editor do Supabase

-- 1. Criar a tabela tarefas_a_fazer
CREATE TABLE tarefas_a_fazer (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  funcionario_responsavel_id TEXT NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  importancia TEXT NOT NULL CHECK (importancia IN ('alta', 'media', 'baixa')) DEFAULT 'media',
  concluida BOOLEAN DEFAULT FALSE,
  prazo DATE NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  telefone_whatsapp TEXT,
  mensagem_whatsapp TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX idx_tarefas_responsavel ON tarefas_a_fazer(funcionario_responsavel_id);
CREATE INDEX idx_tarefas_concluida ON tarefas_a_fazer(concluida);
CREATE INDEX idx_tarefas_importancia ON tarefas_a_fazer(importancia);
CREATE INDEX idx_tarefas_prazo ON tarefas_a_fazer(prazo);

-- 3. Criar política RLS para permitir acesso
CREATE POLICY "Permitir acesso total às tarefas" ON tarefas_a_fazer
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tarefas_updated_at 
    BEFORE UPDATE ON tarefas_a_fazer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Trigger para atualizar data_conclusao quando concluida = true
CREATE OR REPLACE FUNCTION update_data_conclusao()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.concluida = TRUE AND OLD.concluida = FALSE THEN
        NEW.data_conclusao = NOW();
    ELSIF NEW.concluida = FALSE THEN
        NEW.data_conclusao = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tarefas_data_conclusao 
    BEFORE UPDATE ON tarefas_a_fazer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_data_conclusao();

-- 6. A tabela está pronta para uso
-- Você pode inserir tarefas através da interface web

-- 7. Verificar se a tabela foi criada corretamente
SELECT * FROM tarefas_a_fazer ORDER BY importancia DESC, prazo ASC;
