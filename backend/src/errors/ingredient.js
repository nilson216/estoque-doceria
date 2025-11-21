export class IngredientNotFoundError extends Error {
    constructor(ingredientId) {
        super(`Ingredient with id ${ingredientId} not found.`);
        this.name = 'IngredientNotFoundError';
    }
}
export class InsufficientStockError extends Error {
    constructor(ingredientId, requestedQuantity, availableQuantity) {
        super(`Insufficient stock for ingredient with id ${ingredientId}. Requested: ${requestedQuantity}, Available: ${availableQuantity}.`);
        this.name = 'InsufficientStockError';
    }
}