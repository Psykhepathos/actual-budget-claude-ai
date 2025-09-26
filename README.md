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

### 🧠 Actual AI Addon
**Imagem Docker**: `actualbudget/actual-ai:latest`

**Configuração no docker-compose.dev.yml**:
```yaml
actual-ai-dev:
  image: actualbudget/actual-ai:latest
  environment:
    - ACTUAL_SERVER_URL=http://actual-server:5006
    - OLLAMA_BASE_URL=http://claude-code-proxy:11434  # Aponta para nosso proxy
    - ACTUAL_PASSWORD=${ACTUAL_PASSWORD}              # Do .env.addon
    - ACTUAL_BUDGET_ID=${ACTUAL_BUDGET_ID}           # Do .env.addon
    - LLM_PROVIDER=ollama                            # Usa "ollama" mas é nosso proxy
    - FEATURES=["dryRun"]                            # Modo seguro por padrão
```

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
```bash
# 1. Editar .env.addon
FEATURES=[]  # Remover "dryRun"

# 2. Reiniciar
yarn ai:dev:restart
```

### Intervalos Personalizados
```env
# No docker-compose.dev.yml, adicionar:
- CLASSIFICATION_INTERVAL=300000  # 5 minutos (padrão desenvolvimento)
# Para produção: 14400000 (4 horas)
```

### Providers Alternativos
Se quiser usar APIs externas ao invés do proxy local:

```env
# OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-proj-sua_chave

# Anthropic
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-sua_chave

# Ollama real (local)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434  # Ollama real
```

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
