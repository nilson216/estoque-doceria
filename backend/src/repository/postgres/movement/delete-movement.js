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

        // return truthy if something was deleted
        return result.count > 0 ? { deleted: true } : null;
    }
}
