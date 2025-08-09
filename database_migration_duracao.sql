-- Migração para adicionar suporte a agendamentos de duração maior
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna duracao (em minutos, padrão 30)
ALTER TABLE agenda 
ADD COLUMN IF NOT EXISTS duracao INTEGER DEFAULT 30;

-- Adicionar coluna horarios_ocupados (array de strings com os horários ocupados)
ALTER TABLE agenda 
ADD COLUMN IF NOT EXISTS horarios_ocupados TEXT[] DEFAULT NULL;

-- Atualizar registros existentes para ter horarios_ocupados baseado no horario atual
UPDATE agenda 
SET horarios_ocupados = ARRAY[horario]
WHERE horarios_ocupados IS NULL;

-- Comentários sobre as colunas:
-- duracao: duração em minutos do agendamento (30, 60, 90, 120, 150, 180)
-- horarios_ocupados: array com todos os slots de 30min ocupados por este agendamento
--   Exemplo: agendamento de 1h às 09:00 = ['09:00', '09:30']
--   Exemplo: agendamento de 30min às 14:00 = ['14:00']

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'agenda' 
AND column_name IN ('duracao', 'horarios_ocupados');