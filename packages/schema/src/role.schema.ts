import z from 'zod';
import { PermissionSchema } from './permission.schema';

export const RoleSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdById: z.string().nullable(),
    updatedById: z.string().nullable(),
    deletedById: z.string().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type RoleType = z.infer<typeof RoleSchema>;

export const GetRolesQuerySchema = z
    .object({
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
    })
    .strict();

export const GetRoleDetailParamsSchema = z.object({
    roleId: z.string(),
});

export const GetRoleDetailResSchema = RoleSchema.extend({
    permissions: z.array(PermissionSchema),
});

export const GetRolesResSchema = z.object({
    data: z.array(RoleSchema),
    pagination: z.object({
        totalItems: z.number(),
        totalPages: z.number(),
        page: z.number(),
        limit: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    }),
});

export const CreateRoleBodySchema = RoleSchema.pick({
    name: true,
    description: true,
    isActive: true,
}).strict();

export const UpdateRoleBodySchema = RoleSchema.pick({
    name: true,
    description: true,
    isActive: true,
})
    .extend({
        permissionIds: z.array(z.string()),
    })
    .strict();

export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>;
export type GetRolesResType = z.infer<typeof GetRolesResSchema>;
export type GetRoleDetailParamsType = z.infer<typeof GetRoleDetailParamsSchema>;
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>;
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;
