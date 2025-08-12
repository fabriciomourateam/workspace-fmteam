-- Script para verificar se as tarefas estão com computar_horas correto
-- Execute no Supabase SQL Editor

-- 1. Verificar todas as tarefas e seus valores de computar_horas
SELECT 
  id, 
  nome, 
  categoria, 
  computar_horas,
  CASE 
    WHEN computar_horas IS NULL THEN 'NULL (será TRUE por padrão)'
    WHEN computar_horas = true THEN 'TRUE - Será computada'
    WHEN computar_horas = false THEN 'FALSE - NÃO será computada'
    ELSE 'OUTRO'
  END as status_explicacao
FROM tarefas 
ORDER BY 
  CASE WHEN computar_horas IS NULL THEN 1 
       WHEN computar_horas = false THEN 2 
       ELSE 3 END,
  categoria, nome;

-- 2. Contar tarefas por status
SELECT 
  CASE 
    WHEN computar_horas IS NULL THEN 'NULL (padrão TRUE)'
    WHEN computar_horas = true THEN 'TRUE'
    WHEN computar_horas = false THEN 'FALSE'
    ELSE 'OUTRO'
  END as status,
  COUNT(*) as quantidade,
  STRING_AGG(nome, ', ') as exemplos
FROM tarefas 
GROUP BY computar_horas
ORDER BY quantidade DESC;

-- 3. Verificar agendamentos recentes com suas tarefas
SELECT 
  a.id as agenda_id,
  f.nome as funcionario,
  t.nome as tarefa,
  t.computar_horas,
  a.data,
  a.horario,
  CASE 
    WHEN t.computar_horas = false THEN 'NÃO COMPUTAR'
    ELSE 'COMPUTAR'
  END as deve_computar
FROM agenda a
LEFT JOIN funcionarios f ON a.funcionario_id = f.id
LEFT JOIN tarefas t ON a.tarefa_id = t.id
WHERE a.data >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY a.data DESC, a.horario DESC
LIMIT 20;