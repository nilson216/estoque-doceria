import { ok, serverError } from '../helpers/index.js';

export class GetMovementSummaryController {
    constructor(getMovementSummaryUseCase) {
        this.getMovementSummaryUseCase = getMovementSummaryUseCase;
    }

    async execute(httpRequest = {}) {
        try {
            const params = httpRequest.query || {};
            const ingredientId = httpRequest.params?.ingredientId;
            const from = params.from || params.fromDate || null;
            const to = params.to || params.toDate || null;

            const userId = httpRequest.userId || null;
            const result = await this.getMovementSummaryUseCase.execute({ ingredientId, from, to }, userId);
            return ok(result);
        } catch (error) {
            console.error(error);
            return serverError();
        }
    }
}
