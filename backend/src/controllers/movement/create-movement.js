import { badRequest, created, serverError, unauthorized } from '../helpers/index.js';
import { ZodError } from 'zod';
import { createMovementSchema } from '../../schemas/movement.js';
import { InsufficientStockError, IngredientNotFoundError } from '../../errors/ingredient.js';

export class CreateMovementController {
    constructor(createMovementUseCase) {
        this.createMovementUseCase = createMovementUseCase;
    }

    async execute(httpRequest) {
        try {
            // require authenticated userId provided by middleware
            const userId = httpRequest.userId || httpRequest.userId === 0 ? httpRequest.userId : null;
            if (!userId) {
                return unauthorized();
            }
            const params = { ...(httpRequest.body || {}), ingredientId: httpRequest.params?.ingredientId };
            // inject userId coming from middleware
            params.userId = userId;
            await createMovementSchema.parseAsync(params);
            const result = await this.createMovementUseCase.execute(params);
            return created(result.createdMovement); // ou retornar o objeto combinado
        } catch (error) {
                if (error instanceof ZodError) {
                    // return detailed validation errors to help debugging
                    return badRequest({ message: error.errors?.map(e => e.message), issues: error.errors });
                }
            if (error instanceof InsufficientStockError || error instanceof IngredientNotFoundError) {
                return badRequest({ message: error.message });
            }
            console.error(error);
            return serverError();
        }
    }
}