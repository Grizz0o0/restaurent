import { z } from 'zod';

export const SendPushNotificationSchema = z.object({
    userId: z.string().uuid(),
    title: z.string().min(1),
    body: z.string().min(1),
    data: z.record(z.string(), z.any()).optional(),
});

export type SendPushNotificationType = z.infer<
    typeof SendPushNotificationSchema
>;
