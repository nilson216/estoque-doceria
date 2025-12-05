# 🎓 Guia Completo do Frontend - Vite + React + Tailwind + Axios

## 📚 Índice
1. [Arquitetura Geral](#arquitetura-geral)
2. [Fluxo de Autenticação](#fluxo-de-autenticação)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Páginas e Rotas](#páginas-e-rotas)
5. [Contexto de Autenticação](#contexto-de-autenticação)
6. [Axios & API](#axios--api)
7. [Componentes-chave](#componentes-chave)
8. [Estado e Data Fetching](#estado-e-data-fetching)
9. [Estilos e UI](#estilos-e-ui)
10. [Como Rodar e Testar](#como-rodar-e-testar)
11. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitetura Geral

- **Vite + React** para SPA.
- **React Router** para rotas.
- **Context API** para autenticação (tokens em localStorage).
- **Axios** com interceptores para incluir Bearer token e refresh automático.
- **TanStack Query** para cache e revalidação de dados (lista de ingredientes, movimentos, etc.).
- **Tailwind + shadcn/ui** para estilização.

Fluxo macro:
```
App → Router → Página → Hooks (query/mutations) → Axios → API backend
```

---

## 🔐 Fluxo de Autenticação

1) **Login / Signup** chama API `/api/users/login` ou `/api/users`.
2) Backend retorna `accessToken` (30 min) e `refreshToken` (30 dias).
3) Front salva tokens em `localStorage` via `auth` context.
4) Axios interceptor adiciona `Authorization: Bearer <accessToken>`.
5) Se resposta 401, tenta `refresh` com `refreshToken` e refaz a request.
6) Se refresh falhar, faz logout e redireciona para `/login`.

---

## 📂 Estrutura de Pastas (principal)

```
frontend/
  src/
    main.jsx          # bootstrap React + Router
    App.jsx           # define rotas
    index.css         # estilos globais (Tailwind)
    assets/           # fontes/imagens
    components/       # componentes reutilizáveis
      ui/             # componentes de UI (shadcn)
    contexts/
      auth.jsx        # provider de autenticação
    lib/
      axios.js        # instância axios + interceptors
      utils.js        # helpers
    constants/
      local-storage.js# chaves de storage
    pages/
      login.jsx
      signup.jsx
      home.jsx
      historic.jsx
      service.jsx
      not-found.jsx
```

---

## 🛣️ Páginas e Rotas

`App.jsx` registra as rotas:
- `/login` → `pages/login.jsx`
- `/signup` → `pages/signup.jsx`
- `/` → `pages/home.jsx` (protegida)
- `/historic` → histórico de movimentos (protegida)
- `/service` → status/serviço (protegida)
- `*` → `pages/not-found.jsx`

Rotas protegidas exigem estar logado (contexto `auth`).

---

## 🧠 Contexto de Autenticação (`src/contexts/auth.jsx`)

- Armazena `user`, `accessToken`, `refreshToken` em estado e em `localStorage`.
- Exponde funções: `login(credentials)`, `signup(data)`, `logout()`, `refresh()`.
- Na montagem, restaura tokens do `localStorage` se existirem.
- Integra com Axios (interceptor usa os tokens atuais via closures ou import).

Uso típico:
```jsx
const { user, login, logout, isAuthenticated } = useAuth();

if (!isAuthenticated) return <Navigate to="/login" />;
```

---

## 🌐 Axios & API (`src/lib/axios.js`)

- Cria duas instâncias: `api` (pública) e `protectedApi` (com Bearer token).
- `getApiBaseUrl()` detecta URL da API em runtime:
  - Se `VITE_API_BASE_URL` setada → usa ela.
  - Se hostname contém `localhost` → `http://localhost:3000`.
  - Se domínio Render com `frontend` → troca para `backend`.
  - Senão, usa `window.location.origin`.
- Request interceptor do `protectedApi` injeta `Authorization` se `accessToken` existir.
- Response interceptor: em `401`, tenta `refreshToken`; se ok, repete request; se falha, faz logout.

---

## 🧩 Componentes-chave

- `components/header.jsx` — Navbar com logout, nome do usuário, links.
- `components/password-input.jsx` — Input com toggle de visibilidade.
- `components/add-ingredient-button.jsx` — Abre modal/form de ingrediente.
- `components/date-selection.jsx` — Seleção de data para filtros.
- `components/ui/*` — Botões, inputs, modais (shadcn/ui wrappers).

---

## 📄 Páginas (resumo rápido)

- `pages/login.jsx`: formulário de login; chama `userService.login`; salva tokens; redireciona.
- `pages/signup.jsx`: formulário de cadastro; chama `userService.signup`; já retorna tokens.
- `pages/home.jsx`: visão geral de ingredientes; lista via query; ações de criar/editar/deletar.
- `pages/historic.jsx`: lista de movimentações com filtros (data, tipo, ingrediente).
- `pages/service.jsx`: pode exibir status/healthcheck da API.
- `pages/not-found.jsx`: 404 genérico.

---

## 🔌 Services (`src/services/user.js` e outros)

- `login(credentials)`: POST `/users/login` → retorna tokens e user.
- `signup(data)`: POST `/users` → retorna tokens e user.
- Outros serviços (ingredientes/movimentos) seguem padrão: usar `protectedApi` e retornar data.

---

## 📦 Estado & Data Fetching

- **TanStack Query** (se já estiver configurado) para:
  - `useQuery(['ingredients', filters], fetchIngredients)`
  - `useQuery(['movements', filters], fetchMovements)`
  - `useMutation` para criar/editar/deletar e fazer `invalidateQueries`.
- Benefícios: cache, revalidação, loading/error automáticos.

---

## 🎨 Estilos e UI

- **Tailwind** habilitado via `index.css` e `tailwind.config.js`.
- **shadcn/ui** para componentes base.
- Convenção: classes utilitárias direto nos JSX; componentes de UI compartilham tokens de cor/tipografia.

---

## ▶️ Como Rodar e Testar

### Local
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Back-end precisa estar rodando em `http://localhost:3000` (ou setar `VITE_API_BASE_URL`).

### Build
```bash
npm run build
npm run preview
```

### Render (já configurado)
- Build command recomendado: `bash render-build.sh` (limpa cache antes de build).
- API URL é detectada automaticamente em produção (não precisa setar env).

---

## 🛠️ Troubleshooting

- **401 depois de logar:** ver se accessToken expirou; o refresh deve renovar. Se não, relogar.
- **API errada em produção:** `getApiBaseUrl()` deve ajustar automaticamente; se usar domínio custom, setar `VITE_API_BASE_URL`.
- **Tela branca após deploy:** limpar cache/builder → usar `render-build.sh`.
- **Datas aparecendo erradas:** backend já foi corrigido para não ajustar fuso; garantir formato `YYYY-MM-DD`.

---

## 📌 Resumo Rápido do Fluxo
```
Login/Signup → guarda tokens no context/localStorage → Axios injeta Bearer →
Requests protegidas → interceptador faz refresh em 401 →
Queries usam TanStack Query → UI renderiza listas e ações.
```

Pronto! Esse guia cobre o front inteiro: estrutura, rotas, auth, axios, UI e como rodar/testar. 🚀
