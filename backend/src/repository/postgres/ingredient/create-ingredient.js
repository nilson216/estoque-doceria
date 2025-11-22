import { prisma } from '../../../../prisma/prisma.js';

/*
    PostgresCreateIngredientRepository
    - Responsabilidade: persistir um novo Ingredient e, opcionalmente, criar um Movement inicial
        em uma única transação quando `initialMovement` for fornecido e existir `userId`.
    - API: `execute(createIngredientParams, userId = null)` onde `createIngredientParams`
        pode incluir um objeto `initialMovement`: { type, quantity, id? }.
    - Comportamento: se `initialMovement` e `userId` estiverem presentes, executa uma transação Prisma
        que cria o ingrediente e a movimentação atomically. Caso contrário, cria apenas o ingrediente.
    - Observações: os chamadores (controllers/use-cases) devem passar o `userId` autenticado quando
        esperam que a movimentação inicial seja registrada.
*/

export class PostgresCreateIngredientRepository {
    // createIngredientParams: { id, name, unit, stockQuantity, expiryDate, initialMovement? }
    // userId: optional user performing the action (used when creating initial movement)
    async execute(createIngredientParams, userId = null) {
        const initialMovement = createIngredientParams.initialMovement || null;
        // If we have an initial movement and a userId, create both inside a transaction
        if (initialMovement && userId) {
            return await prisma.$transaction(async (tx) => {
                const created = await tx.ingredient.create({
                    data: {
                        id: createIngredientParams.id,
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        stockQuantity: createIngredientParams.stockQuantity ?? 0,
                        observacao: createIngredientParams.observacao ?? null,
                        expiryDate: createIngredientParams.expiryDate ?? null,
                    },
                });

                await tx.movement.create({
                    data: {
                        id: initialMovement.id || undefined,
                        type: initialMovement.type || 'ENTRADA',
                        quantity: initialMovement.quantity,
                        observacao: initialMovement.observacao ?? null,
                        ingredientId: created.id,
                        userId: userId,
                    },
                });

                return created;
            });
        }

        // Fallback: simple create
        return await prisma.ingredient.create({
            data: {
                id: createIngredientParams.id,
                name: createIngredientParams.name,
                unit: createIngredientParams.unit,
                stockQuantity: createIngredientParams.stockQuantity ?? 0,
                observacao: createIngredientParams.observacao ?? null,
                expiryDate: createIngredientParams.expiryDate ?? null,
            },
        });
    }
}