export class DeleteMovementUseCase {
    constructor(deleteMovementRepository) {
        this.deleteMovementRepository = deleteMovementRepository;
    }

    async execute(id) {
        return await this.deleteMovementRepository.execute(id);
    }
}
