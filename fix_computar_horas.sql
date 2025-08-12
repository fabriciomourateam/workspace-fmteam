-- SQL RÁPIDO para corrigir o problema de computar_horas
-- Execute no Supabase SQL Editor

-- 1. Verificar se a coluna existe
SELECT COUNT(*) as coluna_existe
FROM information_schema.columns 
WHERE table_name = 'tarefas' AND column_name = 'computar_horas';

-- 2. Se não existir, criar a coluna
ALTER TABLE tarefas 
ADD COLUMN IF NOT EXISTS computar_horas BOOLEAN DEFAULT true;

-- 3. Atualizar TODAS as tarefas para computar horas (exceto indisponibilidade)
UPDATE tarefas 
SET computar_horas = true 
WHERE categoria != 'indisponibilidade' OR categoria IS NULL;

-- 4. Definir que só indisponibilidade não computa
UPDATE tarefas 
SET computar_horas = false 
WHERE categoria = 'indisponibilidade';

-- 5. Verificar resultado
SELECT 
  categoria,
  computar_horas,
  COUNT(*) as quantidade
FROM tarefas 
GROUP BY categoria, computar_horas
ORDER BY categoria;