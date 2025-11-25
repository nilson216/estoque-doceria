import { prisma } from '../../../../prisma/prisma.js';

export class PostgresGetIngredientByIdRepository {
    async execute(ingredientId, userId = null) {
        // If unauthenticated, deny access
        if (!userId) return null;

        // Allow fetch when ingredient belongs to user OR is global (userId == null)
        return await prisma.ingredient.findFirst({
            where: {
                id: ingredientId,
                OR: [
                    { userId: userId },
                    { userId: null },
                ],
            },
        });
    }
}