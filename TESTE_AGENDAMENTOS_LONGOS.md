# 🧪 Como Testar Agendamentos Longos

## ✅ O que foi implementado:

### 1. **Banco de Dados** ✅
- ✅ Colunas `duracao` e `horarios_ocupados` adicionadas
- ✅ Migração executada no Supabase

### 2. **Formulário** ✅
- ✅ Campo de duração (30min, 1h, 1h30, 2h, 2h30, 3h)
- ✅ Validação de horários disponíveis
- ✅ Visual mostra "até que horas" vai o agendamento

### 3. **Serviços** ✅
- ✅ dataService.js atualizado para incluir novas colunas
- ✅ supabaseService.js já busca todas as colunas (*)

### 4. **Visualização** ✅
- ✅ Lógica para detectar agendamentos longos
- ✅ TarefaCard diferenciado para slots de continuação
- ✅ Bordas visuais conectando os slots

## 🧪 Como Testar:

### Passo 1: Criar Agendamento Longo
1. Vá para o Cronograma
2. Clique em um horário vazio (ex: 09:00)
3. No formulário:
   - Selecione **Duração: 1 hora**
   - Escolha funcionário e tarefa
   - Clique em "Criar Agendamentos"

### Passo 2: Verificar Visualização
O agendamento deve aparecer assim:
- **09:00**: Conteúdo completo + "(60min)" + "09:00-10:00"
- **09:30**: "..." (continuação) com borda conectada

### Passo 3: Debug (se não funcionar)
1. Abra o Console do navegador (F12)
2. Cole e execute o script de `frontend/debug-agendamentos.js`
3. Verifique se os dados estão corretos

## 🔍 Possíveis Problemas:

### Problema 1: Dados não chegam
**Sintoma**: Agendamento aparece normal (30min)
**Causa**: Colunas não foram criadas no Supabase
**Solução**: Re-executar o script SQL

### Problema 2: Visual não conecta
**Sintoma**: Dois agendamentos separados de 30min
**Causa**: `horarios_ocupados` não está sendo preenchido
**Solução**: Verificar se o formulário está enviando os dados corretos

### Problema 3: Erro ao salvar
**Sintoma**: Erro 400 no console
**Causa**: Supabase não reconhece as novas colunas
**Solução**: Verificar se a migração foi executada corretamente

## 📊 Estrutura de Dados Esperada:

```javascript
// Agendamento de 1 hora (09:00-10:00)
{
  id: "123",
  horario: "09:00",
  duracao: 60,
  horarios_ocupados: ["09:00", "09:30"],
  funcionario: "dayana",
  tarefa: "social_selling"
}
```

## 🎯 Resultado Esperado:

### Timeline View:
```
09:00 | Social Selling Insta (60min) | 09:00-10:00 | [✓] [×]
09:30 | ... (continuação)             |             |
```

### Grade View:
```
        | 09:00              | 09:30
Dayana  | Social Selling     | ...
        | (60min)            |
```

Se ainda não estiver funcionando, execute o debug e me envie os resultados!