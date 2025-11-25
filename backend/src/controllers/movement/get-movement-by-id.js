import { ok, notFound, serverError } from '../helpers/index.js';

export class GetMovementByIdController {
    constructor(getMovementByIdUseCase) {
        this.getMovementByIdUseCase = getMovementByIdUseCase;
    }

    async execute(httpRequest = {}) {
        try {
            const id = httpRequest.params?.id;
            const userId = httpRequest.userId || null;
            const movement = await this.getMovementByIdUseCase.execute(id, userId);
            if (!movement) return notFound();
            return ok(movement);
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
