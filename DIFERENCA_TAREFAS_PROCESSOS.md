# Diferença entre Tarefas à Fazer e Processos

## Visão Geral

O sistema possui **duas categorias distintas** de tarefas que servem a propósitos diferentes:

## 🎯 **Tarefas à Fazer (Tarefas Delegadas)**

### **O que são:**
- Tarefas **individuais** e **específicas** delegadas para funcionários
- Tarefas **personalizadas** criadas pelos gestores
- Tarefas com **prazo definido** e **responsável específico**

### **Exemplos:**
- Implementar nova funcionalidade de relatórios
- Corrigir bugs no sistema de login
- Atualizar documentação do projeto
- Criar apresentação para reunião de stakeholders
- Resolver problema específico de cliente

### **Características:**
- ✅ **Título personalizado** (não padronizado)
- ✅ **Descrição detalhada** específica
- ✅ **Funcionário responsável** definido
- ✅ **Prazo específico** (data exata)
- ✅ **Importância** (alta, média, baixa)
- ✅ **Telefone WhatsApp** para notificação
- ✅ **Mensagem personalizada** para envio
- ✅ **Observações** adicionais

### **Uso:**
- Gestores criam para **delegar responsabilidades**
- **Acompanhamento individual** de progresso
- **Notificações personalizadas** via WhatsApp
- **Gestão de projetos** e tarefas específicas

---

## ⚙️ **Processos (Tarefas do Sistema)**

### **O que são:**
- Tarefas **padrão** e **repetitivas** do sistema
- Tarefas **predefinidas** que fazem parte da rotina
- Tarefas **estruturadas** por categoria

### **Exemplos:**
- Check-ins diários
- Reunião diária da equipe
- Suporte ao cliente
- Social Selling no Instagram
- Engajamento no grupo
- Elaborar material para renovação

### **Características:**
- 🔄 **Nome padronizado** (sempre o mesmo)
- 🔄 **Categoria** predefinida (gestão, marketing, etc.)
- 🔄 **Tempo estimado** fixo
- 🔄 **Prioridade** padrão
- 🔄 **Descrição** genérica
- 🔄 **Sem responsável específico** (pode ser qualquer funcionário)

### **Uso:**
- **Agendamento de rotina** no cronograma
- **Distribuição automática** entre funcionários
- **Gestão de tempo** e produtividade
- **Relatórios** de atividades padrão

---

## 📊 **Comparação Visual**

| Aspecto | Tarefas à Fazer | Processos |
|---------|-----------------|-----------|
| **Tipo** | Individual e personalizada | Padrão e repetitiva |
| **Criação** | Manual pelo gestor | Predefinida no sistema |
| **Responsável** | Funcionário específico | Qualquer funcionário |
| **Prazo** | Data específica | Sem prazo fixo |
| **WhatsApp** | Notificação personalizada | Não aplicável |
| **Flexibilidade** | Alta (totalmente customizável) | Baixa (estruturada) |
| **Uso** | Delegação de responsabilidades | Agendamento de rotina |

---

## 🚀 **Como Usar Cada Sistema**

### **Para Tarefas à Fazer:**
1. Vá para a aba **"Tarefas à Fazer"**
2. Clique em **"Nova Tarefa Delegada"**
3. Preencha:
   - Título personalizado
   - Descrição detalhada
   - Funcionário responsável
   - Prazo específico
   - Importância
   - Telefone WhatsApp
   - Mensagem personalizada
4. Use **"Enviar Direto"** para notificar via webhook

### **Para Processos:**
1. Vá para a aba **"Agenda"** ou **"Cronograma"**
2. Use o sistema de **agendamento**
3. Selecione:
   - Processo padrão
   - Funcionário disponível
   - Data e horário
   - Duração

---

## 💡 **Dicas de Uso**

### **Use Tarefas à Fazer quando:**
- Precisa **delegar** uma responsabilidade específica
- Tem uma **tarefa única** com prazo definido
- Quer **notificar** um funcionário específico
- Precisa **acompanhar** progresso individual
- Tem uma **demanda personalizada** de cliente

### **Use Processos quando:**
- Precisa **agendar** atividades de rotina
- Quer **distribuir** trabalho entre funcionários
- Precisa **controlar** tempo de atividades padrão
- Quer **manter** estrutura organizacional
- Precisa **relatar** atividades do sistema

---

## 🔧 **Configuração**

### **Tarefas à Fazer:**
- Tabela: `tarefas_a_fazer`
- SQL: `CREATE_TAREFAS_TABLE.sql`
- Funcionalidades: CRUD completo + WhatsApp

### **Processos:**
- Tabela: `tarefas`
- Funcionalidades: Agendamento + Cronograma

---

## 📱 **Integração WhatsApp**

- **Tarefas à Fazer**: ✅ Suporte completo via webhook
- **Processos**: ❌ Não aplicável (são agendamentos)

---

## 🎯 **Resumo**

- **Tarefas à Fazer** = **Delegação individual** com notificações
- **Processos** = **Agendamento de rotina** para distribuição

Cada sistema tem seu propósito específico e não devem ser confundidos!

