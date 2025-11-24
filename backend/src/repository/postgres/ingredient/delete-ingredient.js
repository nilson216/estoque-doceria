import { prisma } from '../../../../prisma/prisma.js';

export class PostgresDeleteIngredientRepository {
    async execute(ingredientId) {
        // Delete movements related to the ingredient first, then delete the ingredient
        // Run in a transaction to ensure consistency
        const result = await prisma.$transaction(async (tx) => {
            // Instead of deleting movements, set their ingredientId to null so
            // movement history is preserved while removing the ingredient.
            await tx.movement.updateMany({ where: { ingredientId }, data: { ingredientId: null } });
            const deletedIngredient = await tx.ingredient.delete({ where: { id: ingredientId } });
            return deletedIngredient;
        });

        return result;
    }
}