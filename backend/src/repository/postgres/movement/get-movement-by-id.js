import { prisma } from '../../../../prisma/prisma.js';

export class PostgresGetMovementByIdRepository {
    async execute(id) {
        return await prisma.movement.findUnique({ where: { id } });
    }
}
