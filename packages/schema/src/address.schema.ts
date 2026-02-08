import { z } from 'zod';

export const AddressSchema = z.object({
    id: z.string(),
    userId: z.string(),
    label: z.string(),
    recipientName: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
    isDefault: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type AddressType = z.infer<typeof AddressSchema>;

export const CreateAddressBodySchema = z.object({
    label: z.string().min(1, 'Label is required').max(100),
    recipientName: z.string().min(1, 'Recipient name is required').max(500),
    phoneNumber: z.string().min(1, 'Phone number is required').max(50),
    address: z.string().min(1, 'Address is required').max(500),
    isDefault: z.boolean().default(false),
});

export type CreateAddressBodyType = z.infer<typeof CreateAddressBodySchema>;

export const UpdateAddressBodySchema = CreateAddressBodySchema.partial().extend(
    {
        id: z.string(),
    },
);

export type UpdateAddressBodyType = z.infer<typeof UpdateAddressBodySchema>;

export const GetAddressesQuerySchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(50), // Higher default limit for addresses
});

export type GetAddressesQueryType = z.infer<typeof GetAddressesQuerySchema>;
