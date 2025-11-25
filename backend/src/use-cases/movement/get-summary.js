export class GetMovementSummaryUseCase {
    constructor(movementSummaryRepository) {
        this.movementSummaryRepository = movementSummaryRepository;
    }

    async execute(params = {}) {
        if (arguments.length >= 2) {
            const userId = arguments[1];
            return await this.movementSummaryRepository.execute(params, userId);
        }
        return await this.movementSummaryRepository.execute(params);
    }
}
