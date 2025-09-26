# 🤖 Actual Budget - Fork Pessoal com Testes de IA

Este é um **fork pessoal** do [Actual Budget](https://github.com/actualbudget/actual) para **testes locais** e experimentação com funcionalidades de IA.

> ⚠️ **Este é um repositório de testes pessoais** - Para usar o Actual Budget oficial, acesse: https://github.com/actualbudget/actual

## 📝 Sobre este Fork

Este fork inclui:
- ✅ **Actual Budget completo** (versão original)
- 🧪 **Experimentos com IA** para classificação de transações
- 🔧 **Ambiente de desenvolvimento** personalizado
- 🐳 **Setup Docker** para testes locais

## 🎯 Objetivo

Este fork experimenta a integração de **IA para classificação automática de transações** no Actual Budget. O sistema usa um microserviço proxy que conecta o [actual-ai addon](https://github.com/actualbudget/actual-ai) com o seu ambiente local, permitindo classificação inteligente sem necessidade de API keys externas.

## 🚀 Como Usar

### Pré-requisitos
- **Node.js 20+** e **Yarn 4.9.1+**
- **Docker** (obrigatório para funcionalidades de IA)
- **Actual AI Addon** disponível via Docker

### Setup Básico (Sem IA)
```bash
git clone https://github.com/Psykhepathos/actual-budget-claude-ai.git
cd actual-budget-claude-ai
yarn install
yarn start
```

### Setup Completo com IA (Recomendado)

#### 1. Configure Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.addon.example .env.addon

# Edite com suas configurações
# Windows: notepad .env.addon
# Mac/Linux: nano .env.addon
```

**Arquivo `.env.addon` - Configure apenas:**
```env
# Configurações do Actual Budget
ACTUAL_PASSWORD=sua_senha_aqui
ACTUAL_BUDGET_ID=  # Você vai obter depois

# Configuração do Claude Code Proxy (sem API key necessária!)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434

# Features (comece com dry run para testar)
FEATURES=["dryRun"]
```

#### 2. Instale Dependências e Inicie
```bash
# Instalar dependências (primeira vez)
yarn install

# Iniciar Actual + Claude Code Proxy + AI Addon
yarn start:server-dev-ai
```

#### 3. Configure o Actual Budget
1. **Acesse**: http://localhost:5006
2. **Crie uma conta** com a senha do `.env.addon`
3. **Configure categorias** (ex: Alimentação, Transporte, Lazer...)
4. **Vá em Configurações** → "Show advanced settings"
5. **Copie o Sync ID** (Budget ID)
6. **Cole no `.env.addon`**:
   ```env
   ACTUAL_BUDGET_ID=eb97472d-2bb9-4679-ac40-ba7c01e9d591
   ```

#### 4. Reinicie o AI e Teste
```bash
# Reiniciar AI com novas configurações
yarn ai:dev:restart

# Monitorar logs em tempo real
yarn ai:dev:logs
```

#### 5. Teste a Classificação
1. **Adicione transações** sem categoria
2. **Aguarde 5 minutos** (intervalo de desenvolvimento)
3. **Verifique** se apareceram tags `#dev-ai-classified`
4. **Sucesso!** 🎉

## 🔧 Microserviços e Componentes

### 🤖 Claude Code Proxy
Localizado em `./claude-code-proxy/`

**O que faz**: Converte sua sessão local em uma API compatível com Ollama para o actual-ai addon

**Porta**: 11434 (mesma do Ollama)

**Como funciona**:
- Usa o CLI local instalado
- Não precisa de API keys
- Simula API do Ollama para compatibilidade

### 🧠 Actual AI
**Repositório**: https://github.com/sakowicz/actual-ai
**Imagem Docker**: `sakowicz/actual-ai:latest`
**Documentação**: https://github.com/sakowicz/actual-ai#readme

**O que faz**: Ferramenta que classifica transações não categorizadas do Actual Budget usando LLMs

**Configuração no docker-compose.dev.yml**:
```yaml
actual-ai-dev:
  image: sakowicz/actual-ai:latest
  environment:
    - ACTUAL_SERVER_URL=http://actual-server:5006
    - ACTUAL_PASSWORD=${ACTUAL_PASSWORD}              # Do .env.addon
    - ACTUAL_BUDGET_ID=${ACTUAL_BUDGET_ID}           # Do .env.addon
    - LLM_PROVIDER=ollama                            # Usa "ollama" mas é nosso proxy
    - OLLAMA_BASE_URL=http://claude-code-proxy:11434 # Aponta para nosso proxy
    - CLASSIFICATION_SCHEDULE_CRON=0 */4 * * *       # A cada 4 horas
    - FEATURES='["dryRun", "classifyOnStartup", "syncAccountsBeforeClassify"]'
    - GUESSED_TAG=#actual-ai                         # Tag para transações classificadas
    - NOT_GUESSED_TAG=#actual-ai-miss                # Tag para não classificadas
```

**Variáveis de Ambiente Disponíveis**:
- `ACTUAL_SERVER_URL` - URL do servidor Actual Budget
- `ACTUAL_PASSWORD` - Senha do arquivo do Actual
- `ACTUAL_BUDGET_ID` - ID do orçamento (Sync ID das configurações avançadas)
- `ACTUAL_E2E_PASSWORD` - Senha de criptografia E2E (se habilitada)
- `LLM_PROVIDER` - Provedor (`openai`, `anthropic`, `google-generative-ai`, `ollama`, `groq`)
- `CLASSIFICATION_SCHEDULE_CRON` - Agendamento cron (ex: `0 */4 * * *` = a cada 4 horas)
- `FEATURES` - JSON array de features (ver opções abaixo)
- `VALUESERP_API_KEY` - Chave para busca web (se usar `webSearch`)
- `GUESSED_TAG` - Tag para transações classificadas (padrão: `#actual-ai`)
- `NOT_GUESSED_TAG` - Tag para não classificadas (padrão: `#actual-ai-miss`)

**Variáveis por Provider**:
```env
# OpenAI
OPENAI_API_KEY=sk-proj-sua_chave
OPENAI_MODEL=gpt-4o-mini                    # Padrão
OPENAI_BASE_URL=https://api.openai.com/v1   # Padrão

# Anthropic
ANTHROPIC_API_KEY=sk-ant-sua_chave
ANTHROPIC_MODEL=claude-3-5-sonnet-latest    # Padrão
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1  # Padrão

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave
GOOGLE_GENERATIVE_AI_MODEL=gemini-1.5-flash # Padrão
GOOGLE_GENERATIVE_AI_BASE_URL=https://generativelanguage.googleapis.com  # Padrão

# Ollama
OLLAMA_MODEL=phi3.5                         # Padrão
OLLAMA_BASE_URL=http://localhost:11434/api  # Padrão

# Groq
GROQ_API_KEY=sua_chave
GROQ_MODEL=mixtral-8x7b-32768               # Padrão
GROQ_BASE_URL=https://api.groq.com/openai/v1  # Padrão
```

**Features Disponíveis**:
```env
# Exemplo de configuração
FEATURES='["dryRun", "classifyOnStartup", "syncAccountsBeforeClassify", "freeWebSearch"]'
```

- `"dryRun"` - **Modo teste** (habilitado por padrão, não altera transações)
- `"webSearch"` - **Busca web** para comerciantes (requer `VALUESERP_API_KEY`)
- `"freeWebSearch"` - **Busca web gratuita** usando DuckDuckGo (sem API key)
- `"suggestNewCategories"` - **Sugerir novas categorias** para transações
- `"classifyOnStartup"` - **Classificar na inicialização** da aplicação
- `"syncAccountsBeforeClassify"` - **Sincronizar contas** antes de classificar
- `"rerunMissedTransactions"` - **Reprocessar** transações não classificadas anteriormente
- `"disableRateLimiter"` - **Desabilitar rate limiter** do LLM

### 🐳 Docker Services
```bash
# Ver status dos containers
docker ps

# Logs do AI addon
yarn ai:dev:logs

# Logs do proxy
docker-compose -f docker-compose.dev.yml logs claude-code-proxy

# Restart específico
yarn ai:dev:restart

# Parar tudo
yarn ai:dev:stop
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
yarn start:server-dev-ai    # Actual + Proxy + AI (recomendado)
yarn start:server-dev       # Apenas Actual + Proxy
yarn start                  # Apenas Actual (sem AI)
```

### AI Addon Control
```bash
yarn ai:dev                 # Iniciar AI addon
yarn ai:dev:logs            # Ver logs em tempo real
yarn ai:dev:restart         # Reiniciar AI addon
yarn ai:dev:stop            # Parar AI addon
```

### Debug e Manutenção
```bash
yarn typecheck             # Verificar tipos TypeScript
yarn lint:fix              # Corrigir código automaticamente
yarn test                  # Executar testes

# Health checks
curl http://localhost:11434/health          # Proxy
curl http://localhost:5006                  # Actual Budget
```

## ⚙️ Configurações Avançadas

### Modo Produção (Classificação Real)
```env
# Classificação ativa sem features extras
FEATURES=[]

# Classificação ativa + criar categorias automáticas
FEATURES=["autoCreateCategories"]

# Modo completo (classificação + regras + categorias)
FEATURES=["autoCreateCategories", "autoCreateRules", "smartMatching"]

# Modo conservador (preserva categorizações manuais)
FEATURES=["preserveExisting", "skipDuplicates"]
```

### Exemplos de Configuração por Cenário

#### 🧪 Primeiro teste (seguro)
```env
FEATURES='["dryRun", "classifyOnStartup"]'
CLASSIFICATION_SCHEDULE_CRON=0 */4 * * *  # A cada 4 horas
GUESSED_TAG=#test-ai-classified
```

#### 🚀 Uso diário (recomendado)
```env
FEATURES='["suggestNewCategories", "syncAccountsBeforeClassify", "freeWebSearch"]'
CLASSIFICATION_SCHEDULE_CRON=0 0 */6 * * *  # A cada 6 horas
GUESSED_TAG=#ai-classified
```

#### ⚡ Processamento ativo (desenvolvimento)
```env
FEATURES='["classifyOnStartup", "syncAccountsBeforeClassify", "rerunMissedTransactions"]'
CLASSIFICATION_SCHEDULE_CRON=0 */1 * * *  # A cada hora
GUESSED_TAG=#dev-ai-classified
```

#### 🔒 Modo conservador (só classificar existentes)
```env
FEATURES='["syncAccountsBeforeClassify"]'  # Sem dryRun = ativo, mas sem criar categorias
CLASSIFICATION_SCHEDULE_CRON=0 0 */12 * * *  # A cada 12 horas
GUESSED_TAG=#ai-classified
```

#### 🌐 Com busca web (melhor precisão)
```env
FEATURES='["freeWebSearch", "suggestNewCategories", "syncAccountsBeforeClassify"]'
CLASSIFICATION_SCHEDULE_CRON=0 0 */8 * * *  # A cada 8 horas
VALUESERP_API_KEY=sua_chave  # Se usar webSearch pago
```

### Intervalos Personalizados (Cron Schedule)
```env
# No docker-compose.dev.yml ou .env.addon:
CLASSIFICATION_SCHEDULE_CRON=0 */4 * * *    # A cada 4 horas (padrão)
CLASSIFICATION_SCHEDULE_CRON=*/30 * * * *    # A cada 30 minutos (desenvolvimento)
CLASSIFICATION_SCHEDULE_CRON=0 0 */12 * * *  # A cada 12 horas (produção)
CLASSIFICATION_SCHEDULE_CRON=0 0 0 * * *     # Uma vez por dia (às 00:00)
```

**Formato Cron**: `segundo minuto hora dia_do_mês mês dia_da_semana`
- `*/30 * * * *` = A cada 30 minutos
- `0 0 */6 * * *` = A cada 6 horas
- `0 0 0 * * 1` = Todo domingo às 00:00

### Providers Alternativos
Se quiser usar APIs externas ao invés do proxy local:

#### 🤖 OpenAI
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-sua_chave_aqui
```
**Como obter chave**:
1. Acesse https://platform.openai.com/api-keys
2. Faça login/cadastro
3. Clique "Create new secret key"
4. Copie a chave (começa com `sk-proj-`)

**Modelos suportados**: GPT-4, GPT-3.5-turbo
**Custo**: Pago por uso (~$0.03/1k tokens)

#### 🧠 Anthropic Claude
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-sua_chave_aqui
```
**Como obter chave**:
1. Acesse https://console.anthropic.com/
2. Faça login/cadastro
3. Vá em "API Keys"
4. Clique "Create Key"
5. Copie a chave (começa com `sk-ant-`)

**Modelos suportados**: Claude 3 (Sonnet, Haiku, Opus)
**Custo**: Pago por uso (~$0.015/1k tokens)

#### 🌟 Google Generative AI
```env
LLM_PROVIDER=google-generative-ai
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui
```
**Como obter chave**:
1. Acesse https://aistudio.google.com/app/apikey
2. Faça login com conta Google
3. Clique "Create API key"
4. Copie a chave

**Modelos suportados**: Gemini 1.5 Flash, Gemini Pro
**Custo**: Gratuito até certos limites, depois pago por uso

#### ⚡ Groq
```env
LLM_PROVIDER=groq
GROQ_API_KEY=sua_chave_aqui
```
**Como obter chave**:
1. Acesse https://console.groq.com/keys
2. Faça login/cadastro
3. Clique "Create API Key"
4. Copie a chave

**Modelos suportados**: Mixtral, Llama, Gemma
**Custo**: Gratuito com limites generosos

#### 🦙 Ollama Local
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```
**Como instalar**:
1. Baixe em https://ollama.ai/
2. Instale Ollama
3. Execute: `ollama pull llama2` (ou outro modelo)
4. Inicie: `ollama serve`

**Modelos suportados**: Llama2, Mistral, CodeLlama, etc.
**Custo**: Gratuito (roda local)

#### 🔗 Nossa Solução (Padrão)
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434  # Claude Code Proxy
```
**Vantagens**:
- ✅ **Gratuito** (usa sua sessão local)
- ✅ **Sem limites** de API
- ✅ **Privacidade** total
- ✅ **Setup zero** de chaves

#### 🔍 ValueSerp (Para Web Search)
```env
FEATURES='["webSearch", "suggestNewCategories"]'
VALUESERP_API_KEY=sua_chave_aqui
```
**Como obter chave**:
1. Acesse https://www.valueserp.com/
2. Crie conta gratuita
3. Vá no dashboard → API Keys
4. Copie sua chave

**O que faz**: Busca informações na web sobre comerciantes desconhecidos
**Custo**: Planos gratuitos disponíveis (100 buscas/mês)
**Alternativa**: Use `"freeWebSearch"` que é gratuito via DuckDuckGo

## 🚨 Troubleshooting

### ❌ Containers não sobem
```bash
# Verificar se Docker está rodando
docker --version

# Verificar portas em uso
netstat -an | findstr :5006    # Windows
netstat -an | findstr :11434   # Windows
lsof -i :5006                  # Mac/Linux
lsof -i :11434                 # Mac/Linux

# Matar processos se necessário
taskkill /F /PID [PID]         # Windows
kill -9 [PID]                 # Mac/Linux
```

### ❌ AI não classifica transações
```bash
# 1. Verificar logs
yarn ai:dev:logs

# 2. Verificar se proxy está funcionando
curl http://localhost:11434/health

# 3. Verificar configurações
cat .env.addon

# 4. Reiniciar tudo
yarn ai:dev:stop
yarn start:server-dev-ai
```

### ❌ Budget ID incorreto
1. No Actual: **Configurações** → **Show advanced settings**
2. Copie o **Sync ID** completo (formato: `uuid-completo`)
3. Cole exatamente no `.env.addon`
4. **Importante**: Sync ID ≠ Database ID

### ❌ Proxy não responde
```bash
# Verificar se está rodando
docker ps | grep claude-code-proxy

# Verificar logs do proxy
docker-compose -f docker-compose.dev.yml logs claude-code-proxy

# Rebuild se necessário
docker-compose -f docker-compose.dev.yml build claude-code-proxy
```

### ❌ Permissões Docker (Linux/Mac)
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão ou executar
newgrp docker
```

## 📚 Documentação

- **[COMO-USAR.md](./COMO-USAR.md)** - Guia completo de uso
- **[CLAUDE.md](./CLAUDE.md)** - Referência de desenvolvimento
- **[claude-code-proxy/](./claude-code-proxy/)** - Documentação técnica dos experimentos

## ⚠️ Aviso Importante

Este é um **fork experimental** apenas para:
- 🧪 Testes pessoais de funcionalidades
- 🔬 Experimentação com IA
- 📚 Aprendizado de desenvolvimento

**Para uso em produção**, use o projeto oficial: https://github.com/actualbudget/actual

## 🔗 Links Úteis

- **Projeto Original**: [Actual Budget](https://github.com/actualbudget/actual)
- **Documentação Oficial**: [actualbudget.org/docs](https://actualbudget.org/docs)
- **Comunidade**: [Discord](https://discord.gg/pRYNYr4W5A)

## 📄 Licença

MIT License - Mesmo do projeto original [Actual Budget](https://github.com/actualbudget/actual)
