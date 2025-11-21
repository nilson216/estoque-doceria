export class GetMovementByIdUseCase {
    constructor(getMovementByIdRepository) {
        this.getMovementByIdRepository = getMovementByIdRepository;
    }

    async execute(id) {
        return await this.getMovementByIdRepository.execute(id);
    }
}
