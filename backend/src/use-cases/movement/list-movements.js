export class ListMovementsUseCase {
    constructor(listMovementsRepository) {
        this.listMovementsRepository = listMovementsRepository;
    }

    async execute(ingredientId, params = {}) {
        // params may include pagination and filtering; userId is forwarded separately
        const userId = params.userId || null;
        // allow userId passed as third argument too
        if (arguments.length >= 3) {
            const maybeUserId = arguments[2];
            if (maybeUserId) {
                return await this.listMovementsRepository.execute(ingredientId, params, maybeUserId);
            }
        }
        return await this.listMovementsRepository.execute(ingredientId, params, userId);
    }
}
