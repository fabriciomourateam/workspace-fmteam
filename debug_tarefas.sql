-- SQL para verificar o estado atual das tarefas
-- Execute no Supabase SQL Editor para debug

-- 1. Verificar se a coluna computar_horas existe
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tarefas' 
  AND column_name = 'computar_horas';

-- 2. Verificar todas as tarefas e seus valores de computar_horas
SELECT 
  id, 
  nome, 
  categoria, 
  computar_horas,
  CASE 
    WHEN computar_horas IS NULL THEN 'NULL'
    WHEN computar_horas = true THEN 'TRUE'
    WHEN computar_horas = false THEN 'FALSE'
    ELSE 'OUTRO'
  END as status_computar
FROM tarefas 
ORDER BY categoria, nome;

-- 3. Contar tarefas por status de computar_horas
SELECT 
  CASE 
    WHEN computar_horas IS NULL THEN 'NULL'
    WHEN computar_horas = true THEN 'TRUE'
    WHEN computar_horas = false THEN 'FALSE'
    ELSE 'OUTRO'
  END as status_computar,
  COUNT(*) as quantidade
FROM tarefas 
GROUP BY computar_horas
ORDER BY quantidade DESC;

-- 4. Verificar agendamentos e suas tarefas
SELECT 
  a.id as agenda_id,
  a.funcionario_id,
  a.tarefa_id,
  t.nome as tarefa_nome,
  t.computar_horas,
  t.tempo_estimado
FROM agenda a
LEFT JOIN tarefas t ON a.tarefa_id = t.id
WHERE a.data >= CURRENT_DATE - INTERVAL '7 days'
LIMIT 10;