import { prisma } from '../../../../prisma/prisma.js';

export class PostgresDeleteMovementRepository {
    async execute(id) {
        return await prisma.movement.delete({ where: { id } });
    }
}
