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
        // If we have an initial movement and a userId, try to either
        // - re-use an existing ingredient with the same `name` and `unit` (summing the stock), or
        // - create a new ingredient + initial movement. Both branches run inside a single transaction.
        if (initialMovement && userId) {
            return await prisma.$transaction(async (tx) => {
                // try to find an existing ingredient with the same name and unit
                // normalize expiryDate for comparison: accept either a Date or a YYYY-MM-DD string
                // and convert to a UTC-midnight Date. Avoid passing an invalid Date object to Prisma.
                let expiry = null;
                const rawExpiry = createIngredientParams.expiryDate;
                if (rawExpiry) {
                    if (rawExpiry instanceof Date) {
                        if (!isNaN(rawExpiry.getTime())) {
                            expiry = new Date(Date.UTC(rawExpiry.getFullYear(), rawExpiry.getMonth(), rawExpiry.getDate()));
                        }
                    } else if (typeof rawExpiry === 'string') {
                        // prefer strict YYYY-MM-DD format from date inputs
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
                const existing = await tx.ingredient.findFirst({
                    where: {
                        name: createIngredientParams.name,
                        unit: createIngredientParams.unit,
                        expiryDate: expiry,
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