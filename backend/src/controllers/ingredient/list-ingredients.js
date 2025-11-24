import { ok, serverError } from '../helpers/index.js';

export class ListIngredientsController {
    constructor(listIngredientsUseCase) {
        this.listIngredientsUseCase = listIngredientsUseCase;
    }

    async execute(httpRequest = {}) {
        try {
            const query = httpRequest.query || {};
            const page = query.page ? Number(query.page) : 1;
            const limit = query.limit ? Number(query.limit) : 10;
            const createdFrom = query.createdFrom || null;
            const createdTo = query.createdTo || null;
            const expiryFrom = query.expiryFrom || null;
            const expiryTo = query.expiryTo || null;

            const result = await this.listIngredientsUseCase.execute({ page, limit, createdFrom, createdTo, expiryFrom, expiryTo });
            return ok({ items: result.items, total: result.total, page, limit });
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
