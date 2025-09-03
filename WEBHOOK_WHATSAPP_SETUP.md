# Configuração do Webhook WhatsApp - n8n + Evolution API

## Visão Geral

Este sistema permite o envio direto de mensagens WhatsApp através de um webhook que se integra com o n8n e Evolution API, eliminando a necessidade de abrir o WhatsApp Web manualmente.

## Arquitetura

```
Frontend → Webhook → n8n → Evolution API → WhatsApp
```

## 1. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na pasta `frontend/` com:

```bash
# URL do webhook do n8n
VITE_N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/whatsapp
```

## 2. Configuração no n8n

### 2.1 Criar Webhook

1. No n8n, crie um novo workflow
2. Adicione um nó **Webhook**
3. Configure:
   - **HTTP Method**: POST
   - **Path**: `/webhook/whatsapp`
   - **Response Mode**: Respond to Webhook
   - **Response Code**: 200

### 2.2 Estrutura dos Dados Recebidos

O webhook receberá os seguintes dados:

```json
{
  "tarefa": {
    "id": "123",
    "titulo": "Implementar nova funcionalidade",
    "descricao": "Criar sistema de relatórios",
    "prazo": "2024-01-15",
    "importancia": "alta",
    "funcionario_responsavel_id": "1"
  },
  "funcionario": {
    "id": "1",
    "nome": "João Silva",
    "email": "joao@empresa.com"
  },
  "mensagem": "Olá! Você foi designado para: Implementar nova funcionalidade. Prazo: 15/01/2024",
  "telefone": "5511999999999",
  "timestamp": "2024-01-10T10:00:00.000Z"
}
```

### 2.3 Configuração do Evolution API

Após o nó Webhook, adicione um nó **HTTP Request**:

```json
{
  "method": "POST",
  "url": "https://sua-evolution-api.com/message/sendText/INSTANCE_NAME",
  "headers": {
    "Content-Type": "application/json",
    "apikey": "SUA_API_KEY_EVOLUTION"
  },
  "body": {
    "number": "{{ $json.telefone }}",
    "text": "{{ $json.mensagem }}"
  }
}
```

### 2.4 Workflow Completo no n8n

```
Webhook → HTTP Request (Evolution API) → Success/Error Handling
```

## 3. Configuração da Evolution API

### 3.1 Instalação

```bash
# Clone o repositório
git clone https://github.com/davidsongomes/evolution-api.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 3.2 Configuração do .env

```bash
# Configurações básicas
SERVER_URL=http://localhost:8080
CORS_ORIGIN=*
LOG_LEVEL=ERROR

# Configurações do WhatsApp
WHATSAPP_DEFAULT_ANSWER=Olá! Como posso ajudar?
WHATSAPP_GROUP_LIMIT=256

# Configurações de segurança
API_KEY=sua_api_key_aqui
```

### 3.3 Iniciar a API

```bash
npm run start
```

## 4. Testando o Sistema

### 4.1 Teste Manual

1. Crie uma tarefa com telefone WhatsApp
2. Clique no botão de mensagem
3. Clique em "Enviar Direto"
4. Verifique os logs do n8n e Evolution API

### 4.2 Logs de Debug

No frontend, abra o console do navegador para ver:
- Dados sendo enviados para o webhook
- Status da resposta
- Erros de conexão

## 5. Tratamento de Erros

### 5.1 Erros Comuns

- **Telefone inválido**: Verificar formato (5511999999999)
- **API não responde**: Verificar URL e status do n8n
- **Evolution API offline**: Verificar se a API está rodando
- **Token expirado**: Renovar token do WhatsApp

### 5.2 Fallback

Se o webhook falhar, o sistema ainda oferece a opção de abrir o WhatsApp Web manualmente.

## 6. Segurança

### 6.1 Recomendações

- Use HTTPS para o webhook
- Implemente autenticação no n8n
- Limite o acesso por IP
- Monitore o uso da API

### 6.2 Rate Limiting

Configure limites de envio para evitar spam:
- Máximo de mensagens por minuto
- Máximo de mensagens por usuário
- Blacklist de números

## 7. Monitoramento

### 7.1 Métricas Importantes

- Taxa de sucesso do envio
- Tempo de resposta
- Erros por tipo
- Uso da API

### 7.2 Alertas

Configure alertas para:
- API offline
- Taxa de erro alta
- Limite de uso atingido

## 8. Exemplo de Workflow n8n

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook/whatsapp",
        "responseMode": "responseNode"
      },
      "id": "webhook",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://sua-evolution-api.com/message/sendText/INSTANCE_NAME",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "apikey",
              "value": "{{ $env.EVOLUTION_API_KEY }}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "number",
              "value": "{{ $json.telefone }}"
            },
            {
              "name": "text",
              "value": "{{ $json.mensagem }}"
            }
          ]
        }
      },
      "id": "evolution-api",
      "name": "Evolution API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [460, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Evolution API",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 9. Suporte

Para dúvidas ou problemas:
1. Verifique os logs do n8n
2. Teste a Evolution API diretamente
3. Verifique a conectividade entre os serviços
4. Consulte a documentação oficial da Evolution API

## 10. Próximos Passos

- Implementar confirmação de entrega
- Adicionar histórico de mensagens
- Implementar templates de mensagem
- Adicionar suporte a mídia (imagens, documentos)

