# 📋 Tarefas à Fazer - Instruções de Uso

## 🎯 Funcionalidades Implementadas

A página de **Tarefas à Fazer** foi criada com todas as funcionalidades solicitadas:

### ✅ Checkbox para Marcar como Concluído
- Cada tarefa possui um checkbox que pode ser marcado/desmarcado
- Quando marcado, a tarefa fica com visual riscado e opaco
- O status automaticamente muda para "Concluída"
- Data de conclusão é registrada automaticamente

### ⏰ Sistema de Prazos
- Campo obrigatório de prazo para cada tarefa
- Alertas visuais:
  - 🔴 **Atrasado**: Prazo vencido (vermelho)
  - 🟡 **Urgente**: Vence em 2 dias ou menos (amarelo)
  - 🔵 **Próximo**: Vence em 7 dias ou menos (azul)
  - ⚪ **Normal**: Mais de 7 dias restantes (cinza)

### 📱 Integração com WhatsApp
- Campo para telefone (apenas números, com código do país)
- Campo para mensagem personalizada
- Botão "Gerar Padrão" que cria mensagem automaticamente
- Botão "Enviar WhatsApp" que abre o WhatsApp Web/App
- Formato da mensagem padrão: "Olá! Você foi designado para: [TAREFA]. Prazo: [DATA]"

### 👥 Sistema de Delegação
- **Responsável**: Quem criou/gerencia a tarefa
- **Delegado**: Quem vai executar a tarefa
- Filtros por funcionário (responsável ou delegado)
- Visualização clara de quem é responsável por cada tarefa

## 🚀 Como Usar

### 1. Criar Nova Tarefa
1. Clique em "Nova Tarefa"
2. Preencha:
   - **Título**: Nome da tarefa
   - **Descrição**: Detalhes do que precisa ser feito
   - **Responsável**: Quem criou a tarefa
   - **Delegado**: Quem vai executar (opcional)
   - **Importância**: Alta, Média ou Baixa
   - **Prazo**: Data limite obrigatória
   - **Telefone WhatsApp**: Para enviar mensagem
   - **Mensagem WhatsApp**: Personalizada ou use "Gerar Padrão"

### 2. Gerenciar Tarefas
- **Marcar como concluída**: Clique no checkbox
- **Editar**: Clique no ícone de lápis
- **Ver detalhes**: Clique no ícone de olho
- **Enviar WhatsApp**: Clique no ícone de mensagem
- **Excluir**: Clique no ícone de lixeira

### 3. Filtrar e Organizar
- **Por Importância**: Alta, Média, Baixa ou Todas
- **Por Status**: Pendente, Em Andamento, Concluída ou Todos
- **Por Funcionário**: Filtra por responsável ou delegado
- **Ordenação**: Automaticamente por urgência (prazos + importância)

### 4. Estatísticas
- **Total**: Número total de tarefas
- **Pendentes**: Tarefas não iniciadas
- **Em Andamento**: Tarefas sendo executadas
- **Concluídas**: Tarefas finalizadas
- **Atrasadas**: Tarefas com prazo vencido

## 🗄️ Configuração do Banco de Dados

### 1. Criar Tabela no Supabase
Execute o SQL do arquivo `CREATE_TAREFAS_TABLE.sql` no painel do Supabase:

```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: CREATE_TAREFAS_TABLE.sql
```

### 2. Estrutura da Tabela
```sql
tarefas_a_fazer (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  funcionario_responsavel_id TEXT NOT NULL,
  funcionario_delegado_id TEXT,
  importancia TEXT NOT NULL,
  status TEXT NOT NULL,
  concluida BOOLEAN DEFAULT FALSE,
  prazo DATE NOT NULL,
  data_conclusao TIMESTAMP,
  telefone_whatsapp TEXT,
  mensagem_whatsapp TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## 🎨 Interface Visual

### Cards de Tarefas
- **Verde**: Tarefa concluída (riscada e opaca)
- **Vermelho**: Tarefa atrasada
- **Amarelo**: Tarefa urgente (vence em 2 dias)
- **Azul**: Tarefa normal

### Ícones e Badges
- 🎯 **Target**: Ícone principal da página
- ✅ **Checkbox**: Marcar como concluída
- 👁️ **Eye**: Ver detalhes
- ✏️ **Edit**: Editar tarefa
- 💬 **Message**: Enviar WhatsApp
- 🗑️ **Trash**: Excluir tarefa
- ⚠️ **Alert**: Importância alta
- ⏰ **Clock**: Status pendente
- ⚡ **Zap**: Status em andamento
- ✅ **CheckCircle**: Status concluída

## 📱 Funcionalidade WhatsApp

### Como Funciona
1. Clique no ícone de mensagem na tarefa
2. Modal abre com:
   - Título da tarefa
   - Campo de telefone (editar se necessário)
   - Campo de mensagem (editar se necessário)
3. Clique em "Enviar WhatsApp"
4. WhatsApp Web/App abre com a mensagem pré-preenchida

### Formato da Mensagem
```
Olá! Você foi designado para: [TÍTULO DA TAREFA]. Prazo: [DATA FORMATADA]
```

### Exemplo
```
Olá! Você foi designado para: Implementar nova funcionalidade de relatórios. Prazo: 15/01/2024
```

## 🔧 Personalização

### Mensagem Personalizada
- Você pode editar a mensagem antes de enviar
- Use variáveis como {nome}, {prazo}, {tarefa} se desejar
- Deixe em branco para usar a mensagem padrão

### Telefone
- Formato: 5511999999999 (código do país + DDD + número)
- Apenas números, sem espaços ou caracteres especiais
- O sistema adiciona automaticamente o código do país se necessário

## 🚨 Alertas e Notificações

### Prazos
- **Atrasado**: Visual vermelho e contador de dias atrasado
- **Urgente**: Visual amarelo e contador de dias restantes
- **Próximo**: Visual azul e contador de dias restantes

### Validações
- Título obrigatório
- Descrição obrigatória
- Responsável obrigatório
- Prazo obrigatório
- Telefone válido para WhatsApp

## 📊 Relatórios e Estatísticas

### Dashboard
- Contadores em tempo real
- Gráficos de progresso
- Filtros dinâmicos
- Exportação de dados (futuro)

### Métricas
- Taxa de conclusão
- Tempo médio de execução
- Tarefas atrasadas
- Performance por funcionário

## 🔄 Fluxo de Trabalho

### 1. Criação
1. Criar tarefa com responsável e delegado
2. Definir prazo e importância
3. Configurar WhatsApp se necessário

### 2. Delegação
1. Enviar mensagem via WhatsApp
2. Acompanhar status da tarefa
3. Atualizar conforme necessário

### 3. Execução
1. Delegado recebe mensagem
2. Inicia trabalho (muda status para "Em Andamento")
3. Finaliza tarefa (marca como concluída)

### 4. Acompanhamento
1. Responsável monitora progresso
2. Recebe notificações de atrasos
3. Ajusta prazos se necessário

## 🎯 Próximas Funcionalidades

### Planejadas
- [ ] Notificações push
- [ ] Lembretes automáticos
- [ ] Integração com calendário
- [ ] Relatórios avançados
- [ ] Templates de tarefas
- [ ] Anexos e arquivos
- [ ] Comentários e feedback
- [ ] Histórico de alterações

### Melhorias
- [ ] Drag & drop para reordenar
- [ ] Filtros avançados
- [ ] Busca por texto
- [ ] Exportação para Excel/PDF
- [ ] Integração com outros sistemas

---

## ✅ Checklist de Implementação

- [x] Tabela SQL criada
- [x] Componente principal implementado
- [x] Formulário de criação/edição
- [x] Checkbox para marcar como concluído
- [x] Sistema de prazos com alertas
- [x] Integração WhatsApp
- [x] Sistema de delegação
- [x] Filtros e ordenação
- [x] Estatísticas em tempo real
- [x] Interface responsiva
- [x] Dados de exemplo
- [x] Tratamento de erros
- [x] Loading states
- [x] Validações
- [x] Documentação

A funcionalidade está **100% implementada** e pronta para uso! 🎉

