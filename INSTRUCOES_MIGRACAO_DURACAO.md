# 🔧 Migração: Suporte a Agendamentos de Duração Maior

## ⚠️ IMPORTANTE
Execute estes passos no Supabase para adicionar suporte a agendamentos longos (1h, 2h, etc.)

## 📋 Passos para Executar:

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Entre no seu projeto
- Clique em **SQL Editor** no menu lateral

### 2. Execute o Script SQL
Copie e cole o código abaixo no SQL Editor e clique em **RUN**:

```sql
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

-- Verificar se as colunas foram criadas corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'agenda' 
AND column_name IN ('duracao', 'horarios_ocupados');
```

### 3. Verificar o Resultado
Após executar, você deve ver uma tabela mostrando:
- `duracao` | `integer` | `30`
- `horarios_ocupados` | `ARRAY` | `NULL`

### 4. Testar a Funcionalidade
Após a migração:
1. Recarregue a aplicação
2. Vá para o Cronograma
3. Clique para adicionar um agendamento
4. Teste criar um agendamento de 1 hora

## 🔍 O que as Novas Colunas Fazem:

### `duracao` (INTEGER)
- Armazena a duração em minutos (30, 60, 90, 120, 150, 180)
- Padrão: 30 minutos (compatível com agendamentos existentes)

### `horarios_ocupados` (TEXT[])
- Array com todos os slots de 30min ocupados
- Exemplo: agendamento 09:00-10:00 = `['09:00', '09:30']`
- Exemplo: agendamento 14:00-14:30 = `['14:00']`

## ✅ Benefícios:
- ✅ **Retrocompatível**: Agendamentos existentes continuam funcionando
- ✅ **Eficiente**: Um registro para agendamentos longos (não duplica)
- ✅ **Visual**: Interface mostra agendamentos longos conectados
- ✅ **Funcional**: Seleção múltipla, edição e exclusão funcionam normalmente

## 🚨 Se Houver Problemas:
1. Verifique se você tem permissões de administrador no Supabase
2. Certifique-se de estar no projeto correto
3. Se der erro, me avise que ajudo a resolver

## 📝 Após a Migração:
- Agendamentos antigos: continuam como 30min
- Novos agendamentos: podem ser de 30min até 3h
- Interface: mostra duração e horário de início/fim