import { prisma } from '../../../../prisma/prisma.js';

export class PostgresListIngredientsRepository {
    // params: { page = 1, limit = 20, createdFrom, createdTo, expiryFrom, expiryTo }
    async execute({ page = 1, limit = 20, createdFrom, createdTo, expiryFrom, expiryTo } = {}) {
        const take = Math.max(1, Math.min(100, Number(limit || 20)));
        const pageNum = Math.max(1, Number(page || 1));
        const skip = (pageNum - 1) * take;

        const where = {}

        if (createdFrom || createdTo) {
            where.createdAt = {}
            if (createdFrom) where.createdAt.gte = new Date(createdFrom)
            if (createdTo) where.createdAt.lte = new Date(createdTo)
        }

        if (expiryFrom || expiryTo) {
            where.expiryDate = where.expiryDate || {}
            if (expiryFrom) where.expiryDate.gte = new Date(expiryFrom)
            if (expiryTo) where.expiryDate.lte = new Date(expiryTo)
        }

        const [total, items] = await Promise.all([
            prisma.ingredient.count({ where }),
            prisma.ingredient.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
        ]);

        return { items, total };
    }
}
