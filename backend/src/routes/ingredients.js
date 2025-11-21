import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { makeCreateIngredientController, makeListIngredientsController, makeGetIngredientByIdController, makeUpdateIngredientController, makeDeleteIngredientController, makeCreateMovementController, makeListMovementsController } from '../factories/controllers/ingredients.js';

export const ingredientsRouter = Router();

ingredientsRouter.post('/', (req, res) => makeCreateIngredientController().execute({ body: req.body }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.get('/', (req, res) => makeListIngredientsController().execute({}).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.get('/:id', (req, res) => makeGetIngredientByIdController().execute({ params: req.params }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.put('/:id', (req, res) => makeUpdateIngredientController().execute({ params: req.params, body: req.body }).then(r => res.status(r.statusCode).json(r.body)));
ingredientsRouter.delete('/:id', (req, res) => makeDeleteIngredientController().execute({ params: req.params }).then(r => res.status(r.statusCode).json(r.body)));


ingredientsRouter.post('/:ingredientId/movements', auth, (req, res) => {
    // auth middleware sets `req.userId`
    const body = { ...req.body, ingredientId: req.params.ingredientId };
    makeCreateMovementController().execute({ body, userId: req.userId }).then(r => res.status(r.statusCode).json(r.body));
});
ingredientsRouter.get('/:ingredientId/movements', (req, res) => makeListMovementsController().execute({ params: req.params }).then(r => res.status(r.statusCode).json(r.body)));