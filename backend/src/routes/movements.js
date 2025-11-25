import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import {
        makeCreateMovementController,
        makeListMovementsController,
        makeGetMovementByIdController,
        makeDeleteMovementController,
} from '../factories/controllers/movement.js';

/*
    Router de Movements
    - Expõe endpoints para listar, criar e gerenciar movimentações do sistema.
    - Todas as rotas aqui exigem autenticação (`auth`) pois as movimentações estão associadas a usuários.
    - Controllers são instanciados por factories para manter a construção centralizada.
*/

export const movementsRouter = Router();

movementsRouter.get('/', auth, (req, res) =>
    makeListMovementsController()
        .execute({ query: req.query, userId: req.userId })
        .then((r) => res.status(r.statusCode).json(r.body)),
);

movementsRouter.post('/', auth, (req, res) =>
    makeCreateMovementController()
        .execute({ body: req.body, userId: req.userId })
        .then((r) => res.status(r.statusCode).json(r.body)),
);

movementsRouter.get('/:id', auth, (req, res) =>
    makeGetMovementByIdController()
        .execute({ params: { id: req.params.id }, userId: req.userId })
        .then((r) => res.status(r.statusCode).json(r.body)),
);

movementsRouter.delete('/:id', auth, (req, res) =>
    makeDeleteMovementController()
        .execute({ params: { id: req.params.id }, userId: req.userId })
        .then((r) => res.status(r.statusCode).json(r.body)),
);

