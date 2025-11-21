import { prisma } from '../../../../prisma/prisma.js';

export class PostgresListMovementsByIngredientRepository {
    // execute(ingredientId, { page = 1, limit = 20, type })
    async execute(ingredientId, { page = 1, limit = 20, type } = {}) {
        const take = Math.max(1, Math.min(100, Number(limit || 20)));
        const pageNum = Math.max(1, Number(page || 1));
        const skip = (pageNum - 1) * take;

        const where = {};
        if (ingredientId) where.ingredientId = ingredientId;
        if (type) where.type = type;

        const [total, items] = await Promise.all([
            prisma.movement.count({ where }),
            prisma.movement.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        ]);

        return { items, total };
    }
}
