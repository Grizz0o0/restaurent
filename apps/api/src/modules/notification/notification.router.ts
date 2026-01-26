import { Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc'
import { NotificationService } from './notification.service'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware' // Or AdminRoleMiddleware if restricted
import { SendPushNotificationSchema, SendPushNotificationType } from '@repo/schema'

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
}
