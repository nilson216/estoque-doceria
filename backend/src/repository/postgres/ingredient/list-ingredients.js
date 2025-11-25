import { prisma } from '../../../../prisma/prisma.js';

export class PostgresListIngredientsRepository {
    // params: { page = 1, limit = 10, createdFrom, createdTo, expiryFrom, expiryTo, userId }
    async execute({ page = 1, limit = 10, createdFrom, createdTo, expiryFrom, expiryTo, userId = null } = {}) {
        const take = Math.max(1, Math.min(100, Number(limit || 10)));
        const pageNum = Math.max(1, Number(page || 1));
        const skip = (pageNum - 1) * take;

        const where = { deletedAt: null }

        // If no userId provided, deny access (strict mode)
        if (typeof userId === 'undefined' || userId === null) {
            return { items: [], total: 0 };
        }

        // When authenticated, return both the user's ingredients and global ones (userId == null).
        where.OR = [
            { userId: userId },
            { userId: null },
        ]

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
