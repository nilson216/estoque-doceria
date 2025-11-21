export class UpdateIngredientUseCase {
    constructor(updateIngredientRepository) {
        this.updateIngredientRepository = updateIngredientRepository;
    }

    async execute(ingredientId, updateParams) {
        return await this.updateIngredientRepository.execute(ingredientId, updateParams);
    }
}
