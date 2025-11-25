import { prisma } from '../../../../prisma/prisma.js';
import { IngredientNotFoundError } from '../../../errors/ingredient.js';

export class PostgresDeleteIngredientRepository {
    async execute(ingredientId, userId = null) {
        // Delete movements related to the ingredient first, then delete the ingredient
        // Run in a transaction to ensure consistency. Only the owner may delete their ingredient.
        const result = await prisma.$transaction(async (tx) => {
            // verify ownership (ingredient must exist and belong to userId)
            const found = await tx.ingredient.findFirst({ where: { id: ingredientId, userId } });
            if (!found) {
                throw new IngredientNotFoundError(ingredientId);
            }

            // Instead of deleting movements, set their ingredientId to null so
            // movement history is preserved while removing the ingredient.
            await tx.movement.updateMany({ where: { ingredientId }, data: { ingredientId: null } });
            const deletedIngredient = await tx.ingredient.delete({ where: { id: ingredientId } });
            return deletedIngredient;
        });

        return result;
    }
}