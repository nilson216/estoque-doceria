export class GetMovementSummaryUseCase {
    constructor(movementSummaryRepository) {
        this.movementSummaryRepository = movementSummaryRepository;
    }

    async execute(params = {}) {
        return await this.movementSummaryRepository.execute(params);
    }
}
