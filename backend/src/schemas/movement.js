import { z } from 'zod';

export const createMovementSchema = z.object({
    ingredientId: z.string().uuid(),
    // userId is provided by auth middleware; not accepted in the body
    type: z.enum(['ENTRADA', 'SAIDA']),
    quantity: z.number().positive(),
});