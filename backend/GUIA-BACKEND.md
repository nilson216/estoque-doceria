# 🎓 Guia Completo do Backend - Arquitetura e Fluxo

## 📚 Índice
1. [Arquitetura Geral](#arquitetura-geral)
2. [Fluxo de uma Requisição](#fluxo-de-uma-requisição)
3. [Camadas Detalhadas](#camadas-detalhadas)
4. [Exemplos Práticos](#exemplos-práticos)
5. [Como Testar com Swagger](#como-testar-com-swagger)
6. [Padrões de Design](#padrões-de-design)

---

## 🏗️ Arquitetura Geral

Este backend usa **Clean Architecture** (Arquitetura Limpa), separando responsabilidades em camadas:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────────┐
│  1. ROUTES (src/routes/*.js)                        │
│     - Define endpoints (GET, POST, PUT, DELETE)     │
│     - Aplica middlewares (auth)                     │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  2. MIDDLEWARES (src/middlewares/auth.js)           │
│     - Valida JWT token                              │
│     - Adiciona userId ao request                    │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  3. FACTORIES (src/factories/controllers/*.js)      │
│     - Cria instâncias de controllers               │
│     - Injeta dependências (use-cases, repos)        │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  4. CONTROLLERS (src/controllers/*)                 │
│     - Recebe dados HTTP (body, params, query)      │
│     - Valida com Zod schemas                        │
│     - Chama use-case                                │
│     - Retorna HTTP response (200, 400, 500...)     │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  5. USE CASES (src/use-cases/*)                     │
│     - Lógica de negócio (regras da aplicação)      │
│     - Coordena repositórios                         │
│     - Não sabe nada sobre HTTP                      │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  6. REPOSITORIES (src/repository/postgres/*)        │
│     - Acesso ao banco de dados (Prisma)            │
│     - Queries SQL abstraídas                        │
│     - Retorna dados puros                           │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  7. DATABASE (PostgreSQL via Prisma)                │
│     - Armazena dados persistentes                   │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de uma Requisição

### Exemplo: Criar um Ingrediente

```
POST /api/ingredients
Body: { "name": "Farinha", "unit": "kg", "stockQuantity": 10 }
Headers: { "Authorization": "Bearer <token>" }
```

#### Passo a Passo:

```javascript
// ┌─────────────────────────────────────────────────┐
// │ 1. ENTRADA: app.js                              │
// └─────────────────────────────────────────────────┘

// app.js (linha ~32)
app.use('/api/ingredients', ingredientsRouter);
// → Direciona requisições /api/ingredients/* para o router


// ┌─────────────────────────────────────────────────┐
// │ 2. ROTA: src/routes/ingredients.js              │
// └─────────────────────────────────────────────────┘

// ingredients.js (linha ~19)
ingredientsRouter.post('/', auth, (req, res) => 
    makeCreateIngredientController()
        .execute({ body: req.body, userId: req.userId })
        .then(r => res.status(r.statusCode).json(r.body))
);

// O que acontece aqui:
// 1. Middleware 'auth' é executado PRIMEIRO
// 2. Se autenticado, chama makeCreateIngredientController()
// 3. Passa { body, userId } para o controller
// 4. Retorna a resposta HTTP


// ┌─────────────────────────────────────────────────┐
// │ 3. MIDDLEWARE: src/middlewares/auth.js          │
// └─────────────────────────────────────────────────┘

export const auth = (request, response, next) => {
    try {
        // Pega o token do header Authorization
        const authHeader = request.headers?.authorization || '';
        const accessToken = authHeader.split('Bearer ')[1];
        
        if (!accessToken) {
            return response.status(401).send({ message: 'Unauthorized' });
        }
        
        // Valida o token JWT
        const decodedToken = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN_SECRET,
        );
        
        // IMPORTANTE: Adiciona userId ao request
        request.userId = decodedToken.userId;
        
        // Deixa a requisição prosseguir
        next();
    } catch (error) {
        return response.status(401).send({ message: 'Unauthorized' });
    }
};


// ┌─────────────────────────────────────────────────┐
// │ 4. FACTORY: factories/controllers/ingredients.js│
// └─────────────────────────────────────────────────┘

export const makeCreateIngredientController = () => {
    // 1. Cria as dependências (repositórios)
    const createRepo = new PostgresCreateIngredientRepository();
    const idGenerator = new IdGeneratorAdapter();
    
    // 2. Cria o use-case e injeta repositórios
    const useCase = new CreateIngredientUseCase(createRepo, idGenerator);
    
    // 3. Cria o controller e injeta use-case
    const controller = new CreateIngredientController(useCase);
    
    return controller;
};

// Por que usar Factory?
// - Centraliza a criação de objetos complexos
// - Facilita trocar implementações (ex: Postgres → MongoDB)
// - Torna código testável (pode injetar mocks)


// ┌─────────────────────────────────────────────────┐
// │ 5. CONTROLLER: controllers/ingredient/create    │
// └─────────────────────────────────────────────────┘

export class CreateIngredientController {
    constructor(createIngredientUseCase) {
        this.createIngredientUseCase = createIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            // 1. Extrai dados da requisição HTTP
            const params = httpRequest.body;
            const userId = httpRequest.userId;

            // 2. VALIDA os dados com Zod
            await createIngredientSchema.parseAsync(params);

            // 3. Chama o use-case (lógica de negócio)
            const created = await this.createIngredientUseCase.execute(
                params, 
                userId
            );

            // 4. Retorna resposta HTTP formatada
            return created({ statusCode: 201, body: created });
            
        } catch (error) {
            // Trata erros e retorna HTTP status apropriado
            if (error instanceof ZodError) {
                return { statusCode: 400, body: { message: error.message } };
            }
            return { statusCode: 500, body: { message: 'Internal error' } };
        }
    }
}

// Responsabilidades do Controller:
// ✅ Receber dados HTTP
// ✅ Validar entrada
// ✅ Chamar use-case
// ✅ Formatar resposta HTTP
// ❌ NÃO tem lógica de negócio
// ❌ NÃO acessa banco diretamente


// ┌─────────────────────────────────────────────────┐
// │ 6. USE CASE: use-cases/ingredient/create        │
// └─────────────────────────────────────────────────┘

export class CreateIngredientUseCase {
    constructor(createIngredientRepository, idGeneratorAdapter) {
        this.createRepo = createIngredientRepository;
        this.idGenerator = idGeneratorAdapter;
    }

    async execute(params, userId) {
        // 1. LÓGICA DE NEGÓCIO
        
        // Gera um ID único
        const id = this.idGenerator.execute();
        
        // Prepara os dados
        const ingredientData = {
            id,
            name: params.name,
            unit: params.unit,
            stockQuantity: params.stockQuantity || 0,
            expiryDate: params.expiryDate || null,
            observacao: params.observacao || null,
            initialMovement: params.initialMovement || null,
        };

        // 2. Chama o repositório para salvar
        const created = await this.createRepo.execute(
            ingredientData, 
            userId
        );

        return created;
    }
}

// Responsabilidades do Use Case:
// ✅ Lógica de negócio
// ✅ Coordena repositórios
// ✅ Aplica regras da aplicação
// ❌ NÃO conhece HTTP
// ❌ NÃO acessa banco diretamente


// ┌─────────────────────────────────────────────────┐
// │ 7. REPOSITORY: repository/postgres/ingredient   │
// └─────────────────────────────────────────────────┘

export class PostgresCreateIngredientRepository {
    async execute(createIngredientParams, userId = null) {
        if (!userId) {
            throw new Error('userId is required');
        }

        // Se tem movimentação inicial, faz tudo em transação
        if (createIngredientParams.initialMovement && userId) {
            return await prisma.$transaction(async (tx) => {
                // Verifica se ingrediente já existe
                const existing = await tx.ingredient.findFirst({
                    where: {
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        expiryDate: createIngredientParams.expiryDate,
                        userId: userId,
                    },
                });

                if (existing) {
                    // Atualiza estoque do existente
                    const updated = await tx.ingredient.update({
                        where: { id: existing.id },
                        data: {
                            stockQuantity: existing.stockQuantity 
                                + createIngredientParams.initialMovement.quantity,
                        },
                    });

                    // Registra a movimentação
                    await tx.movement.create({
                        data: {
                            type: 'ENTRADA',
                            quantity: createIngredientParams.initialMovement.quantity,
                            ingredientId: existing.id,
                            userId: userId,
                        },
                    });

                    return updated;
                }

                // Cria novo ingrediente
                const created = await tx.ingredient.create({
                    data: {
                        id: createIngredientParams.id,
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        stockQuantity: createIngredientParams.stockQuantity,
                        expiryDate: createIngredientParams.expiryDate,
                        observacao: createIngredientParams.observacao,
                        userId: userId,
                    },
                });

                // Registra movimentação inicial
                await tx.movement.create({
                    data: {
                        type: 'ENTRADA',
                        quantity: createIngredientParams.initialMovement.quantity,
                        ingredientId: created.id,
                        userId: userId,
                    },
                });

                return created;
            });
        }

        // Criação simples (sem movimentação)
        return await prisma.ingredient.create({
            data: {
                id: createIngredientParams.id,
                name: createIngredientParams.name,
                unit: createIngredientParams.unit,
                stockQuantity: createIngredientParams.stockQuantity,
                expiryDate: createIngredientParams.expiryDate,
                observacao: createIngredientParams.observacao,
                userId: userId,
            },
        });
    }
}

// Responsabilidades do Repository:
// ✅ Acessa o banco de dados
// ✅ Queries SQL (via Prisma)
// ✅ Transações
// ❌ NÃO tem lógica de negócio
// ❌ NÃO conhece HTTP
```

---

## 🧩 Camadas Detalhadas

### 1️⃣ **app.js** - Entrada da Aplicação

```javascript
// src/app.js

import express from 'express';
import cors from 'cors';
import { ingredientsRouter } from './routes/ingredients.js';
import { movementsRouter } from './routes/movements.js';
import { usersRouter } from './routes/users.js';

const app = express();

// ┌──────────────────────────────────────┐
// │ MIDDLEWARES GLOBAIS                  │
// └──────────────────────────────────────┘

// Permite requisições de outros domínios (frontend)
app.use(cors());

// Lê JSON do body da requisição
app.use(express.json());

// ┌──────────────────────────────────────┐
// │ ROTAS (ENDPOINTS)                    │
// └──────────────────────────────────────┘

// Redireciona / para documentação
app.get('/', (req, res) => res.redirect('/api/docs'));

// Monta routers em prefixos específicos
app.use('/api/ingredients', ingredientsRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/users', usersRouter);

// Documentação Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export { app };
```

**O que faz:**
- Configura Express
- Aplica middlewares globais (CORS, JSON parser)
- Define prefixos das rotas (`/api/ingredients`, etc)
- Serve documentação Swagger

---

### 2️⃣ **Routes** - Define Endpoints

```javascript
// src/routes/ingredients.js

import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { 
    makeCreateIngredientController,
    makeListIngredientsController,
    makeGetIngredientByIdController,
    makeUpdateIngredientController,
    makeDeleteIngredientController 
} from '../factories/controllers/ingredients.js';

export const ingredientsRouter = Router();

// ┌──────────────────────────────────────────────────────┐
// │ CRUD de Ingredientes                                 │
// └──────────────────────────────────────────────────────┘

// POST /api/ingredients - Criar ingrediente
ingredientsRouter.post('/', auth, (req, res) => 
    makeCreateIngredientController()
        .execute({ body: req.body, userId: req.userId })
        .then(r => res.status(r.statusCode).json(r.body))
);

// GET /api/ingredients - Listar ingredientes (com filtros)
ingredientsRouter.get('/', auth, (req, res) => 
    makeListIngredientsController()
        .execute({ query: req.query, userId: req.userId })
        .then(r => res.status(r.statusCode).json(r.body))
);

// GET /api/ingredients/:id - Buscar por ID
ingredientsRouter.get('/:id', auth, (req, res) => 
    makeGetIngredientByIdController()
        .execute({ params: req.params, userId: req.userId })
        .then(r => res.status(r.statusCode).json(r.body))
);

// PUT /api/ingredients/:id - Atualizar
ingredientsRouter.put('/:id', auth, (req, res) => 
    makeUpdateIngredientController()
        .execute({ params: req.params, body: req.body, userId: req.userId })
        .then(r => res.status(r.statusCode).json(r.body))
);

// DELETE /api/ingredients/:id - Deletar
ingredientsRouter.delete('/:id', auth, (req, res) => 
    makeDeleteIngredientController()
        .execute({ params: req.params, userId: req.userId })
        .then(r => res.status(r.statusCode).json(r.body))
);

// ┌──────────────────────────────────────────────────────┐
// │ Rotas de Movimentações (nested)                      │
// └──────────────────────────────────────────────────────┘

// POST /api/ingredients/:ingredientId/movements
ingredientsRouter.post('/:ingredientId/movements', auth, (req, res) => {
    makeCreateMovementController()
        .execute({ 
            params: req.params, 
            body: req.body, 
            userId: req.userId 
        })
        .then(r => res.status(r.statusCode).json(r.body));
});

// GET /api/ingredients/:ingredientId/movements
ingredientsRouter.get('/:ingredientId/movements', auth, (req, res) => 
    makeListMovementsController()
        .execute({ 
            params: req.params, 
            query: req.query, 
            userId: req.userId 
        })
        .then(r => res.status(r.statusCode).json(r.body))
);
```

**Estrutura de uma Rota:**
```javascript
router.METODO('caminho', middleware, (req, res) => {
    // req.body    → Dados do POST/PUT
    // req.params  → Parâmetros da URL (:id)
    // req.query   → Query string (?page=1&limit=10)
    // req.userId  → Adicionado pelo middleware auth
    
    // Chama controller via factory
    makeController()
        .execute({ body, params, query, userId })
        .then(result => {
            // result = { statusCode: 200, body: {...} }
            res.status(result.statusCode).json(result.body)
        })
});
```

---

### 3️⃣ **Middlewares** - Interceptam Requisições

```javascript
// src/middlewares/auth.js

import jwt from 'jsonwebtoken';

export const auth = (request, response, next) => {
    try {
        // 1. Pega o token do header Authorization
        const authHeader = request.headers?.authorization || '';
        const accessToken = authHeader.split('Bearer ')[1];
        
        if (!accessToken) {
            return response.status(401).send({ message: 'Unauthorized' });
        }
        
        // 2. Valida o token JWT
        const decodedToken = jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_TOKEN_SECRET
        );
        
        if (!decodedToken) {
            return response.status(401).send({ message: 'Unauthorized' });
        }
        
        // 3. Adiciona userId ao request (IMPORTANTE!)
        request.userId = decodedToken.userId;
        
        // 4. Permite que a requisição continue
        next();
        
    } catch (error) {
        console.error('[auth] token verify error', error.message);
        return response.status(401).send({ message: 'Unauthorized' });
    }
};
```

**Como o middleware funciona:**

```
Request → Middleware → Route Handler
   ↓          ↓              ↓
 Token    Valida JWT    Recebe userId
```

---

### 4️⃣ **Controllers** - Camada HTTP

```javascript
// src/controllers/ingredient/create-ingredient.js

import { createIngredientSchema } from '../../schemas/ingredient.js';
import { created, badRequest, serverError } from '../helpers/index.js';
import { ZodError } from 'zod';

export class CreateIngredientController {
    constructor(createIngredientUseCase) {
        this.createIngredientUseCase = createIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            // ┌──────────────────────────────────┐
            // │ 1. EXTRAI dados da requisição   │
            // └──────────────────────────────────┘
            const params = httpRequest.body;
            const userId = httpRequest.userId;

            // ┌──────────────────────────────────┐
            // │ 2. VALIDA com Zod                │
            // └──────────────────────────────────┘
            await createIngredientSchema.parseAsync(params);

            // ┌──────────────────────────────────┐
            // │ 3. CHAMA use-case                │
            // └──────────────────────────────────┘
            const createdIngredient = await this.createIngredientUseCase.execute(
                params, 
                userId
            );

            // ┌──────────────────────────────────┐
            // │ 4. RETORNA resposta HTTP         │
            // └──────────────────────────────────┘
            return created(createdIngredient); // { statusCode: 201, body: {...} }
            
        } catch (error) {
            // ┌──────────────────────────────────┐
            // │ 5. TRATA erros                   │
            // └──────────────────────────────────┘
            if (error instanceof ZodError) {
                const message = error.errors?.[0]?.message || 'Validation error';
                return badRequest({ message });
            }
            
            console.error(error);
            return serverError();
        }
    }
}
```

**Helpers HTTP:**
```javascript
// src/controllers/helpers/http.js

export const ok = (body) => ({ statusCode: 200, body });
export const created = (body) => ({ statusCode: 201, body });
export const badRequest = (body) => ({ statusCode: 400, body });
export const unauthorized = () => ({ statusCode: 401, body: { message: 'Unauthorized' } });
export const notFound = (body) => ({ statusCode: 404, body });
export const serverError = () => ({ statusCode: 500, body: { message: 'Internal server error' } });
```

---

### 5️⃣ **Use Cases** - Lógica de Negócio

```javascript
// src/use-cases/ingredient/create-ingredient.js

export class CreateIngredientUseCase {
    constructor(createIngredientRepository, idGeneratorAdapter) {
        this.createRepo = createIngredientRepository;
        this.idGenerator = idGeneratorAdapter;
    }

    async execute(params, userId) {
        // ┌────────────────────────────────────────┐
        // │ LÓGICA DE NEGÓCIO                      │
        // └────────────────────────────────────────┘
        
        // 1. Gera ID único
        const id = this.idGenerator.execute();
        
        // 2. Valida regras de negócio
        if (!userId) {
            throw new Error('User must be authenticated');
        }
        
        // 3. Prepara dados
        const ingredientData = {
            id,
            name: params.name,
            unit: params.unit,
            stockQuantity: params.stockQuantity || 0,
            expiryDate: params.expiryDate || null,
            observacao: params.observacao || null,
            initialMovement: params.initialMovement || null,
            userId,
        };
        
        // 4. Persiste no banco via repository
        const created = await this.createRepo.execute(ingredientData, userId);
        
        return created;
    }
}
```

**Regras de Negócio Comuns:**
- Validações complexas
- Cálculos
- Lógica condicional
- Coordenação de múltiplos repositórios
- Eventos do sistema

---

### 6️⃣ **Repositories** - Acesso ao Banco

```javascript
// src/repository/postgres/ingredient/create-ingredient.js

import { prisma } from '../../../../prisma/prisma.js';

export class PostgresCreateIngredientRepository {
    async execute(createIngredientParams, userId = null) {
        if (!userId) {
            throw new Error('userId is required');
        }

        const initialMovement = createIngredientParams.initialMovement;
        
        // ┌────────────────────────────────────────────┐
        // │ Se tem movimentação inicial, usa transação│
        // └────────────────────────────────────────────┘
        if (initialMovement) {
            return await prisma.$transaction(async (tx) => {
                // Busca ingrediente existente
                const existing = await tx.ingredient.findFirst({
                    where: {
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        expiryDate: createIngredientParams.expiryDate,
                        userId: userId,
                    },
                });

                if (existing) {
                    // Atualiza estoque
                    const updated = await tx.ingredient.update({
                        where: { id: existing.id },
                        data: {
                            stockQuantity: existing.stockQuantity + initialMovement.quantity,
                        },
                    });

                    // Registra movimentação
                    await tx.movement.create({
                        data: {
                            type: 'ENTRADA',
                            quantity: initialMovement.quantity,
                            ingredientId: existing.id,
                            userId: userId,
                        },
                    });

                    return updated;
                }

                // Cria novo
                const created = await tx.ingredient.create({
                    data: {
                        id: createIngredientParams.id,
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        stockQuantity: createIngredientParams.stockQuantity,
                        expiryDate: createIngredientParams.expiryDate,
                        observacao: createIngredientParams.observacao,
                        userId: userId,
                    },
                });

                // Registra movimentação
                await tx.movement.create({
                    data: {
                        type: 'ENTRADA',
                        quantity: initialMovement.quantity,
                        ingredientId: created.id,
                        userId: userId,
                    },
                });

                return created;
            });
        }

        // ┌────────────────────────────────────────────┐
        // │ Criação simples (sem movimentação)         │
        // └────────────────────────────────────────────┘
        return await prisma.ingredient.create({
            data: {
                id: createIngredientParams.id,
                name: createIngredientParams.name,
                unit: createIngredientParams.unit,
                stockQuantity: createIngredientParams.stockQuantity,
                expiryDate: createIngredientParams.expiryDate,
                observacao: createIngredientParams.observacao,
                userId: userId,
            },
        });
    }
}
```

**Prisma ORM - Principais Operações:**

```javascript
// CREATE
await prisma.ingredient.create({ data: {...} });

// READ
await prisma.ingredient.findMany({ where: {...}, include: {...} });
await prisma.ingredient.findUnique({ where: { id: '...' } });
await prisma.ingredient.findFirst({ where: {...} });

// UPDATE
await prisma.ingredient.update({ 
    where: { id: '...' }, 
    data: {...} 
});

// DELETE
await prisma.ingredient.delete({ where: { id: '...' } });
await prisma.ingredient.deleteMany({ where: {...} });

// TRANSACTION (múltiplas operações atômicas)
await prisma.$transaction(async (tx) => {
    await tx.ingredient.create({...});
    await tx.movement.create({...});
});
```

---

## 📖 Exemplos Práticos

### Exemplo 1: Listar Ingredientes com Filtros

```javascript
// ┌─────────────────────────────────────────────────┐
// │ REQUEST                                         │
// └─────────────────────────────────────────────────┘
GET /api/ingredients?page=1&limit=10&name=Farinha&expiryFrom=2025-01-01
Headers: { Authorization: "Bearer <token>" }


// ┌─────────────────────────────────────────────────┐
// │ ROUTE (src/routes/ingredients.js)               │
// └─────────────────────────────────────────────────┘
ingredientsRouter.get('/', auth, (req, res) => 
    makeListIngredientsController()
        .execute({ 
            query: req.query,      // { page: '1', limit: '10', name: 'Farinha', ... }
            userId: req.userId     // Vem do middleware auth
        })
        .then(r => res.status(r.statusCode).json(r.body))
);


// ┌─────────────────────────────────────────────────┐
// │ CONTROLLER (controllers/ingredient/list)        │
// └─────────────────────────────────────────────────┘
export class ListIngredientsController {
    async execute(httpRequest) {
        const query = httpRequest.query;
        const userId = httpRequest.userId;
        
        // Extrai e converte parâmetros
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '10');
        const name = query.name || null;
        const expiryFrom = query.expiryFrom || null;
        const expiryTo = query.expiryTo || null;
        
        // Chama use-case
        const result = await this.listIngredientsUseCase.execute({
            page,
            limit,
            name,
            expiryFrom,
            expiryTo,
        }, userId);
        
        return ok(result); // { statusCode: 200, body: result }
    }
}


// ┌─────────────────────────────────────────────────┐
// │ USE CASE (use-cases/ingredient/list)            │
// └─────────────────────────────────────────────────┘
export class ListIngredientsUseCase {
    async execute(params, userId) {
        // Valida página/limite
        if (params.page < 1) params.page = 1;
        if (params.limit < 1) params.limit = 10;
        if (params.limit > 100) params.limit = 100;
        
        // Chama repository
        return await this.listRepo.execute(params, userId);
    }
}


// ┌─────────────────────────────────────────────────┐
// │ REPOSITORY (repository/postgres/ingredient/list)│
// └─────────────────────────────────────────────────┘
export class PostgresListIngredientsRepository {
    async execute(params, userId = null) {
        if (!userId) {
            return { items: [], total: 0, page: 1 };
        }

        // Constrói WHERE clause dinamicamente
        const where = { 
            userId: userId,
            deletedAt: null,  // Ignora deletados
        };
        
        if (params.name) {
            where.name = { contains: params.name, mode: 'insensitive' };
        }
        
        if (params.expiryFrom || params.expiryTo) {
            where.expiryDate = {};
            if (params.expiryFrom) where.expiryDate.gte = new Date(params.expiryFrom);
            if (params.expiryTo) where.expiryDate.lte = new Date(params.expiryTo);
        }

        // Busca dados com paginação
        const [items, total] = await Promise.all([
            prisma.ingredient.findMany({
                where,
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.ingredient.count({ where }),
        ]);

        return {
            items,
            total,
            page: params.page,
            limit: params.limit,
            totalPages: Math.ceil(total / params.limit),
        };
    }
}


// ┌─────────────────────────────────────────────────┐
// │ RESPONSE                                        │
// └─────────────────────────────────────────────────┘
{
    "items": [
        {
            "id": "uuid-1",
            "name": "Farinha",
            "unit": "kg",
            "stockQuantity": 10,
            "expiryDate": "2025-06-01",
            "observacao": "Farinha de trigo tipo 1",
            "createdAt": "2025-01-15T10:00:00Z",
            "userId": "user-uuid"
        }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
}
```

---

### Exemplo 2: Criar Movimentação

```javascript
// ┌─────────────────────────────────────────────────┐
// │ REQUEST                                         │
// └─────────────────────────────────────────────────┘
POST /api/ingredients/:ingredientId/movements
Body: {
    "type": "ENTRADA",
    "quantity": 5,
    "observacao": "Compra semanal"
}
Headers: { Authorization: "Bearer <token>" }


// ┌─────────────────────────────────────────────────┐
// │ ROUTE (src/routes/ingredients.js)               │
// └─────────────────────────────────────────────────┘
ingredientsRouter.post('/:ingredientId/movements', auth, (req, res) => {
    makeCreateMovementController()
        .execute({ 
            params: req.params,    // { ingredientId: 'uuid' }
            body: req.body,        // { type, quantity, observacao }
            userId: req.userId 
        })
        .then(r => res.status(r.statusCode).json(r.body));
});


// ┌─────────────────────────────────────────────────┐
// │ CONTROLLER (controllers/movement/create)        │
// └─────────────────────────────────────────────────┘
export class CreateMovementController {
    async execute(httpRequest) {
        const ingredientId = httpRequest.params.ingredientId;
        const body = httpRequest.body;
        const userId = httpRequest.userId;
        
        // Valida com Zod
        const parsed = await createMovementSchema.parseAsync({
            ingredientId,
            ...body
        });
        
        // Chama use-case
        const created = await this.createMovementUseCase.execute(
            parsed, 
            userId
        );
        
        return created(created);
    }
}


// ┌─────────────────────────────────────────────────┐
// │ USE CASE (use-cases/movement/create)            │
// └─────────────────────────────────────────────────┘
export class CreateMovementUseCase {
    async execute(params, userId) {
        // Gera ID
        const id = this.idGenerator.execute();
        
        const movementData = {
            id,
            type: params.type,
            quantity: params.quantity,
            observacao: params.observacao || null,
            ingredientId: params.ingredientId,
            userId,
        };
        
        // Cria movimentação E atualiza estoque
        return await this.createRepo.execute(movementData, userId);
    }
}


// ┌─────────────────────────────────────────────────┐
// │ REPOSITORY (repository/postgres/movement/create)│
// └─────────────────────────────────────────────────┘
export class PostgresCreateMovementRepository {
    async execute(createMovementParams, userId = null) {
        if (!userId) throw new Error('userId required');

        return await prisma.$transaction(async (tx) => {
            // 1. Valida que ingrediente pertence ao usuário
            const ingredient = await tx.ingredient.findFirst({
                where: { 
                    id: createMovementParams.ingredientId, 
                    userId: userId 
                },
            });

            if (!ingredient) {
                throw new Error('Ingredient not found or access denied');
            }

            // 2. Cria movimentação
            const movement = await tx.movement.create({
                data: {
                    id: createMovementParams.id,
                    type: createMovementParams.type,
                    quantity: createMovementParams.quantity,
                    observacao: createMovementParams.observacao,
                    ingredientId: createMovementParams.ingredientId,
                    userId: userId,
                },
            });

            // 3. Atualiza estoque do ingrediente
            const delta = movement.type === 'ENTRADA' 
                ? movement.quantity 
                : -movement.quantity;

            const updatedIngredient = await tx.ingredient.update({
                where: { id: ingredient.id },
                data: { 
                    stockQuantity: ingredient.stockQuantity + delta 
                },
            });

            return {
                movement,
                updatedIngredient,
            };
        });
    }
}


// ┌─────────────────────────────────────────────────┐
// │ RESPONSE                                        │
// └─────────────────────────────────────────────────┘
{
    "movement": {
        "id": "movement-uuid",
        "type": "ENTRADA",
        "quantity": 5,
        "observacao": "Compra semanal",
        "ingredientId": "ingredient-uuid",
        "userId": "user-uuid",
        "createdAt": "2025-01-15T10:30:00Z"
    },
    "updatedIngredient": {
        "id": "ingredient-uuid",
        "name": "Farinha",
        "stockQuantity": 15  // Era 10, agora é 15
    }
}
```

---

## 🧪 Como Testar com Swagger

### Acessar Swagger

1. Inicie o backend:
```bash
cd backend
npm start
```

2. Abra no navegador:
```
http://localhost:3000/api/docs
```

### Testando Endpoints

#### 1. Criar Usuário (Signup)

```
POST /api/users
```

**Body:**
```json
{
  "first_name": "João",
  "last_name": "Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "id": "user-uuid",
  "email": "joao@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**⚠️ IMPORTANTE:** Copie o `accessToken`!

---

#### 2. Autorizar no Swagger

1. Clique no botão **"Authorize"** (cadeado) no topo do Swagger
2. Cole o token no campo:
```
Bearer eyJhbGciOiJIUzI1NiIs...
```
3. Clique em **"Authorize"**
4. Feche o modal

Agora todos os endpoints protegidos funcionarão!

---

#### 3. Criar Ingrediente

```
POST /api/ingredients
```

**Body:**
```json
{
  "name": "Farinha de Trigo",
  "unit": "kg",
  "stockQuantity": 10,
  "expiryDate": "2025-06-30",
  "observacao": "Farinha tipo 1 para pães",
  "initialMovement": {
    "quantity": 10,
    "type": "ENTRADA",
    "observacao": "Estoque inicial"
  }
}
```

**Response (201):**
```json
{
  "id": "ingredient-uuid",
  "name": "Farinha de Trigo",
  "unit": "kg",
  "stockQuantity": 10,
  "expiryDate": "2025-06-30",
  "observacao": "Farinha tipo 1 para pães",
  "userId": "user-uuid",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

#### 4. Listar Ingredientes

```
GET /api/ingredients?page=1&limit=10&name=Farinha
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "ingredient-uuid",
      "name": "Farinha de Trigo",
      "unit": "kg",
      "stockQuantity": 10,
      "expiryDate": "2025-06-30",
      "observacao": "Farinha tipo 1 para pães"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

---

#### 5. Criar Movimentação

```
POST /api/ingredients/{ingredientId}/movements
```

**Path Parameter:**
- `ingredientId`: Cole o ID do ingrediente criado

**Body:**
```json
{
  "type": "SAIDA",
  "quantity": 2,
  "observacao": "Usado para pão de queijo"
}
```

**Response (201):**
```json
{
  "movement": {
    "id": "movement-uuid",
    "type": "SAIDA",
    "quantity": 2,
    "observacao": "Usado para pão de queijo",
    "createdAt": "2025-01-15T11:00:00Z"
  },
  "updatedIngredient": {
    "id": "ingredient-uuid",
    "stockQuantity": 8  // Era 10, saiu 2
  }
}
```

---

#### 6. Listar Movimentações

```
GET /api/movements?page=1&limit=10
```

**Response (200):**
```json
{
  "items": [
    {
      "id": "movement-uuid",
      "type": "SAIDA",
      "quantity": 2,
      "observacao": "Usado para pão de queijo",
      "ingredientId": "ingredient-uuid",
      "userId": "user-uuid",
      "createdAt": "2025-01-15T11:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

---

## 🎨 Padrões de Design

### 1. Dependency Injection (Injeção de Dependências)

**Problema:** Classes acopladas são difíceis de testar e modificar.

**Solução:** Passar dependências via construtor.

```javascript
// ❌ Ruim (acoplado)
class CreateIngredientController {
    async execute(data) {
        const repo = new PostgresCreateIngredientRepository();
        return repo.execute(data);
    }
}

// ✅ Bom (injetado)
class CreateIngredientController {
    constructor(createIngredientUseCase) {
        this.useCase = createIngredientUseCase;
    }
    
    async execute(data) {
        return this.useCase.execute(data);
    }
}

// Usar:
const repo = new PostgresCreateIngredientRepository();
const useCase = new CreateIngredientUseCase(repo);
const controller = new CreateIngredientController(useCase);
```

**Benefícios:**
- Fácil trocar implementação (Postgres → MongoDB)
- Fácil testar (injeta mocks)
- Código desacoplado

---

### 2. Repository Pattern

**Problema:** Código acoplado ao banco de dados.

**Solução:** Camada de abstração entre lógica e banco.

```javascript
// Interface (contrato)
class IngredientRepository {
    create(data) {}
    findById(id) {}
    findAll(filters) {}
    update(id, data) {}
    delete(id) {}
}

// Implementação Postgres
class PostgresIngredientRepository extends IngredientRepository {
    async create(data) {
        return prisma.ingredient.create({ data });
    }
    // ... outros métodos
}

// Implementação MongoDB (se quiser trocar)
class MongoIngredientRepository extends IngredientRepository {
    async create(data) {
        return db.collection('ingredients').insertOne(data);
    }
}
```

**Benefícios:**
- Troca fácil de banco de dados
- Testes com mock
- Lógica de negócio isolada

---

### 3. Factory Pattern

**Problema:** Criar objetos complexos com muitas dependências.

**Solução:** Centralizar criação em factories.

```javascript
// factories/controllers/ingredients.js
export const makeCreateIngredientController = () => {
    // 1. Cria dependências
    const repo = new PostgresCreateIngredientRepository();
    const idGenerator = new IdGeneratorAdapter();
    
    // 2. Monta use-case
    const useCase = new CreateIngredientUseCase(repo, idGenerator);
    
    // 3. Monta controller
    return new CreateIngredientController(useCase);
};

// Uso:
const controller = makeCreateIngredientController();
```

---

### 4. Use Case Pattern (Interactor)

**Problema:** Lógica de negócio espalhada pelo código.

**Solução:** Cada ação = 1 use case com regras centralizadas.

```javascript
// Um use case = Uma ação do sistema
class CreateIngredientUseCase {
    async execute(params, userId) {
        // Todas as regras de criar ingrediente ficam aqui
        // - Gerar ID
        // - Validar usuário
        // - Verificar duplicados
        // - Criar ingrediente
        // - Registrar movimentação
    }
}
```

---

## 🔑 Conceitos Importantes

### 1. Transações (ACID)

```javascript
await prisma.$transaction(async (tx) => {
    // Tudo dentro dessa função acontece como uma unidade:
    // - Ou tudo funciona
    // - Ou nada acontece (rollback)
    
    const ingredient = await tx.ingredient.create({...});
    const movement = await tx.movement.create({...});
    
    // Se qualquer operação falhar, nada é salvo
});
```

**Quando usar:**
- Operações que precisam acontecer juntas
- Ex: Criar ingrediente + movimentação inicial
- Ex: Atualizar estoque + registrar movimentação

---

### 2. Middleware Chain

```javascript
// Middlewares são executados em ordem:
app.use(cors());           // 1. Permite CORS
app.use(express.json());   // 2. Parse JSON
router.get('/', auth, handler);  // 3. Valida token → 4. Handler
```

---

### 3. Query Strings vs Path Params vs Body

```javascript
// PATH PARAMS: /api/ingredients/:id
// Usado para identificar recursos
GET /api/ingredients/uuid-123
const id = req.params.id;

// QUERY STRING: ?page=1&limit=10
// Usado para filtros, paginação
GET /api/ingredients?page=1&limit=10&name=Farinha
const page = req.query.page;

// BODY: JSON enviado no POST/PUT
// Usado para criar/atualizar recursos
POST /api/ingredients
Body: { "name": "Farinha", ... }
const data = req.body;
```

---

## 📚 Resumo Final

### Fluxo Completo:
```
1. Client envia HTTP Request
2. app.js roteia para router correto
3. Route aplica middleware (auth)
4. Middleware valida JWT e adiciona userId
5. Route chama Factory
6. Factory cria Controller + Use Case + Repository
7. Controller valida dados (Zod)
8. Controller chama Use Case
9. Use Case aplica lógica de negócio
10. Use Case chama Repository
11. Repository faz query no banco (Prisma)
12. Repository retorna dados
13. Use Case retorna para Controller
14. Controller retorna HTTP response
15. Client recebe resposta
```

### Responsabilidades:

| Camada | Responsabilidade | NÃO pode fazer |
|--------|------------------|----------------|
| **Routes** | Definir endpoints, aplicar middlewares | Lógica de negócio |
| **Middlewares** | Interceptar requisições (auth, logs) | Acessar banco |
| **Controllers** | Validar entrada, chamar use-case, retornar HTTP | Lógica de negócio |
| **Use Cases** | Lógica de negócio, coordenar repositories | Conhecer HTTP |
| **Repositories** | Acessar banco de dados | Lógica de negócio |

### Vantagens desta Arquitetura:
✅ Código organizado e fácil de entender
✅ Fácil testar (cada camada independente)
✅ Fácil trocar banco de dados
✅ Fácil adicionar novos endpoints
✅ Segue princípios SOLID
✅ Escalável

---

## 🎯 Próximos Passos para Estudar

1. **Teste a API via Swagger** - Crie usuário, ingredientes, movimentações
2. **Leia o código** - Siga o fluxo de uma requisição no código
3. **Adicione um endpoint novo** - Ex: GET /api/ingredients/:id/summary
4. **Modifique uma regra de negócio** - Ex: Validar quantidade mínima
5. **Adicione testes unitários** - Jest para testar use cases

**Dúvidas?** Pergunte sobre qualquer parte específica! 🚀
