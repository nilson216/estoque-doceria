import { prisma } from '../../../../prisma/prisma.js';

export class PostgresMovementSummaryRepository {
    // params: { ingredientId, from, to }
    async execute({ ingredientId, from, to } = {}, userId = null) {
        // require user for summary access
        if (!userId) return { entradas: 0, saidas: 0, net: 0 };

        const whereBase = { ingredientId, ingredient: { userId } };
        if (from || to) whereBase.createdAt = {};
        if (from) {
            const fromDate = new Date(from)
            whereBase.createdAt.gte = fromDate
        }
        if (to) {
            // Add 1 day to include entire day
            const toDate = new Date(to)
            toDate.setUTCDate(toDate.getUTCDate() + 1)
            whereBase.createdAt.lt = toDate
        }

        const [entradasAgg, saidasAgg] = await Promise.all([
            prisma.movement.aggregate({ where: { ...whereBase, type: 'ENTRADA' }, _sum: { quantity: true } }),
            prisma.movement.aggregate({ where: { ...whereBase, type: 'SAIDA' }, _sum: { quantity: true } }),
        ]);

        const entradas = entradasAgg._sum.quantity || 0;
        const saidas = saidasAgg._sum.quantity || 0;
        return { entradas, saidas, net: entradas - saidas };
    }
}
