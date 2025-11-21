export class GetIngredientByIdUseCase {
    constructor(getIngredientByIdRepository) {
        this.getIngredientByIdRepository = getIngredientByIdRepository;
    }

    async execute(ingredientId) {
        return await this.getIngredientByIdRepository.execute(ingredientId);
    }
}
