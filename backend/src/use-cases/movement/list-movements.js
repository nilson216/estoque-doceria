export class ListMovementsUseCase {
    constructor(listMovementsRepository) {
        this.listMovementsRepository = listMovementsRepository;
    }

    async execute(ingredientId, params = {}) {
        return await this.listMovementsRepository.execute(ingredientId, params);
    }
}
