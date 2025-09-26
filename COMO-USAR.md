# 🚀 Como Usar o Actual Budget com Claude AI

Este projeto integra **Claude Code** ao Actual Budget para classificação automática e inteligente de transações financeiras através do **claude-code-proxy**.

## 📋 Pré-requisitos

- **Node.js 20+** e **Yarn 4.9.1+**
- **Docker** (para o ambiente AI)
- **Claude Code CLI** instalado (o proxy usa sua sessão local)

## ⚡ Setup Inicial (2 minutos!)

### 1. Configure Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.addon.example .env.addon

# Edite apenas as configurações do Actual
# Windows: notepad .env.addon
# Mac/Linux: nano .env.addon
```

**Preencha apenas isto (sem API keys!):**
```env
ACTUAL_PASSWORD=sua_senha_para_o_actual
```

### 2. Primeira Execução

```bash
# Instalar dependências (primeira vez)
yarn install

# Iniciar Actual + Claude AI
yarn start:server-dev-ai
```

**Aguarde** os containers iniciarem (1-2 minutos na primeira vez).

## 🎯 Comandos Principais

### Desenvolvimento (Use estes!)

```bash
# Iniciar tudo junto (servidor + AI)
yarn start:server-dev-ai

# Ver logs do AI em tempo real (em outro terminal)
yarn ai:dev:logs

# Parar addon AI
yarn ai:dev:stop
```

### Produção

```bash
# Iniciar apenas servidor Actual
yarn start:server-dev

# Docker Compose completo (servidor + AI)
docker-compose -f docker-compose.addon.yml --env-file .env.addon up -d
```

## 📊 Configuração do Budget ID

### 4. Configure sua Conta no Actual

1. **Abra** http://localhost:5006
2. **Clique em "Create new budget"** ou importe dados existentes
3. **Configure senha** (mesma do `.env.addon`)
4. **Crie categorias** iniciais (Ex: Mercado, Transporte, Saúde...)

### 5. Obtenha o Budget ID

1. **No Actual**, vá em **Configurações** (engrenagem)
2. **Clique em "Show advanced settings"**
3. **Copie o "Sync ID"** (formato: `eb97472d-2bb9-4679-ac40-ba7c01e9d591`)
4. **Cole no arquivo** `.env.addon`:
   ```env
   ACTUAL_BUDGET_ID=eb97472d-2bb9-4679-ac40-ba7c01e9d591
   ```

### 6. Reinicie e Teste

```bash
# Reinicia o Claude AI com as novas configurações
yarn ai:dev:restart

# Monitore os logs em tempo real
yarn ai:dev:logs
```

### 7. Primeira Classificação

1. **Adicione transações** sem categoria (manualmente ou importe CSV)
2. **Aguarde 5 minutos** - Claude analisa automaticamente
3. **Confira** se aparecem tags `#dev-ai-classified`
4. **Celebre** 🎉 - Classificação automática funcionando!

## 🛠️ Comandos de Controle

```bash
# AI Addon
yarn ai:dev                 # Iniciar AI addon
yarn ai:dev:logs            # Ver logs
yarn ai:dev:stop            # Parar AI
yarn ai:dev:restart         # Reiniciar AI

# Desenvolvimento
yarn start:server-dev-ai    # Servidor + AI
yarn start:server-dev       # Apenas servidor
yarn start                  # Apenas frontend

# Qualidade de código
yarn lint                   # Verificar código
yarn typecheck              # Verificar tipos
yarn test                   # Executar testes
```

## 🚨 Solução de Problemas

### AI não classifica transações

```bash
# Ver logs para diagnosticar
yarn ai:dev:logs

# Verificar se servidor está rodando
curl http://localhost:5006

# Reiniciar tudo
yarn ai:dev:stop
yarn start:server-dev-ai
```

### Erro de API Key

- Confirme se API key está correta no `.env.addon`
- Verifique se tem créditos disponíveis no provedor

### "No such table: messages_binary"

- Problema de sincronização resolvido com projeto limpo ✅

## 🎭 Modo de Teste (Dry Run)

**Por padrão, o AI roda em modo teste** - não altera suas transações.

Para ver o que aconteceria:

```bash
yarn ai:dev:logs
```

Para ativar modo real:

1. Edite `.env.addon`
2. Remova `"dryRun"` do array FEATURES
3. Reinicie: `yarn ai:dev:restart`

## 📚 Documentação Completa

- **`DEV-WITH-AI.md`** - Guia detalhado de desenvolvimento
- **`SETUP-AI-ADDON.md`** - Configuração completa do addon
- **`CLAUDE.md`** - Referência para Claude Code

## 💡 Dicas

- Use **dry-run** para testar sem riscos
- Monitore logs com `yarn ai:dev:logs`
- O AI classifica a cada **5 minutos** em desenvolvimento
- Transações processadas recebem tag `#dev-ai-classified`
- Para produção, use intervalos maiores (ex: 4 horas)

---

**🎉 Divirta-se com sua classificação automática de transações!**
