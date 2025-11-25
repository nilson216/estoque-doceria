import { prisma } from '../../../../prisma/prisma.js';

export class PostgresGetMovementByIdRepository {
    async execute(id, userId = null) {
        // require authenticated user
        if (!userId) return null;

        // allow fetch when the movement was created by the user OR the movement's ingredient belongs to the user
        return await prisma.movement.findFirst({
            where: {
                id,
                OR: [
                    { userId },
                    { ingredient: { userId } },
                ],
            },
            include: { ingredient: true },
        });
    }
}
