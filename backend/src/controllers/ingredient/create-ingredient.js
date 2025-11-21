import { badRequest, created, serverError } from '../helpers/index.js';
import { createIngredientSchema } from '../../schemas/ingredient.js';
import { ZodError } from 'zod';

export class CreateIngredientController {
    constructor(createIngredientUseCase) {
        this.createIngredientUseCase = createIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            const params = httpRequest.body;
            await createIngredientSchema.parseAsync(params);
            const createdIngredient = await this.createIngredientUseCase.execute(params);
            return created(createdIngredient);
        } catch (error) {
            if (error instanceof ZodError) {
                return badRequest({ message: error.errors?.[0]?.message || 'Validation error' });
            }
            console.error(error);
            return serverError();
        }
    }
}
