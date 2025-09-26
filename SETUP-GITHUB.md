# 🚀 Setup para GitHub

## Para o dono do fork:

### 1. Criar repositório no GitHub

1. Vá para https://github.com/new
2. Nome: `actual-budget-claude-ai` ou similar
3. Descrição: `Actual Budget with Claude Code integration for automatic transaction classification`
4. Marque como **Público**
5. **NÃO** inicialize com README (já temos)

### 2. Configurar remote e push

```bash
# Remover remote atual do Actual original
git remote remove origin

# Adicionar seu novo repositório
git remote add origin https://github.com/Psykhepathos/actual-budget-claude-ai.git

# Fazer primeiro push
git push -u origin master
```

### 3. Configurar repositório

1. **Adicionar tópicos**: `actual-budget`, `claude-ai`, `personal-finance`, `typescript`, `docker`
2. **Editar descrição**: "Actual Budget with Claude Code integration for automatic transaction classification 🤖"
3. **Adicionar README**: O arquivo `README-FORK.md` pode ser renomeado para `README.md`

### 4. Para compartilhar com amigos

Envie este link e as instruções do `COMO-USAR.md`:

```
https://github.com/Psykhepathos/actual-budget-claude-ai
```

## Para quem vai testar:

### Quick Start

```bash
git clone https://github.com/Psykhepathos/actual-budget-claude-ai.git
cd actual-budget-claude-ai
yarn install
cp .env.addon.example .env.addon
# Editar .env.addon com sua senha
yarn start:server-dev-ai
```

Depois siga as instruções em `COMO-USAR.md` para configurar o Budget ID.

## 🎯 Pronto!

Seu fork está pronto para ser testado por outros usuários sem suas credenciais pessoais.
