import { prisma } from '../../../../prisma/prisma.js';

export class PostgresDeleteMovementRepository {
    async execute(id, userId = null) {
        // require authenticated user
        if (!userId) return null;

        // Only delete if movement belongs to the user OR the movement's ingredient belongs to the user
        const result = await prisma.movement.deleteMany({
            where: {
                id,
                OR: [
                    { userId },
                    { ingredient: { userId } },
                ],
            },
        });

        // If nothing was deleted, log context to help debugging (which user owns movement/ingredient)
        if (result.count === 0) {
            try {
                const mv = await prisma.movement.findUnique({
                    where: { id },
                    include: { ingredient: true },
                });
                if (!mv) {
                    console.warn(`[DeleteMovement] movement not found id=${id} (userId=${userId})`);
                } else {
                    console.warn(`[DeleteMovement] denied id=${id} requestUser=${userId} movementUser=${mv.userId} ingredientUser=${mv.ingredient?.userId || 'null'}`);
                }
            } catch (logErr) {
                console.error('[DeleteMovement] failed to fetch movement for debug logging', logErr);
            }
            return null;
        }

        // return truthy if something was deleted
        return { deleted: true };
    }
}
