import { z } from 'zod';

export const BanUserBodySchema = z.object({
    userId: z.string().uuid(),
    reason: z.string().optional(),
});

export type BanUserBodyType = z.infer<typeof BanUserBodySchema>;

export const UnbanUserBodySchema = z.object({
    userId: z.string().uuid(),
});

export type UnbanUserBodyType = z.infer<typeof UnbanUserBodySchema>;

export const ForceLogoutBodySchema = z.object({
    userId: z.string().uuid(),
});

export type ForceLogoutBodyType = z.infer<typeof ForceLogoutBodySchema>;
