import { ok, notFound, serverError } from '../helpers/index.js';

export class DeleteMovementController {
    constructor(deleteMovementUseCase) {
        this.deleteMovementUseCase = deleteMovementUseCase;
    }

    async execute(httpRequest = {}) {
        try {
            const id = httpRequest.params?.id;
            const userId = httpRequest.userId || null;
            const deleted = await this.deleteMovementUseCase.execute(id, userId);
            if (!deleted) return notFound();
            return ok(deleted);
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
