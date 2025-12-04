# 🍰 Sistema de Gestão de Estoque para Doceria

Sistema completo de controle de estoque desenvolvido para gerenciar ingredientes e movimentações em uma doceria, com interface web moderna e API REST.

## 📋 Sobre o Projeto

Este sistema permite gerenciar de forma eficiente o estoque de ingredientes de uma doceria, controlando entradas e saídas, datas de validade, quantidades e observações. Cada usuário possui seu próprio estoque isolado, garantindo privacidade e organização.

### Principais Funcionalidades

- ✅ **Gestão de Ingredientes**
  - Cadastro de ingredientes com nome, unidade de medida, quantidade e validade
  - Edição e exclusão de ingredientes
  - Filtros por nome, data de cadastro e data de validade
  - Campo de observação para notas importantes
  - Controle de estoque em tempo real

- 📦 **Controle de Movimentações**
  - Registro de entradas e saídas de estoque
  - Movimentação com quantidade e observação
  - Histórico completo de todas as movimentações
  - Visualização por ingrediente ou global
  - Exclusão de movimentações (com ajuste automático de estoque)

- 👤 **Sistema de Usuários**
  - Cadastro e login com autenticação JWT
  - Isolamento de dados por usuário (cada usuário vê apenas seus próprios ingredientes)
  - Tokens de acesso (30 minutos) e refresh (30 dias)
  - Perfil do usuário (visualizar e editar dados)

- 🎨 **Interface Responsiva**
  - Design moderno e intuitivo
  - Totalmente responsivo (funciona em desktop, tablet e celular)
  - Tabelas com paginação e busca
  - Filtros de data com calendário
  - Feedback visual com toasts e modais

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **Zod** - Validação de schemas
- **bcrypt** - Hash de senhas

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool
- **React Router** - Navegação
- **TanStack Query** - Gerenciamento de estado servidor
- **React Hook Form** - Formulários
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Axios** - Cliente HTTP
- **Sonner** - Notificações toast

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **PostgreSQL** (versão 14 ou superior)
- **Git**

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/nilson216/estoque-doceria.git
cd estoque-doceria
```

### 2. Configuração do Backend

#### 2.1. Entre na pasta do backend

```bash
cd backend
```

#### 2.2. Instale as dependências

```bash
npm install
```

#### 2.3. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/estoque_doceria"

# Secrets para JWT (gere strings aleatórias fortes)
JWT_ACCESS_TOKEN_SECRET="sua_secret_key_de_acesso_aqui"
JWT_REFRESH_TOKEN_SECRET="sua_secret_key_de_refresh_aqui"

# Porta do servidor (opcional, padrão é 3000)
PORT=3000
```

**⚠️ Importante:** Gere secrets fortes e únicas. Você pode usar o comando abaixo para gerar:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2.4. Configure o banco de dados

Certifique-se de que o PostgreSQL está rodando e crie um banco de dados:

```bash
# No PostgreSQL
createdb estoque_doceria
```

Ou via SQL:

```sql
CREATE DATABASE estoque_doceria;
```

#### 2.5. Execute as migrations

```bash
npx prisma migrate deploy
```

Ou para desenvolvimento:

```bash
npx prisma migrate dev
```

#### 2.6. (Opcional) Gere o Prisma Client

```bash
npx prisma generate
```

#### 2.7. Inicie o servidor backend

```bash
npm start
```

Ou em modo de desenvolvimento (com auto-reload):

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

A documentação da API (Swagger) estará disponível em: `http://localhost:3000/api/docs`

### 3. Configuração do Frontend

Abra um novo terminal e navegue até a pasta do frontend:

#### 3.1. Entre na pasta do frontend

```bash
cd frontend
```

#### 3.2. Instale as dependências

```bash
npm install
```

#### 3.3. Configure as variáveis de ambiente

Crie um arquivo `.env` na pasta `frontend` com o seguinte conteúdo:

```env
# URL da API backend
VITE_API_BASE_URL=http://localhost:3000
```

**Nota:** Para produção (Render), use a URL do seu backend deployado:
```env
VITE_API_BASE_URL=https://seu-backend.onrender.com
```

#### 3.4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 🎯 Como Usar

### Primeiro Acesso

1. Abra o navegador em `http://localhost:5173`
2. Clique em "Criar conta" no canto inferior
3. Preencha o formulário de cadastro:
   - Nome
   - Sobrenome
   - E-mail
   - Senha (mínimo 6 caracteres)
   - Confirme a senha
   - Aceite os termos de uso
4. Após o cadastro, você será automaticamente logado

### Gerenciando Ingredientes

1. **Adicionar Ingrediente:**
   - Clique no botão "Novo Ingrediente"
   - Escolha entre "Criar novo" ou "Adicionar a existente"
   - Preencha os campos: nome, unidade, quantidade, validade (opcional), observação (opcional)
   - Clique em "Salvar"

2. **Filtrar Ingredientes:**
   - Use o campo de busca para filtrar por nome
   - Use os calendários "Registro" e "Validade" para filtrar por datas

3. **Editar Ingrediente:**
   - Clique no ícone de lápis na linha do ingrediente
   - Modifique os campos desejados
   - Clique em "Salvar"

4. **Ver Observação:**
   - Clique no ícone de olho para ver a observação completa

5. **Excluir/Dar Baixa:**
   - Clique no ícone de lixeira
   - Escolha entre:
     - **Dar baixa total**: Remove toda a quantidade (cria uma movimentação de SAÍDA)
     - **Excluir ingrediente**: Remove permanentemente o ingrediente e suas movimentações

### Visualizando Movimentações

1. Na página inicial, role até a seção "Movimentações"
2. Veja o histórico de todas as entradas e saídas
3. Use a paginação para navegar pelo histórico
4. Clique em "Remover" para excluir uma movimentação (o estoque será ajustado automaticamente)

### Navegação

- **Home** (`/`): Dashboard com ingredientes e movimentações
- **Histórico** (`/estoque/movimentacoes`): Histórico completo de movimentações
- **Perfil**: Menu no canto superior direito para ver dados ou sair

## 🏗️ Estrutura do Projeto

```
estoque-doceria/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Schema do banco de dados
│   │   └── migrations/          # Migrations do Prisma
│   ├── src/
│   │   ├── adapters/            # Adapters (hash, tokens, uuid)
│   │   ├── controllers/         # Controllers (camada HTTP)
│   │   ├── errors/              # Classes de erro customizadas
│   │   ├── factories/           # Factories para injeção de dependências
│   │   ├── middlewares/         # Middlewares (auth)
│   │   ├── repository/          # Repositórios (acesso ao banco)
│   │   ├── routes/              # Rotas da API
│   │   ├── schemas/             # Schemas de validação (Zod)
│   │   ├── use-cases/           # Casos de uso (lógica de negócio)
│   │   └── app.js               # Configuração do Express
│   ├── docs/
│   │   └── swagger.json         # Documentação OpenAPI
│   ├── package.json
│   └── index.js                 # Entrada do servidor
│
├── frontend/
│   ├── src/
│   │   ├── assets/              # Imagens e fontes
│   │   ├── components/          # Componentes React
│   │   │   ├── ui/              # Componentes shadcn/ui
│   │   │   └── ...              # Componentes específicos
│   │   ├── constants/           # Constantes
│   │   ├── contexts/            # Contextos React (Auth)
│   │   ├── lib/                 # Utilitários (axios, utils)
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── services/            # Services (chamadas API)
│   │   ├── App.jsx              # Componente raiz
│   │   └── main.jsx             # Entrada da aplicação
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 📡 Endpoints da API

### Usuários
- `POST /api/users` - Criar usuário
- `POST /api/users/login` - Login
- `POST /api/users/refresh-token` - Renovar token
- `GET /api/users/me` - Dados do usuário logado
- `PATCH /api/users/me` - Atualizar dados do usuário
- `DELETE /api/users/me` - Deletar conta

### Ingredientes
- `GET /api/ingredients` - Listar ingredientes (com paginação e filtros)
- `POST /api/ingredients` - Criar ingrediente
- `GET /api/ingredients/:id` - Obter ingrediente por ID
- `PUT /api/ingredients/:id` - Atualizar ingrediente
- `DELETE /api/ingredients/:id` - Deletar ingrediente

### Movimentações
- `GET /api/movements` - Listar todas as movimentações
- `GET /api/movements/:id` - Obter movimentação por ID
- `POST /api/ingredients/:ingredientId/movements` - Criar movimentação para ingrediente
- `GET /api/ingredients/:ingredientId/movements` - Listar movimentações de um ingrediente
- `GET /api/ingredients/:ingredientId/movements/summary` - Resumo de movimentações
- `DELETE /api/movements/:id` - Deletar movimentação

Para ver a documentação completa da API, acesse: `http://localhost:3000/api/docs`

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação via JWT com tokens de acesso e refresh
- Cada usuário só pode acessar seus próprios dados
- Middleware de autenticação protege rotas sensíveis
- Validação de dados com Zod em todas as requisições

## 🚀 Deploy

### Backend (Render)

1. Crie um novo Web Service no Render
2. Conecte seu repositório GitHub
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
4. Adicione as variáveis de ambiente:
   - `DATABASE_URL` (PostgreSQL do Render)
   - `JWT_ACCESS_TOKEN_SECRET`
   - `JWT_REFRESH_TOKEN_SECRET`
   - `PORT` (Render configura automaticamente)

### Frontend (Render Static Site)

1. Crie um novo Static Site no Render
2. Conecte seu repositório GitHub
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Adicione a variável de ambiente:
   - `VITE_API_BASE_URL` (URL do seu backend deployado)
5. Configure rewrite rule para SPA:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se o PostgreSQL está rodando
- Confirme que a `DATABASE_URL` está correta
- Execute `npx prisma generate` novamente

### Frontend não conecta ao backend
- Verifique se o backend está rodando
- Confirme a variável `VITE_API_BASE_URL`
- Verifique CORS no backend

### Erro 401 ao fazer requisições
- Limpe o localStorage do navegador
- Faça logout e login novamente
- Verifique se os tokens JWT não expiraram

### Erro ao criar ingrediente/movimentação
- Verifique se você está logado
- Confirme que os dados estão no formato correto
- Veja o console do backend para logs detalhados

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👨‍💻 Desenvolvedor

Desenvolvido por Nilson

---

**Dúvidas ou sugestões?** Abra uma issue no GitHub ou entre em contato!
