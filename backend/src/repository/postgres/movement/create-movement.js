import { prisma } from '../../../../prisma/prisma.js';

/*
  PostgresCreateMovementRepository
  - Responsabilidade: persistir um registro de Movement usando Prisma.
  - API: `execute(movementParams, tx = prisma)` onde `tx` é um cliente Prisma opcional
    (permite participação em uma transação externa). `movementParams` deve conter
    { id, type, quantity, ingredientId, userId }.
  - Retorna: o objeto Movement criado pelo Prisma.
  - Observações: prefira sempre passar um `tx` do use-case quando chamado dentro de uma transação.
*/

export class PostgresCreateMovementRepository {
    // Recebe um prisma client opcional (para transações), mas aqui usamos o prisma padrão
    async execute(movementParams, tx = prisma) {
        return await tx.movement.create({
            data: {
                id: movementParams.id,
                type: movementParams.type, // 'ENTRADA' | 'SAIDA'
                quantity: movementParams.quantity,
                observacao: movementParams.observacao || null,
                ingredientId: movementParams.ingredientId,
                userId: movementParams.userId,
            },
        });
    }
}