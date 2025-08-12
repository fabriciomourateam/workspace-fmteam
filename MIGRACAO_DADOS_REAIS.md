# 🔄 Migração para Dados Reais do Supabase

## 📋 **O que foi alterado**

O sistema agora usa **EXCLUSIVAMENTE** dados reais do Supabase, sem fallback para dados fictícios.

## ⚠️ **IMPORTANTE: Migrar Dados**

Como você já executou o SQL de `computar_horas`, agora precisa popular o banco com dados reais.

### **1. Executar SQLs de Migração**

Execute estes SQLs no **Supabase SQL Editor**:

```sql
-- 1. FUNCIONÁRIOS (substitua pelos seus funcionários reais)
INSERT INTO funcionarios (id, nome, horario_inicio, horario_fim, cor) VALUES
('guido', 'Guido', '09:00', '17:30', '#2563eb'),
('pedro', 'Pedro', '09:00', '17:30', '#10b981'),
('michelle', 'Michelle', '13:00', '17:30', '#f59e0b'),
('dayana', 'Dayana', '09:00', '17:30', '#ef4444'),
('jean', 'Jean', '08:00', '17:30', '#8b5cf6'),
('andreia', 'Andreia', '14:00', '17:30', '#06b6d4'),
('thais', 'Thais', 'flexible', 'flexible', '#ec4899')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  horario_inicio = EXCLUDED.horario_inicio,
  horario_fim = EXCLUDED.horario_fim,
  cor = EXCLUDED.cor;

-- 2. TAREFAS (suas tarefas reais + indisponibilidade)
INSERT INTO tarefas (id, nome, categoria, tempo_estimado, descricao, prioridade, computar_horas) VALUES
-- Tarefas de trabalho (computam horas)
('checkins', 'Check-ins', 'gestao', 30, 'Acompanhamento individual dos alunos', 'alta', true),
('reuniao_diaria', 'Reunião diária', 'gestao', 30, 'Alinhamento da equipe e planejamento do dia', 'alta', true),
('suporte', 'Suporte', 'atendimento', 30, 'Atendimento aos clientes e resolução de dúvidas', 'alta', true),
('social_selling', 'Social Selling Insta', 'marketing', 30, 'Atividades de marketing no Instagram', 'media', true),
('engajamento_grupo', 'Enviar mensagens de engajamento no grupo', 'engajamento', 30, 'Comunicação ativa com grupos de alunos', 'alta', true),
('separar_alunos', 'Separar alunos para engajamento', 'engajamento', 30, 'Segmentação de alunos para ações específicas', 'media', true),
('material_renovacao', 'Elaborar material para alunos de renovação', 'conteudo', 30, 'Criação de conteúdo para retenção de clientes', 'alta', true),
('montar_planos', 'Montar planos novos', 'produto', 30, 'Desenvolvimento de novos produtos e serviços', 'media', true),
('engajamento_alunos', 'Engajamento dos alunos', 'engajamento', 30, 'Ativação e motivação dos alunos', 'alta', true),
('conteudo_desengajados', 'Produção de conteúdo para alunos desengajados', 'conteudo', 30, 'Material específico para reativação de alunos', 'media', true),
('engajamento_time', 'Engajamento no grupo do Time', 'interno', 30, 'Comunicação e motivação da equipe interna', 'baixa', true),

-- Tarefas de indisponibilidade (NÃO computam horas)
('indisponivel', 'Indisponível', 'indisponibilidade', 30, 'Horário em que o funcionário não está disponível para trabalho', 'baixa', false),
('almoco', 'Almoço', 'indisponibilidade', 60, 'Horário de almoço', 'baixa', false),
('pausa', 'Pausa/Intervalo', 'indisponibilidade', 30, 'Pausa ou intervalo durante o expediente', 'baixa', false)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  categoria = EXCLUDED.categoria,
  tempo_estimado = EXCLUDED.tempo_estimado,
  descricao = EXCLUDED.descricao,
  prioridade = EXCLUDED.prioridade,
  computar_horas = EXCLUDED.computar_horas;

-- 3. VERIFICAR SE TUDO FOI CRIADO
SELECT 'Funcionários' as tabela, count(*) as total FROM funcionarios
UNION ALL
SELECT 'Tarefas', count(*) FROM tarefas
UNION ALL
SELECT 'Tarefas Indisponibilidade', count(*) FROM tarefas WHERE categoria = 'indisponibilidade'
UNION ALL
SELECT 'Agendamentos', count(*) FROM agenda;
```

### **2. Criar Agendamentos Reais**

Agora use a interface do sistema para criar agendamentos reais:

1. **Admin → Agenda → Novo Agendamento**
2. **Cronograma → Clique em horário vazio**
3. **Use agendamento recorrente** para criar vários de uma vez

### **3. Testar Indisponibilidade**

1. Crie agendamento com tarefa **"Almoço"** ou **"Indisponível"**
2. Verifique que **NÃO** aparece no tempo total dos relatórios
3. Aparece no cronograma com ícone ⏸️

## ✅ **Benefícios dos Dados Reais**

1. **📊 Relatórios Precisos** - Baseados em dados reais
2. **🔄 Sincronização** - Todos veem os mesmos dados
3. **💾 Persistência** - Dados não se perdem
4. **🚀 Performance** - Sem fallbacks desnecessários
5. **🎯 Produção Ready** - Sistema pronto para uso real

## 🚨 **Se der erro**

Se aparecer erro de "Supabase não configurado":

1. Verifique as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🎉 **Resultado Final**

- ✅ Sistema usa apenas dados reais do Supabase
- ✅ Sem dados fictícios ou fallbacks
- ✅ Computação de horas funcionando corretamente
- ✅ Relatórios baseados em trabalho real
- ✅ Pronto para uso em produção!

---
*Agora você tem um sistema 100% baseado em dados reais! 🚀*