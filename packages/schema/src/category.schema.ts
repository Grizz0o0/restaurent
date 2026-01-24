import { z } from 'zod';

export const DishCategorySchema = z.object({
    id: z.string(),
    parentCategoryId: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().optional(),
    description: z.string().optional(),
});

export type DishCategoryType = z.infer<typeof DishCategorySchema>;

export const GetCategoriesQuerySchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    parentCategoryId: z.string().optional(),
});

export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>;

export const CreateCategoryBodySchema = z.object({
    parentCategoryId: z.string().optional(),
    name: z.string(),
    description: z.string(),
    languageId: z.string(),
});

export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;

export const UpdateCategoryBodySchema = z.object({
    parentCategoryId: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    languageId: z.string().optional(),
});

export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;

export const CategoryDetailResSchema = DishCategorySchema.extend({
    children: z.array(DishCategorySchema).optional(),
}).nullable();

export type CategoryDetailResType = z.infer<typeof CategoryDetailResSchema>;

export const GetCategoriesResSchema = z.object({
    data: z.array(DishCategorySchema),
    pagination: z.object({
        totalItems: z.number(),
        totalPages: z.number(),
        page: z.number(),
        limit: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
});

export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>;
