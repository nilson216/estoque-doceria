import { Prisma } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma.js';
import { IngredientNotFoundError } from '../../../errors/ingredient.js';

export class PostgresUpdateIngredientRepository {
    // accept optional tx (prisma client) so this method can participate in transactions
    async execute(ingredientId, updateParams, tx = prisma) {
        try {
            return await tx.ingredient.update({
                where: { id: ingredientId },
                data: updateParams,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new IngredientNotFoundError(ingredientId);
            }
            throw error;
        }
    }
}