export class CreateIngredientUseCase {
    constructor(createIngredientRepository, idGeneratorAdapter) {
        this.createIngredientRepository = createIngredientRepository;
        this.idGeneratorAdapter = idGeneratorAdapter;
    }

    async execute(createIngredientParams) {
        const id = this.idGeneratorAdapter.execute();
        const ingredient = { ...createIngredientParams, id };
        const created = await this.createIngredientRepository.execute(ingredient);
        return created;
    }
}
