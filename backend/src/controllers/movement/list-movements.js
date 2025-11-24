import { ok, serverError } from '../helpers/index.js';

export class ListMovementsController {
    constructor(listMovementsUseCase) {
        this.listMovementsUseCase = listMovementsUseCase;
    }

    async execute(httpRequest = {}) {
        try {
            const { ingredientId } = httpRequest.params || {};
            const query = httpRequest.query || {};
            const page = query.page ? Number(query.page) : 1;
            const limit = query.limit ? Number(query.limit) : 10;
            const type = query.type;
            const result = await this.listMovementsUseCase.execute(ingredientId, { page, limit, type });
            return ok({ items: result.items, total: result.total, page, limit });
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
