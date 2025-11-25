import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { makeCreateIngredientController, makeListIngredientsController, makeGetIngredientByIdController, makeUpdateIngredientController, makeDeleteIngredientController, makeCreateMovementController, makeListMovementsController } from '../factories/controllers/ingredients.js';
import { makeGetMovementSummaryController } from '../factories/controllers/movement.js';

/*
    Router de Ingredients
    - Expõe endpoints REST para recursos de Ingredient e rotas aninhadas de movimentação.
    - Rotas importantes:
        - POST /api/ingredients          : criar ingrediente (auth requerido)
        - POST /api/ingredients/:ingredientId/movements : criar movimentação para ingrediente (auth requerido)
        - GET  /api/ingredients/:ingredientId/movements : listar movimentações de um ingrediente (público)
        - GET  /api/ingredients/:ingredientId/movements/summary : resumo agregado para ingrediente
    - Observações: rotas que requerem autenticação usam o middleware `auth` que popula
        `req.userId`. Controllers são criados via factories para centralizar o wiring.
*/

export const ingredientsRouter = Router();

ingredientsRouter.post('/', auth, (req, res) => makeCreateIngredientController().execute({ body: req.body, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.get('/', auth, (req, res) => makeListIngredientsController().execute({ query: req.query, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.get('/:id', auth, (req, res) => makeGetIngredientByIdController().execute({ params: req.params, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.put('/:id', auth, (req, res) => makeUpdateIngredientController().execute({ params: req.params, body: req.body, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.delete('/:id', auth, (req, res) => makeDeleteIngredientController().execute({ params: req.params, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body)));


ingredientsRouter.post('/:ingredientId/movements', auth, (req, res) => {
    // auth middleware sets `req.userId`
    makeCreateMovementController().execute({ params: req.params, body: req.body, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body));
});
ingredientsRouter.get('/:ingredientId/movements', (req, res) => makeListMovementsController().execute({ params: req.params, query: req.query }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.get('/:ingredientId/movements/summary', (req, res) => makeGetMovementSummaryController().execute({ params: req.params, query: req.query }).then(r => res.status(r.statusCode).json(r.body)));