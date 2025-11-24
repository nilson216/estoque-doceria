import { ok, serverError } from '../../controllers/helpers/index.js';

export class ListUsersController {
    constructor(listUsersUseCase) {
        this.listUsersUseCase = listUsersUseCase;
    }

    async execute(httpRequest = {}) {
        try {
            const query = httpRequest.query || {};
            const page = query.page ? Number(query.page) : 1;
            const limit = query.limit ? Number(query.limit) : 10;
            const result = await this.listUsersUseCase.execute({ page, limit });
            return ok({ items: result.items, total: result.total, page, limit });
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
