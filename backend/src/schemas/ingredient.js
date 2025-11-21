import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  stockQuantity: z.number().nonnegative().optional(),
  expiryDate: z.coerce.date().optional(), // aceita ISO string e converte para Date
});

export const updateIngredientSchema = createIngredientSchema.partial();