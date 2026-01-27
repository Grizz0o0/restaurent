import { z } from 'zod';

export const createInventoryBody = z.object({
    restaurantId: z.string().uuid(),
    supplierId: z.string().uuid().optional(),
    itemName: z.string().min(1),
    quantity: z.number().min(0),
    unit: z.string().min(1),
    threshold: z.number().min(0).optional(),
});

export type CreateInventoryBodyType = z.infer<typeof createInventoryBody>;

export const updateInventoryBody = createInventoryBody
    .partial()
    .omit({ restaurantId: true });

export type UpdateInventoryBodyType = z.infer<typeof updateInventoryBody>;

export const linkDishBody = z.object({
    inventoryId: z.string().uuid(),
    dishId: z.string().uuid(),
    quantityUsed: z.number().min(0),
});

export type LinkDishBodyType = z.infer<typeof linkDishBody>;
