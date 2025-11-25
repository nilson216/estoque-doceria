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
    async execute(createIngredientParams, userId = null) {
        const initialMovement = createIngredientParams.initialMovement || null;
        if (!userId) {
            throw new Error('userId is required to create an ingredient');
        }
        if (initialMovement && userId) {
            return await prisma.$transaction(async (tx) => {
                let expiry = null;
                const rawExpiry = createIngredientParams.expiryDate;
                if (rawExpiry) {
                    if (rawExpiry instanceof Date) {
                        if (!isNaN(rawExpiry.getTime())) {
                            expiry = new Date(Date.UTC(rawExpiry.getFullYear(), rawExpiry.getMonth(), rawExpiry.getDate()));
                        }
                    } else if (typeof rawExpiry === 'string') {
                        const m = rawExpiry.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                        if (m) {
                            expiry = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00.000Z`);
                        } else {
                            const parsed = new Date(rawExpiry);
                            if (!isNaN(parsed.getTime())) {
                                expiry = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
                            }
                        }
                    }
                }
                const owner = userId ?? null
                const existing = await tx.ingredient.findFirst({
                    where: {
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        expiryDate: expiry,
                        userId: owner,
                    },
                });

                if (existing) {
                    // Update the existing ingredient's stock by adding the incoming quantity
                    const updated = await tx.ingredient.update({
                        where: { id: existing.id },
                        data: {
                            stockQuantity: (existing.stockQuantity || 0) + (initialMovement.quantity || 0),
                            // preserve/update observacao only if provided on the ingredient create params
                            observacao: createIngredientParams.observacao ?? existing.observacao ?? null,
                        },
                    });

                    // record a movement referencing the existing ingredient
                    await tx.movement.create({
                        data: {
                            id: initialMovement.id || undefined,
                            type: initialMovement.type || 'ENTRADA',
                            quantity: initialMovement.quantity,
                            observacao: initialMovement.observacao ?? null,
                            ingredientId: existing.id,
                            userId: userId,
                        },
                    });

                    return updated;
                }

                // No existing ingredient found — create a new one and the initial movement
                const created = await tx.ingredient.create({
                    data: {
                        id: createIngredientParams.id,
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        stockQuantity: createIngredientParams.stockQuantity ?? 0,
                        observacao: createIngredientParams.observacao ?? null,
                        expiryDate: expiry,
                        userId: owner,
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

        // Fallback: simple create (assign owner when provided)
        return await prisma.ingredient.create({
            data: {
                id: createIngredientParams.id,
                name: createIngredientParams.name,
                unit: createIngredientParams.unit,
                stockQuantity: createIngredientParams.stockQuantity ?? 0,
                observacao: createIngredientParams.observacao ?? null,
                expiryDate: createIngredientParams.expiryDate ?? null,
                userId: userId ?? null,
            },
        });
    }
}