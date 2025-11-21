import { prisma } from '../../../../prisma/prisma.js';

export class PostgresCreateMovementRepository {
    // Recebe um prisma client opcional (para transações), mas aqui usamos o prisma padrão
    async execute(movementParams, tx = prisma) {
        return await tx.movement.create({
            data: {
                id: movementParams.id,
                type: movementParams.type, // 'ENTRADA' | 'SAIDA'
                quantity: movementParams.quantity,
                ingredientId: movementParams.ingredientId,
                userId: movementParams.userId,
            },
        });
    }
}