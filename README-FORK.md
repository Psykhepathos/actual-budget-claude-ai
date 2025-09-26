# 🤖 Actual Budget + Claude Code

Fork do [Actual Budget](https://github.com/actualbudget/actual) com integração de **Claude Code** para classificação automática de transações via **claude-code-proxy**.

> **⚡ Setup em 2 minutos** • **🔒 100% local** • **🎯 Classificação inteligente** • **🆓 Sem API keys**

## 🚀 Quick Start

### 1. Clone e Configure

```bash
# Clone este repositório
git clone https://github.com/Psykhepathos/actual-budget-claude-ai.git
cd actual-budget-claude-ai

# Instale dependências
yarn install

# Configure variáveis de ambiente
cp .env.addon.example .env.addon
```

### 2. Configure apenas o Actual

Edite `.env.addon` com suas configurações básicas:

```env
# Apenas configurações do Actual (sem API keys!)
ACTUAL_PASSWORD=sua_senha_aqui
ACTUAL_BUDGET_ID=seu_budget_id_aqui  # Você vai obter depois
```

> 💡 **Sem API Keys**: O claude-code-proxy usa sua sessão local do Claude Code CLI!

### 3. Inicie o Sistema

```bash
# Inicia Actual + Claude AI
yarn start:server-dev-ai
```

Abra http://localhost:5006 e configure sua conta.

### 4. Configure o Budget ID

1. **Crie/Abra seu orçamento** no Actual
2. **Vá em Configurações** → Mostrar avançadas
3. **Copie o Sync ID** (Budget ID)
4. **Cole no arquivo** `.env.addon`:
   ```env
   ACTUAL_BUDGET_ID=eb97472d-2bb9-4679-ac40-ba7c01e9d591
   ```

### 5. Reinicie e Teste

```bash
# Reinicia o AI addon
yarn ai:dev:restart

# Adicione algumas transações sem categoria
# Aguarde 5 minutos... 🎉 Classificação automática!
```

---

## 🎯 Como Funciona

### Classificação Automática

- **🔄 A cada 5 minutos** (desenvolvimento) o Claude AI analisa transações sem categoria
- **🧠 Aprende com seu histórico** de categorizações anteriores
- **🏷️ Adiciona tags** `#dev-ai-classified` nas transações processadas
- **🔒 Modo seguro** - Inicia em "dry run" (só simula, não altera)

### Modo Dry Run (Padrão)

```bash
# Ver o que o AI faria (sem alterar nada)
yarn ai:dev:logs
```

### Modo Produção

Para ativar classificação real:

1. Edite `.env.addon`
2. Remova `"dryRun"` do array `FEATURES`
3. Reinicie: `yarn ai:dev:restart`

---

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
yarn start:server-dev-ai    # Actual + AI
yarn start:server-dev       # Só Actual
yarn ai:dev:logs            # Ver logs do AI
yarn ai:dev:restart         # Reiniciar AI
yarn ai:dev:stop            # Parar AI
```

### Manutenção

```bash
yarn typecheck             # Verificar tipos
yarn lint:fix              # Corrigir código
yarn test                  # Executar testes
```

---

## 📁 Arquitetura

```
actual-fresh/
├── packages/              # Packages originais do Actual
├── claude-code-proxy/     # 🆕 Proxy Claude ↔ Ollama API
├── docker-compose.dev.yml # 🆕 Setup Docker com AI
├── .env.addon.example     # 🆕 Template de configuração
└── COMO-USAR.md          # 🆕 Instruções detalhadas
```

### Componentes Novos

1. **claude-code-proxy/** - Proxy que converte Claude AI em API compatível com Ollama
2. **docker-compose.dev.yml** - Configuração Docker para desenvolvimento
3. **Scripts AI** no package.json para controle do addon

---

## 🔧 Troubleshooting

### ❌ API Key não funciona

```bash
# Verificar se a key está correta
curl -H "Authorization: Bearer sk-ant-api-sua_key" \
     https://api.anthropic.com/v1/messages
```

### ❌ AI não classifica

```bash
# Verificar logs
yarn ai:dev:logs

# Verificar containers
docker ps

# Reiniciar tudo
yarn ai:dev:stop
yarn start:server-dev-ai
```

### ❌ Porta 11434 em uso

```bash
# Ver o que está usando
netstat -an | findstr 11434

# Matar processo se necessário
taskkill /F /PID [PID_NUMBER]
```

### ❌ Budget ID incorreto

1. Vá em Actual → Configurações → Avançadas
2. Copie o **Sync ID** completo
3. Cole exatamente no `.env.addon`

---

## 🎯 Para Produção

### Docker Compose Completo

```bash
# Arquivo: docker-compose.prod.yml (você pode criar)
docker-compose -f docker-compose.prod.yml up -d
```

### Configurações Recomendadas

```env
# Produção - intervalo maior (4 horas)
CLASSIFICATION_INTERVAL=14400000

# Sem dry run
FEATURES=[]

# Logs mínimos
LOG_LEVEL=warn
```

---

## 🤝 Contribuindo

1. **Fork** este repositório
2. **Crie branch** para sua feature
3. **Teste** com `yarn test` e `yarn typecheck`
4. **Envie** Pull Request

---

## 📚 Documentação Completa

- **[COMO-USAR.md](./COMO-USAR.md)** - Guia passo a passo detalhado
- **[claude-code-proxy/README.md](./claude-code-proxy/README.md)** - Documentação técnica do proxy
- **[CLAUDE.md](./CLAUDE.md)** - Referência para desenvolvimento

---

## 📝 Licença

MIT License - baseado no [Actual Budget](https://github.com/actualbudget/actual)

---

## 🎉 Próximos Passos

Depois de configurar:

1. **📊 Importe** seus dados bancários (CSV/OFX)
2. **🏷️ Categorize** algumas transações manualmente para treinar o AI
3. **⏰ Aguarde** a mágica acontecer a cada 5 minutos
4. **🔧 Ajuste** categorizações quando necessário
5. **📈 Monitore** através dos logs

---

**💫 Agora você tem um sistema de orçamento pessoal com IA!**

> Para suporte, veja os logs (`yarn ai:dev:logs`) ou crie uma issue neste repositório.
