import { z } from 'zod';

export const createSupplierBody = z.object({
    name: z.string().min(1),
    logo: z.string().optional(),
    contactName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    rating: z.number().min(0).max(5).optional(),
    translations: z
        .array(
            z.object({
                languageId: z.string(),
                description: z.string().optional(),
            }),
        )
        .optional(),
});

export type CreateSupplierBodyType = z.infer<typeof createSupplierBody>;

export const updateSupplierBody = createSupplierBody.partial();

export type UpdateSupplierBodyType = z.infer<typeof updateSupplierBody>;
