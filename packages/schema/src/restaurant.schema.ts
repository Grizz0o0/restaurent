import { z } from 'zod';

export const RestaurantSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    phone: z.string().nullable(),
    logo: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const CreateRestaurantBodySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().optional(),
    logo: z.string().optional(),
});

export const UpdateRestaurantBodySchema = CreateRestaurantBodySchema.partial();

export const StaffPositionSchema = z.enum([
    'MANAGER',
    'WAITER',
    'CHEF',
    'CASHIER',
    'OTHER',
]);

export const AssignStaffBodySchema = z.object({
    restaurantId: z.string(),
    userId: z.string(),
    position: StaffPositionSchema,
});

export const RemoveStaffBodySchema = z.object({
    restaurantId: z.string(),
    userId: z.string(),
});

export const GetRestaurantsQuerySchema = z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
    search: z.string().optional(),
});

export const GetRestaurantsResSchema = z.object({
    items: z.array(RestaurantSchema),
    total: z.number(),
});

export type CreateRestaurantBodyType = z.infer<
    typeof CreateRestaurantBodySchema
>;
export type UpdateRestaurantBodyType = z.infer<
    typeof UpdateRestaurantBodySchema
>;
export type AssignStaffBodyType = z.infer<typeof AssignStaffBodySchema>;
export type RemoveStaffBodyType = z.infer<typeof RemoveStaffBodySchema>;
export type GetRestaurantsQueryType = z.infer<typeof GetRestaurantsQuerySchema>;
