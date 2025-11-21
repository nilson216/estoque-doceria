import { CreateMovementController, ListMovementsController, GetMovementByIdController, DeleteMovementController } from '../../controllers/index.js';
import {
    PostgresCreateMovementRepository,
    PostgresGetIngredientByIdRepository,
    PostgresUpdateIngredientRepository,
    PostgresListMovementsByIngredientRepository,
    PostgresGetMovementByIdRepository,
    PostgresDeleteMovementRepository,
} from '../../repository/postgres/index.js';
import { CreateMovementUseCase, ListMovementsUseCase, GetMovementByIdUseCase, DeleteMovementUseCase } from '../../use-cases/index.js';
import { IdGeneratorAdapter } from '../../adapters/index.js';

export const makeCreateMovementController = () => {
    const getIngredientRepo = new PostgresGetIngredientByIdRepository();
    const updateIngredientRepo = new PostgresUpdateIngredientRepository();
    const createMovementRepo = new PostgresCreateMovementRepository();
    const idGenerator = new IdGeneratorAdapter();

    const useCase = new CreateMovementUseCase(getIngredientRepo, updateIngredientRepo, createMovementRepo, idGenerator);

    return new CreateMovementController(useCase);
};

export const makeListMovementsController = () => {
    const listRepo = new PostgresListMovementsByIngredientRepository();
    const useCase = new ListMovementsUseCase(listRepo);
    return new ListMovementsController(useCase);
};

export const makeGetMovementByIdController = () => {
    const repo = new PostgresGetMovementByIdRepository();
    const useCase = new GetMovementByIdUseCase(repo);
    return new GetMovementByIdController(useCase);
};

export const makeDeleteMovementController = () => {
    const repo = new PostgresDeleteMovementRepository();
    const useCase = new DeleteMovementUseCase(repo);
    return new DeleteMovementController(useCase);
};