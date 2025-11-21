import { prisma } from '../../../../prisma/prisma.js';

export class PostgresCreateIngredientRepository {
    async execute(createIngredientParams) {
        return await prisma.ingredient.create({
            data: {
                id: createIngredientParams.id,
                name: createIngredientParams.name,
                unit: createIngredientParams.unit,
                stockQuantity: createIngredientParams.stockQuantity ?? 0,
                expiryDate: createIngredientParams.expiryDate ?? null,
            },
        });
    }
}