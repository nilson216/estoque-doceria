import { InsufficientStockError, IngredientNotFoundError } from '../../errors/ingredient.js';
import { prisma } from '../../../prisma/prisma.js';

export class CreateMovementUseCase {
    constructor(getIngredientRepo, updateIngredientRepo, createMovementRepo, idGeneratorAdapter) {
        this.getIngredientRepo = getIngredientRepo;
        this.updateIngredientRepo = updateIngredientRepo;
        this.createMovementRepo = createMovementRepo;
        this.idGeneratorAdapter = idGeneratorAdapter;
    }

    async execute({ ingredientId, userId, type, quantity }) {
        // obtém ingrediente atual
        const ingredient = await this.getIngredientRepo.execute(ingredientId);
        if (!ingredient) {
            throw new IngredientNotFoundError(ingredientId);
        }

        // valida saída com estoque
        if (type === 'SAIDA' && ingredient.stockQuantity < quantity) {
            throw new InsufficientStockError(ingredientId);
        }

        const movementId = this.idGeneratorAdapter.execute();
        const newStock = type === 'ENTRADA'
            ? ingredient.stockQuantity + quantity
            : ingredient.stockQuantity - quantity;

        // executa transação: cria movimento e atualiza stock
        const result = await prisma.$transaction(async (tx) => {
            const createdMovement = await this.createMovementRepo.execute({
                id: movementId,
                type,
                quantity,
                ingredientId,
                userId,
            }, tx);

            const updatedIngredient = await this.updateIngredientRepo.execute(ingredientId, { stockQuantity: newStock }, tx);
            return { createdMovement, updatedIngredient };
        });

        // retorna movimento (pode retornar também ingredient atualizado)
        console.log('CreateMovementUseCase result:', JSON.stringify(result));
        return result;
    }
}