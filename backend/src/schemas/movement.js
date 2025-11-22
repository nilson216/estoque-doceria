import { z } from 'zod';

// Accept numeric strings as well by coercing to number
export const createMovementSchema = z.object({
    ingredientId: z.string().uuid(),
    // userId is provided by auth middleware; not accepted in the body
    type: z.enum(['ENTRADA', 'SAIDA']),
    quantity: z.coerce.number().positive(),
    observacao: z.string().trim().max(1000).optional(),
});