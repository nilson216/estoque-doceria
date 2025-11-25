import { ok, notFound, serverError } from '../helpers/index.js';

export class GetIngredientByIdController {
    constructor(getIngredientByIdUseCase) {
        this.getIngredientByIdUseCase = getIngredientByIdUseCase;
    }

    async execute(httpRequest) {
        try {
            const { id } = httpRequest.params || {};
            const userId = httpRequest.userId || null;
            const ingredient = await this.getIngredientByIdUseCase.execute(id, userId);
            if (!ingredient) return notFound({ message: 'Ingredient not found' });
            return ok(ingredient);
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
