import { z } from 'zod';

export const ReservationStatusSchema = z.enum([
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
]);
export const ChannelSchema = z.enum(['WEB', 'APP', 'QR', 'POS', 'OTHER']);

export const ReservationSchema = z.object({
    id: z.string(),
    userId: z.string(),
    tableId: z.string(),
    reservationTime: z.date(),
    guests: z.number().int().positive(),
    status: ReservationStatusSchema,
    notes: z.string().nullable(),
    channel: ChannelSchema,
    guestInfo: z.any().optional(), // JSON
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const CreateReservationBodySchema = z.object({
    tableId: z.string(),
    reservationTime: z.string().datetime(), // Input as ISO string
    guests: z.number().int().positive(),
    notes: z.string().optional(),
    channel: ChannelSchema.default('WEB'),
    guestInfo: z.record(z.string(), z.any()).optional(),
    durationMinutes: z.number().optional().default(120), // Helper for checking availability
});

export const UpdateReservationBodySchema = z.object({
    reservationTime: z.string().datetime().optional(),
    guests: z.number().int().positive().optional(),
    status: ReservationStatusSchema.optional(),
    notes: z.string().optional(),
});

export const CheckAvailabilityQuerySchema = z.object({
    tableId: z.string(),
    startTime: z.string().datetime(),
    durationMinutes: z.number().default(120),
});

export const GetReservationsQuerySchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: ReservationStatusSchema.optional(),
    tableId: z.string().optional(),
    userId: z.string().optional(), // For user to see their own
});

export const GetReservationsResSchema = z.object({
    items: z.array(ReservationSchema),
    total: z.number(),
});

export type CreateReservationBodyType = z.infer<
    typeof CreateReservationBodySchema
>;
export type UpdateReservationBodyType = z.infer<
    typeof UpdateReservationBodySchema
>;
export type CheckAvailabilityQueryType = z.infer<
    typeof CheckAvailabilityQuerySchema
>;
export type GetReservationsQueryType = z.infer<
    typeof GetReservationsQuerySchema
>;
