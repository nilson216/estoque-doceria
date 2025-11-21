export class ListIngredientsUseCase {
    constructor(listIngredientsRepository) {
        this.listIngredientsRepository = listIngredientsRepository;
    }

    async execute(params = {}) {
        return await this.listIngredientsRepository.execute(params);
    }
}
