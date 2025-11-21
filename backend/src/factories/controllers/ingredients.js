import {
    CreateIngredientController,
    ListIngredientsController,
    GetIngredientByIdController,
    UpdateIngredientController,
    DeleteIngredientController,
} from '../../controllers/index.js';

import { ListMovementsController } from '../../controllers/movement/list-movements.js';

import {
    PostgresCreateIngredientRepository,
    PostgresGetIngredientByIdRepository,
    PostgresUpdateIngredientRepository,
    PostgresDeleteIngredientRepository,
} from '../../repository/postgres/index.js';
import { PostgresListIngredientsRepository } from '../../repository/postgres/ingredient/list-ingredients.js';

import { PostgresListMovementsByIngredientRepository } from '../../repository/postgres/movement/list-movements-by-ingredient.js';

import {
    CreateIngredientUseCase,
    ListIngredientsUseCase,
    GetIngredientByIdUseCase,
    UpdateIngredientUseCase,
    DeleteIngredientUseCase,
} from '../../use-cases/index.js';

import { ListMovementsUseCase } from '../../use-cases/movement/list-movements.js';

import { IdGeneratorAdapter } from '../../adapters/index.js';

// Ingredients
export const makeCreateIngredientController = () => {
    const createRepo = new PostgresCreateIngredientRepository();
    const idGenerator = new IdGeneratorAdapter();
    const useCase = new CreateIngredientUseCase(createRepo, idGenerator);
    return new CreateIngredientController(useCase);
};

export const makeListIngredientsController = () => {
    const listRepo = new PostgresListIngredientsRepository();
    const useCase = new ListIngredientsUseCase(listRepo);
    return new ListIngredientsController(useCase);
};

export const makeGetIngredientByIdController = () => {
    const getRepo = new PostgresGetIngredientByIdRepository();
    const useCase = new GetIngredientByIdUseCase(getRepo);
    return new GetIngredientByIdController(useCase);
};

export const makeUpdateIngredientController = () => {
    const updateRepo = new PostgresUpdateIngredientRepository();
    const useCase = new UpdateIngredientUseCase(updateRepo);
    return new UpdateIngredientController(useCase);
};

export const makeDeleteIngredientController = () => {
    const deleteRepo = new PostgresDeleteIngredientRepository();
    const useCase = new DeleteIngredientUseCase(deleteRepo);
    return new DeleteIngredientController(useCase);
};

// Movements: reuse existing create movement factory if available
import { makeCreateMovementController as makeCreateMovementControllerFromMovementFactory } from './movement.js';
export const makeCreateMovementController = () => makeCreateMovementControllerFromMovementFactory();

export const makeListMovementsController = () => {
    const listRepo = new PostgresListMovementsByIngredientRepository();
    const useCase = new ListMovementsUseCase(listRepo);
    return new ListMovementsController(useCase);
};
