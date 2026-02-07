import { Input, Mutation, Query, Router, UseMiddlewares, Ctx } from 'nestjs-trpc'
import { NotificationService } from './notification.service'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import {
  SendPushNotificationSchema,
  SendPushNotificationType,
  NotificationSchema,
  MarkAsReadSchema,
  MarkAsReadType,
} from '@repo/schema'
import { z } from 'zod'

@Router({ alias: 'notification' })
@UseMiddlewares(AuthMiddleware)
export class NotificationRouter {
  constructor(private readonly notificationService: NotificationService) {}

  @Mutation({
    input: SendPushNotificationSchema,
    output: SendPushNotificationSchema, // Simple echo or create response schema
  })
  async sendPush(@Input() input: SendPushNotificationType) {
    await this.notificationService.send(
      input.userId,
      input.title,
      input.body,
      'PROMOTION', // Default type
      input.data,
    )
    return input
  }

  @Query({
    output: z.array(NotificationSchema),
  })
  async getNotifications(@Ctx() ctx: { user: { id: string } }) {
    return this.notificationService.getNotifications(ctx.user.id)
  }

  @Mutation({
    input: MarkAsReadSchema,
    output: z.boolean(),
  })
  async markAsRead(@Input() input: MarkAsReadType, @Ctx() ctx: { user: { id: string } }) {
    return this.notificationService.markAsRead(ctx.user.id, input.id)
  }
}
