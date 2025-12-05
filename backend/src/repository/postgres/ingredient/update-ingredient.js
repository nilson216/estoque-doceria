import { Prisma } from '@prisma/client';
import { prisma } from '../../../../prisma/prisma.js';
import { IngredientNotFoundError } from '../../../errors/ingredient.js';

// Normalize expiry date to UTC midnight to avoid timezone shifts
const normalizeExpiryDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) {
        return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
    }
    if (typeof value === 'string') {
        const [year, month, day] = value.split('-').map(Number);
        if (!year || !month || !day) return null;
        return new Date(Date.UTC(year, month - 1, day));
    }
    return null;
};

export class PostgresUpdateIngredientRepository {
    // accept optional tx (prisma client) so this method can participate in transactions
    // `userId` is required to ensure only the owner can update their ingredient.
    async execute(ingredientId, updateParams, userId = null, tx = prisma) {
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

            if (Object.prototype.hasOwnProperty.call(data, 'expiryDate')) {
                data.expiryDate = normalizeExpiryDate(data.expiryDate);
            }

            // If no updatable fields remain, return the current ingredient without performing an update
            if (Object.keys(data).length === 0) {
                return await tx.ingredient.findFirst({ where: { id: ingredientId, userId } });
            }

            // Ensure we only update ingredients owned by the user
            return await tx.ingredient.updateMany({
                where: { id: ingredientId, userId },
                data,
            }).then(async (res) => {
                if (res.count === 0) {
                    // no rows updated -> not found or not authorized
                    throw new Prisma.PrismaClientKnownRequestError('Not Found', 'P2025', '0');
                }
                return await tx.ingredient.findUnique({ where: { id: ingredientId } });
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new IngredientNotFoundError(ingredientId);
            }
            throw error;
        }
    }
}