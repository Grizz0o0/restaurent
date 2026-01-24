import { z } from 'zod';

export const RestaurantTableSchema = z.object({
    id: z.string(),
    name: z.string(), // tableNumber in DB? Schema has tableNumber?
    // Wait, DB has tableNumber, Schema has name. I should align them.
    // DB: tableNumber, capacity, qrCode, status
    // Schema: id, name, capacity, status, token
    // I will map name -> tableNumber, token -> qrCode
    tableNumber: z.string(), // Renamed from name
    capacity: z.number(),
    status: z.string(),
    qrCode: z.string(), // Renamed from token
    qrCodeUrl: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type RestaurantTableType = z.infer<typeof RestaurantTableSchema>;

export const CreateTableBodySchema = z.object({
    tableNumber: z.string(), // Renamed from name
    capacity: z.number().int().positive(),
    status: z.string().optional().default('available'), // Use DB enum default? 'AVAILABLE'
    qrCode: z.string().optional(), // Optional, generated if missing
});

export type CreateTableBodyType = z.infer<typeof CreateTableBodySchema>;

export const UpdateTableBodySchema = z.object({
    tableNumber: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    status: z.string().optional(),
    qrCode: z.string().optional(),
});

export type UpdateTableBodyType = z.infer<typeof UpdateTableBodySchema>;

export const GetTablesQuerySchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
});

export type GetTablesQueryType = z.infer<typeof GetTablesQuerySchema>;

export const GetTablesResSchema = z.object({
    data: z.array(RestaurantTableSchema),
    pagination: z.object({
        totalItems: z.number(),
        totalPages: z.number(),
        page: z.number(),
        limit: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
});

export type GetTablesResType = z.infer<typeof GetTablesResSchema>;
