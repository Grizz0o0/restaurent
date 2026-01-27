import { z } from 'zod';

export const LanguageSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const CreateLanguageBodySchema = z.object({
    id: z.string().min(2).max(10), // e.g., 'en', 'vi'
    name: z.string().min(1).max(500),
});

export const UpdateLanguageBodySchema = z.object({
    name: z.string().min(1).max(500).optional(),
});

export const LanguageResponseSchema = LanguageSchema;

export const GetLanguagesQuerySchema = z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
    search: z.string().optional(),
});

export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>;
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>;
export type GetLanguagesQueryType = z.infer<typeof GetLanguagesQuerySchema>;
