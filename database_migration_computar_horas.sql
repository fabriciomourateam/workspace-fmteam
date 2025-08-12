-- Migração para adicionar campo computar_horas na tabela tarefas
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna computar_horas na tabela tarefas
ALTER TABLE tarefas 
ADD COLUMN IF NOT EXISTS computar_horas BOOLEAN DEFAULT true;

-- 2. Atualizar tarefas existentes para computar horas por padrão
UPDATE tarefas 
SET computar_horas = true 
WHERE computar_horas IS NULL;

-- 3. Criar tarefas especiais para indisponibilidade (se não existirem)
INSERT INTO tarefas (id, nome, categoria, tempo_estimado, descricao, prioridade, computar_horas)
VALUES 
  ('indisponivel', 'Indisponível', 'indisponibilidade', 30, 'Horário em que o funcionário não está disponível para trabalho', 'baixa', false),
  ('almoco', 'Almoço', 'indisponibilidade', 60, 'Horário de almoço', 'baixa', false),
  ('pausa', 'Pausa/Intervalo', 'indisponibilidade', 30, 'Pausa ou intervalo durante o expediente', 'baixa', false)
ON CONFLICT (id) DO UPDATE SET
  computar_horas = EXCLUDED.computar_horas,
  categoria = EXCLUDED.categoria,
  descricao = EXCLUDED.descricao;

-- 4. Verificar se as colunas foram criadas corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tarefas' 
  AND column_name = 'computar_horas';

-- 5. Verificar tarefas de indisponibilidade
SELECT id, nome, categoria, computar_horas 
FROM tarefas 
WHERE categoria = 'indisponibilidade';

COMMENT ON COLUMN tarefas.computar_horas IS 'Define se a tarefa deve ser computada nas horas de trabalho (true) ou não (false para pausas, almoço, etc.)';