import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  observacao: z.string().trim().max(1000).optional(),
  stockQuantity: z.number().nonnegative().optional(),
  expiryDate: z.coerce.date().optional(), // aceita ISO string e converte para Date
  // optional initial movement that can be created together with ingredient
  initialMovement: z.object({
    quantity: z.number().nonnegative(),
    type: z.enum(['ENTRADA','SAIDA']).optional(),
    observacao: z.string().trim().max(1000).optional(),
  }).optional(),
});

export const updateIngredientSchema = createIngredientSchema.partial();