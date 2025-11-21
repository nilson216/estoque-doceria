import { ok, serverError } from '../helpers/index.js';

export class DeleteIngredientController {
    constructor(deleteIngredientUseCase) {
        this.deleteIngredientUseCase = deleteIngredientUseCase;
    }

    async execute(httpRequest) {
        try {
            const { id } = httpRequest.params || {};
            const deleted = await this.deleteIngredientUseCase.execute(id);
            return ok(deleted);
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
