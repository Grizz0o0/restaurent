import { z } from 'zod';

export const DishSchema = z.object({
    id: z.string(),
    basePrice: z.number(),
    virtualPrice: z.number().optional(),
    supplierId: z.string(),
    images: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().optional(),
    description: z.string().optional(),
});

export type DishType = z.infer<typeof DishSchema>;

export const GetDishesQuerySchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
});

export type GetDishesQueryType = z.infer<typeof GetDishesQuerySchema>;

export const CreateDishBodySchema = z.object({
    basePrice: z.number(),
    virtualPrice: z.number().default(0),
    supplierId: z.string(),
    images: z.array(z.string()).default([]),
    categoryIds: z.array(z.string()).default([]),
    name: z.string(),
    description: z.string(),
    languageId: z.string(),
});

export type CreateDishBodyType = z.infer<typeof CreateDishBodySchema>;

export const UpdateDishBodySchema = z.object({
    basePrice: z.number().optional(),
    virtualPrice: z.number().optional(),
    supplierId: z.string().optional(),
    images: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    languageId: z.string().optional(),
});

export type UpdateDishBodyType = z.infer<typeof UpdateDishBodySchema>;

export const LinkDishCategorySchema = z.object({
    dishId: z.string(),
    categoryId: z.string(),
});

export type LinkDishCategoryType = z.infer<typeof LinkDishCategorySchema>;

export const DishDetailResSchema = DishSchema.extend({
    translations: z
        .array(
            z.object({
                languageId: z.string(),
                name: z.string(),
                description: z.string(),
            }),
        )
        .optional(),
    categories: z
        .array(
            z.object({
                id: z.string(),
            }),
        )
        .optional(),
}).nullable();

export type DishDetailResType = z.infer<typeof DishDetailResSchema>;

export const GetDishesResSchema = z.object({
    data: z.array(DishSchema),
    pagination: z.object({
        totalItems: z.number(),
        totalPages: z.number(),
        page: z.number(),
        limit: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
});

export type GetDishesResType = z.infer<typeof GetDishesResSchema>;
