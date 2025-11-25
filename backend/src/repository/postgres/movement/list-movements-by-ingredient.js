import { prisma } from '../../../../prisma/prisma.js';

export class PostgresListMovementsByIngredientRepository {
    // execute(ingredientId, { page = 1, limit = 10, type })
    async execute(ingredientId, { page = 1, limit = 10, type } = {}, userId = null) {
        const take = Math.max(1, Math.min(100, Number(limit || 10)));
        const pageNum = Math.max(1, Number(page || 1));
        const skip = (pageNum - 1) * take;

        // Require authenticated user for movements scoped by ingredient
        if (!userId) return { items: [], total: 0 };

        const where = {
            // ensure the movement is associated to an ingredient owned by the user
            ingredient: { userId },
        };
        if (ingredientId) where.ingredientId = ingredientId;
        if (type) where.type = type;

        const [total, items] = await Promise.all([
            prisma.movement.count({ where }),
            prisma.movement.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        ]);

        return { items, total };
    }
}
