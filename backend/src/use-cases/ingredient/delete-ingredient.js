export class DeleteIngredientUseCase {
    constructor(deleteIngredientRepository) {
        this.deleteIngredientRepository = deleteIngredientRepository;
    }

    async execute(ingredientId) {
        return await this.deleteIngredientRepository.execute(ingredientId);
    }
}
