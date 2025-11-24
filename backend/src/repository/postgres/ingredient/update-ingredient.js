import { Prisma } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma.js';
import { IngredientNotFoundError } from '../../../errors/ingredient.js';

export class PostgresUpdateIngredientRepository {
    // accept optional tx (prisma client) so this method can participate in transactions
    async execute(ingredientId, updateParams, tx = prisma) {
        try {
            // Allow stockQuantity updates only when caller explicitly passes
            // a special flag `__allowStockUpdate` in updateParams. This prevents
            // clients from updating stock directly while allowing internal
            // use-cases (like CreateMovementUseCase) to change stock atomically.
            const data = { ...updateParams };
            const allowStock = Boolean(data.__allowStockUpdate);
            if (allowStock) {
                // remove internal flag before persisting
                delete data.__allowStockUpdate;
            } else if (Object.prototype.hasOwnProperty.call(data, 'stockQuantity')) {
                // strip stock updates from external callers
                delete data.stockQuantity;
            }

            // If no updatable fields remain, return the current ingredient without performing an update
            if (Object.keys(data).length === 0) {
                return await tx.ingredient.findUnique({ where: { id: ingredientId } });
            }

            return await tx.ingredient.update({
                where: { id: ingredientId },
                data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new IngredientNotFoundError(ingredientId);
            }
            throw error;
        }
    }
}