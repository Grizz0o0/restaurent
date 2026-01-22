import z from 'zod';
import { UserSchema } from './auth.schema';
import { PermissionSchema } from './permission.schema';

// Profile detail response with role and permissions
export const ProfileDetailResSchema = UserSchema.omit({
    password: true,
    totpSecret: true,
}).extend({
    role: z
        .object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            permissions: z
                .array(
                    PermissionSchema.pick({
                        id: true,
                        name: true,
                        method: true,
                        path: true,
                        module: true,
                    }),
                )
                .optional(),
        })
        .optional(),
});

// Update profile body schema
export const UpdateProfileBodySchema = UserSchema.pick({
    name: true,
    phoneNumber: true,
})
    .extend({
        avatar: z.string().optional(),
    })
    .partial()
    .strict();

// Types
export type ProfileDetailResType = z.infer<typeof ProfileDetailResSchema>;
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>;
