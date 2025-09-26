# Claude Code Proxy

Um proxy compatível com Ollama que utiliza Claude Code como backend para classificação de transações no Actual Budget.

## Visão Geral

Este microserviço atua como um proxy entre o actual-ai addon e o Claude Code, mantendo sessões persistentes do Claude Code CLI e expondo uma API compatível com Ollama.

### Arquitetura

```
actual-ai addon → claude-code-proxy:11434 → claude-code terminal → response
```

## Funcionalidades

- ✅ API compatível com Ollama (`/api/generate`, `/api/tags`, etc.)
- ✅ Sessões persistentes do Claude Code
- ✅ Streaming de responses simulado (formato NDJSON)
- ✅ Session management com timeout automático
- ✅ Health checks e monitoramento
- ✅ Docker support

## Instalação e Desenvolvimento

### Pré-requisitos

- Node.js 20+
- Claude Code CLI instalado globalmente
- API Key do Anthropic configurada

### Setup Local

```bash
cd claude-code-proxy

# Instalar dependências
npm install

# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build
npm start
```

### Docker

```bash
# Build da imagem
docker build -t claude-code-proxy .

# Executar container
docker run -p 11434:11434 \
  -e ANTHROPIC_API_KEY=your_key_here \
  claude-code-proxy
```

## Integração com Actual Budget

### 1. Docker Compose

O arquivo `docker-compose.dev.yml` já está configurado para:

- Executar o proxy na porta 11434 (mesma do Ollama)
- Conectar o actual-ai addon ao proxy via `OLLAMA_BASE_URL`
- Compartilhar workspace para contexto do Claude Code

### 2. Configuração de Ambiente

```bash
# No arquivo .env.addon do projeto principal
ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui
ACTUAL_PASSWORD=sua_senha
ACTUAL_BUDGET_ID=seu_budget_id

# O addon continua usando LLM_PROVIDER=ollama
# mas aponta para nosso proxy via OLLAMA_BASE_URL
```

### 3. Execução

```bash
# No diretório raiz do Actual
yarn start:server-dev-ai

# Ou usando docker-compose diretamente
docker-compose -f docker-compose.dev.yml up
```

## API Endpoints

### Core Endpoints

- `POST /api/generate` - Gerar completions de texto
- `GET /api/tags` - Listar modelos disponíveis
- `GET /api/version` - Informações da versão
- `POST /api/pull` - Download de modelos (mock)

### Utilitários

- `GET /health` - Health check do serviço
- `GET /` - Informações do serviço e endpoints

### Exemplo de Uso

```bash
# Testar geração de texto
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-code:latest",
    "prompt": "Classifique esta transação: Mercado da esquina -25.50",
    "stream": false
  }'

# Verificar modelos disponíveis
curl http://localhost:11434/api/tags

# Health check
curl http://localhost:11434/health
```

## Session Management

- **Sessões persistentes**: Mantém contexto entre requests
- **Timeout automático**: 30 minutos de inatividade
- **Cleanup automático**: Limpeza de sessões expiradas a cada 5 minutos
- **Recovery**: Recriar sessões em caso de falha

## Logs e Monitoramento

```bash
# Ver logs do container
docker-compose logs -f claude-code-proxy

# Health check
curl http://localhost:11434/health
```

## Desenvolvimento

### Estrutura do Projeto

```
claude-code-proxy/
├── src/
│   ├── index.ts           # Servidor Express principal
│   ├── session-manager.ts # Gerenciamento de sessões Claude Code
│   ├── api-handlers.ts    # Handlers dos endpoints da API
│   └── types.ts          # Definições de tipos TypeScript
├── Dockerfile
├── package.json
└── README.md
```

### Scripts Disponíveis

- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build TypeScript para JavaScript
- `npm start` - Executar versão buildada
- `npm test` - Executar testes

## Troubleshooting

### Claude Code não encontrado

```bash
# Instalar Claude Code CLI
npm install -g @anthropics/claude-code

# Verificar instalação
claude-code --version
```

### Erro de API Key

```bash
# Configurar variável de ambiente
export ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui

# Ou no Docker
docker run -e ANTHROPIC_API_KEY=sua_chave claude-code-proxy
```

### Session timeout

- Sessions expiram após 30 minutos de inatividade
- São recriadas automaticamente quando necessário
- Logs mostram criação/limpeza de sessões

### Porta em uso

```bash
# Verificar o que está usando a porta 11434
lsof -i :11434

# Usar porta diferente
PORT=11435 npm start
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

MIT
