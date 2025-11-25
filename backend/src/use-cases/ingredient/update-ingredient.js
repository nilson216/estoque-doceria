export class UpdateIngredientUseCase {
    constructor(updateIngredientRepository) {
        this.updateIngredientRepository = updateIngredientRepository;
    }

    async execute(ingredientId, updateParams, userId = null) {
        return await this.updateIngredientRepository.execute(ingredientId, updateParams, userId);
    }
}
