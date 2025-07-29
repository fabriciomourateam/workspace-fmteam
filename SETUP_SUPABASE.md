# 🚀 Setup do Supabase para Workspace Visual

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com) (gratuita)
2. Node.js instalado
3. Projeto clonado

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `workspace-visual`
   - **Database Password**: (crie uma senha forte)
   - **Region**: escolha a mais próxima
7. Clique em "Create new project"
8. Aguarde alguns minutos para o projeto ser criado

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Clique em "Run" para executar
5. Verifique se as tabelas foram criadas em **Table Editor**

### 3. Obter as Credenciais

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

### 4. Configurar o Frontend

1. Na pasta `frontend`, copie o arquivo de exemplo:
   ```bash
   cp .env.example .env.local
   ```

2. Edite o arquivo `.env.local` e preencha:
   ```env
   REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
   ```

### 5. Instalar Dependências

```bash
cd frontend
npm install
```

### 6. Testar a Conexão

```bash
npm run dev
```

Acesse `http://localhost:5173` e:
- Vá na aba **Admin**
- Tente criar um novo funcionário
- Se funcionar, está tudo configurado! 🎉

## 🔒 Segurança

- A chave `anon public` é segura para usar no frontend
- Ela só permite operações básicas de CRUD
- Para mais segurança, configure RLS (Row Level Security) no Supabase

## 🆘 Problemas Comuns

### Erro: "Invalid API key"
- Verifique se copiou a chave correta
- Certifique-se que não há espaços extras

### Erro: "Failed to fetch"
- Verifique se a URL está correta
- Certifique-se que o projeto Supabase está ativo

### Dados não aparecem
- Verifique se executou o SQL schema
- Vá no Table Editor e veja se as tabelas existem

## 📊 Verificar se Funcionou

No painel Admin você deve conseguir:
- ✅ Ver lista de funcionários
- ✅ Criar novo funcionário
- ✅ Editar funcionário existente
- ✅ Deletar funcionário
- ✅ Mesmo para tarefas

## 🎯 Próximos Passos

Após configurar o Supabase:
1. Teste todas as funcionalidades
2. Faça deploy na Vercel
3. Configure as variáveis de ambiente na Vercel
4. Compartilhe com sua equipe!

---

**Precisa de ajuda?** Abra uma issue no repositório! 🚀