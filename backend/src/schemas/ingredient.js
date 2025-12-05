import { z } from 'zod';

export const createIngredientSchema = z.object({
  name: z.string().trim().min(1),
  unit: z.string().trim().min(1),
  observacao: z.string().trim().max(1000).optional(),
  stockQuantity: z.number().nonnegative().optional(),
  // Accepts either a Date or a string in YYYY-MM-DD to avoid timezone shifts
  expiryDate: z
    .union([
      z.date(),
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: 'expiryDate must be in format YYYY-MM-DD',
        }),
    ])
    .optional(),
  initialMovement: z.object({
    quantity: z.number().nonnegative(),
    type: z.enum(['ENTRADA','SAIDA']).optional(),
    observacao: z.string().trim().max(1000).optional(),
  }).optional(),
});

export const updateIngredientSchema = createIngredientSchema.partial();