import { prisma } from '../../../../prisma/prisma.js';

export class PostgresGetIngredientByIdRepository {
    async execute(ingredientId) {
        return await prisma.ingredient.findUnique({
            where: { id: ingredientId },
        });
    }
}