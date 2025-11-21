export class CreateIngredientUseCase {
    constructor(createIngredientRepository, idGeneratorAdapter) {
        this.createIngredientRepository = createIngredientRepository;
        this.idGeneratorAdapter = idGeneratorAdapter;
    }

    async execute(createIngredientParams, userId = null) {
        const id = this.idGeneratorAdapter.execute();
        const ingredient = { ...createIngredientParams, id };
        // repository will handle atomic creation of initial movement when provided
        const created = await this.createIngredientRepository.execute(ingredient, userId);
        return created;
    }
}
