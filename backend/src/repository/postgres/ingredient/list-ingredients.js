import { prisma } from '../../../../prisma/prisma.js';

export class PostgresListIngredientsRepository {
    // params: { page = 1, limit = 20 }
    async execute({ page = 1, limit = 20 } = {}) {
        const take = Math.max(1, Math.min(100, Number(limit || 20)));
        const pageNum = Math.max(1, Number(page || 1));
        const skip = (pageNum - 1) * take;

        const [total, items] = await Promise.all([
            prisma.ingredient.count(),
            prisma.ingredient.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
        ]);

        return { items, total };
    }
}
