export class DeleteIngredientUseCase {
    constructor(deleteIngredientRepository) {
        this.deleteIngredientRepository = deleteIngredientRepository;
    }

    async execute(ingredientId, userId = null) {
        return await this.deleteIngredientRepository.execute(ingredientId, userId);
    }
}
