import { badRequest, ok, serverError } from '../helpers/index.js';
import { ZodError } from 'zod';
import { updateIngredientSchema } from '../../schemas/ingredient.js';

export class UpdateIngredientController {
    constructor(updateIngredientUseCase) {
        this.updateIngredientUseCase = updateIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            const { id } = httpRequest.params || {};
            const params = httpRequest.body;
            const parsed = await updateIngredientSchema.parseAsync(params);
            const userId = httpRequest.userId || null;
            const updated = await this.updateIngredientUseCase.execute(id, parsed, userId);
            return ok(updated);
        } catch (error) {
            if (error instanceof ZodError) {
                return badRequest({ message: error.errors?.[0]?.message || 'Validation error' });
            }
            console.error(error);
            return serverError();
        }
    }
}
