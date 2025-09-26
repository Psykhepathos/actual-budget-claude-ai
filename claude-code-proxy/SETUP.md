# Setup do Claude Code Proxy

## Pré-requisitos

### 1. Instalar Claude Code CLI

```bash
npm install -g @anthropics/claude-code
```

### 2. Configurar API Key do Anthropic

```bash
# Windows (PowerShell)
$env:ANTHROPIC_API_KEY="sk-ant-sua_chave_aqui"

# Linux/Mac
export ANTHROPIC_API_KEY="sk-ant-sua_chave_aqui"

# Ou no .env.addon do projeto principal
echo "ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui" >> .env.addon
```

## Instalação

### Método 1: Desenvolvimento Local

```bash
cd claude-code-proxy

# Instalar dependências
npm install

# Build
npm run build

# Executar em desenvolvimento (com hot reload)
npm run dev

# Executar em produção
npm start
```

### Método 2: Docker

```bash
# Build da imagem
docker build -t claude-code-proxy .

# Executar container
docker run -d \
  -p 11434:11434 \
  -e ANTHROPIC_API_KEY=sua_chave_aqui \
  --name claude-proxy \
  claude-code-proxy
```

### Método 3: Integração com Actual Budget

```bash
# No diretório raiz do Actual
cd actual-fresh

# Certificar que o arquivo docker-compose.dev.yml existe
# Configurar .env.addon com ANTHROPIC_API_KEY

# Executar tudo junto (Actual + AI + Proxy)
yarn start:server-dev-ai
```

## Verificação da Instalação

### Teste Básico

```bash
# Health check
curl http://localhost:11434/health

# Listar "modelos"
curl http://localhost:11434/api/tags

# Teste de geração
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-code:latest",
    "prompt": "Classifique esta transação: Mercado Central -42.50",
    "stream": false
  }'
```

### Teste com Mock (Desenvolvimento)

```bash
cd claude-code-proxy

# Usar mock ao invés do Claude Code real
CLAUDE_CODE_COMMAND="node mock-claude.js" npm run dev

# Em outro terminal, executar teste
node test-with-mock.js
```

## Configuração de Ambiente

### Variáveis de Ambiente

| Variável              | Descrição                              | Padrão          |
| --------------------- | -------------------------------------- | --------------- |
| `ANTHROPIC_API_KEY`   | API Key do Anthropic                   | **Obrigatório** |
| `PORT`                | Porta do servidor                      | `11434`         |
| `CLAUDE_CODE_COMMAND` | Comando personalizado para Claude Code | `claude-code`   |
| `NODE_ENV`            | Ambiente (development/production)      | `development`   |

### Exemplo de .env

```env
ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui
PORT=11434
NODE_ENV=development
```

## Integração com Actual Budget

### 1. Configurar .env.addon

```env
# Configurações do Actual
ACTUAL_PASSWORD=sua_senha
ACTUAL_BUDGET_ID=seu_budget_id

# API Key do Anthropic (para o proxy)
ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui

# O addon usa LLM_PROVIDER=ollama mas aponta para nosso proxy
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://claude-code-proxy:11434
```

### 2. Modificar docker-compose.dev.yml (se necessário)

O arquivo `docker-compose.dev.yml` já está configurado para usar o proxy.

### 3. Executar

```bash
# Opção 1: Usar script do Actual que já inclui o proxy
yarn start:server-dev-ai

# Opção 2: Docker Compose manual
docker-compose -f docker-compose.dev.yml up -d

# Verificar logs
docker-compose -f docker-compose.dev.yml logs -f claude-code-proxy
```

## Troubleshooting

### Claude Code não encontrado

```bash
# Verificar se está instalado
claude-code --version

# Se não estiver, instalar
npm install -g @anthropics/claude-code

# Verificar PATH
which claude-code  # Linux/Mac
where claude-code  # Windows
```

### Erro de API Key

```bash
# Verificar se está configurada
echo $ANTHROPIC_API_KEY  # Linux/Mac
echo $env:ANTHROPIC_API_KEY  # Windows PowerShell

# Testar Claude Code manualmente
claude-code
```

### Porta em uso

```bash
# Verificar o que está usando a porta
netstat -ano | findstr :11434  # Windows
lsof -i :11434  # Linux/Mac

# Usar porta diferente
PORT=11435 npm start
```

### Logs e Debug

```bash
# Ver logs do proxy
docker-compose logs -f claude-code-proxy

# Debug modo desenvolvimento
DEBUG=* npm run dev

# Testar endpoints manualmente
curl -v http://localhost:11434/health
```

### Session Management

- Sessions expiram após 30 minutos de inatividade
- São recriadas automaticamente quando necessário
- Logs mostram criação e limpeza de sessões
- Para debug, verifique logs `[Session sessionId]`

## Monitoramento

### Health Checks

```bash
# Status do serviço
curl http://localhost:11434/health

# Informações do serviço
curl http://localhost:11434/

# Logs em tempo real
docker-compose logs -f claude-code-proxy
```

### Métricas

- Sessões ativas são listadas nos logs
- Tempo de resposta é logado para cada request
- Cleanup automático de sessões é reportado

## Desenvolvimento

### Estrutura do Projeto

```
claude-code-proxy/
├── src/
│   ├── index.ts           # Servidor principal
│   ├── session-manager.ts # Gerenciamento de sessões Claude Code
│   ├── api-handlers.ts    # Handlers dos endpoints API
│   └── types.ts          # Definições TypeScript
├── Dockerfile
├── docker-compose.dev.yml
└── README.md
```

### Scripts NPM

```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build TypeScript
npm start        # Produção
npm test         # Testes (quando implementados)
```

### Mock para Desenvolvimento

Use `CLAUDE_CODE_COMMAND="node mock-claude.js"` para testar sem gastar créditos da API Anthropic.
