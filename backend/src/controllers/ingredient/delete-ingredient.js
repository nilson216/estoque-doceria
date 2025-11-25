import { ok, serverError } from '../helpers/index.js';

export class DeleteIngredientController {
    constructor(deleteIngredientUseCase) {
        this.deleteIngredientUseCase = deleteIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            const { id } = httpRequest.params || {};
            const userId = httpRequest.userId || null;
            const deleted = await this.deleteIngredientUseCase.execute(id, userId);
            return ok(deleted);
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
