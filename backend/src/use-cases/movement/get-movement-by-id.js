export class GetMovementByIdUseCase {
    constructor(getMovementByIdRepository) {
        this.getMovementByIdRepository = getMovementByIdRepository;
    }

    async execute(id) {
        // allow passing userId as second arg (from controller)
        if (arguments.length >= 2) {
            const userId = arguments[1];
            return await this.getMovementByIdRepository.execute(id, userId);
        }
        return await this.getMovementByIdRepository.execute(id);
    }
}
