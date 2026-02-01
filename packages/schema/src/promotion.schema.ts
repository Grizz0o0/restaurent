import { z } from 'zod';

export const PromotionTypeSchema = z.enum(['FIXED', 'PERCENTAGE']);

export const CreatePromotionSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    type: PromotionTypeSchema,
    amount: z.number().min(0),
    percentage: z.number().min(0).max(100).optional(),
    minOrderValue: z.number().min(0).optional(),
    validFrom: z.string().datetime(),
    validTo: z.string().datetime(),
    usageLimit: z.number().int().min(1).optional(),
    applicableTo: z.string().optional(),
});

export const UpdatePromotionSchema = CreatePromotionSchema.partial();

export const ApplyPromotionSchema = z.object({
    code: z.string().min(1),
    orderValue: z.number().min(0),
});

export const PromotionSchema = z.object({
    id: z.string(),
    code: z.string(),
    type: PromotionTypeSchema,
    amount: z
        .custom<any>(
            (val) =>
                typeof val === 'object' && val !== null && 'toNumber' in val,
        )
        .transform((v) => v.toNumber())
        .or(z.number()),
    percentage: z
        .custom<any>(
            (val) =>
                typeof val === 'object' && val !== null && 'toNumber' in val,
        )
        .transform((v) => v.toNumber())
        .or(z.number())
        .nullable(),
    minOrderValue: z
        .custom<any>(
            (val) =>
                typeof val === 'object' && val !== null && 'toNumber' in val,
        )
        .transform((v) => v.toNumber())
        .or(z.number())
        .nullable(),
    validFrom: z.date(),
    validTo: z.date(),
    usageLimit: z.number().nullable(),
    usedCount: z.number(),
    applicableTo: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const ApplyPromotionResSchema = z.object({
    isValid: z.boolean(),
    promotionId: z.string(),
    code: z.string(),
    discountAmount: z.number(),
    finalAmount: z.number(),
});

export type CreatePromotionType = z.infer<typeof CreatePromotionSchema>;
export type UpdatePromotionType = z.infer<typeof UpdatePromotionSchema>;
export type ApplyPromotionType = z.infer<typeof ApplyPromotionSchema>;
export type ApplyPromotionResType = z.infer<typeof ApplyPromotionResSchema>;
