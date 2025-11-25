export class DeleteMovementUseCase {
    constructor(deleteMovementRepository) {
        this.deleteMovementRepository = deleteMovementRepository;
    }

    async execute(id) {
        if (arguments.length >= 2) {
            const userId = arguments[1];
            return await this.deleteMovementRepository.execute(id, userId);
        }
        return await this.deleteMovementRepository.execute(id);
    }
}
