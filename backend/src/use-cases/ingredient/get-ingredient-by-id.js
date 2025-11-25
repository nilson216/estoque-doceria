export class GetIngredientByIdUseCase {
    constructor(getIngredientByIdRepository) {
        this.getIngredientByIdRepository = getIngredientByIdRepository;
    }

    async execute(ingredientId, userId = null) {
        return await this.getIngredientByIdRepository.execute(ingredientId, userId);
    }
}
