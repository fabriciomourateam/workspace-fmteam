-- SQL para criar a tabela processos no Supabase
-- Execute este código no SQL Editor do Supabase

-- 1. Criar a tabela processos
CREATE TABLE processos (
  id SERIAL PRIMARY KEY,
  tarefa_id TEXT NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tempo_estimado TEXT,
  frequencia TEXT,
  passos JSONB NOT NULL DEFAULT '[]',
  observacoes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tarefa_id)
);

-- 2. Criar política RLS para permitir acesso
CREATE POLICY "Permitir acesso total aos processos" ON processos
  FOR ALL USING (true) WITH CHECK (true);

-- 3. Inserir dados iniciais
INSERT INTO processos (tarefa_id, titulo, descricao, tempo_estimado, frequencia, passos, observacoes) VALUES
('checkins', 'Check-ins com Alunos', 'Processo de acompanhamento individual dos alunos para verificar progresso e necessidades', '30 minutos', 'Diária', 
 '[
   {"numero": 1, "titulo": "Preparação", "descricao": "Revisar histórico do aluno e últimas interações", "tempo": "5 min", "recursos": ["CRM", "Histórico de conversas"]},
   {"numero": 2, "titulo": "Contato Inicial", "descricao": "Entrar em contato via WhatsApp ou plataforma preferida", "tempo": "2 min", "recursos": ["WhatsApp", "Telegram", "Discord"]},
   {"numero": 3, "titulo": "Verificação de Progresso", "descricao": "Perguntar sobre o andamento dos estudos e dificuldades", "tempo": "10 min", "recursos": ["Roteiro de perguntas", "Checklist de progresso"]},
   {"numero": 4, "titulo": "Suporte e Orientação", "descricao": "Oferecer ajuda específica e orientações personalizadas", "tempo": "10 min", "recursos": ["Material de apoio", "Links úteis"]},
   {"numero": 5, "titulo": "Registro", "descricao": "Documentar a conversa e próximos passos no sistema", "tempo": "3 min", "recursos": ["CRM", "Planilha de acompanhamento"]}
 ]',
 '["Sempre manter tom amigável e motivacional", "Personalizar a abordagem para cada aluno", "Registrar todas as interações para histórico"]'
);

-- Verificar se a tabela foi criada corretamente
SELECT * FROM processos;