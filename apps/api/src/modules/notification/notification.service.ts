import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { SocketGateway } from '../socket/socket.gateway'
import { EmailService } from '@/shared/services/email.service'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { OnEvent } from '@nestjs/event-emitter'
import envConfig from '@/shared/config'
@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const projectId = envConfig.FIREBASE_PROJECT_ID
      const privateKey = envConfig.FIREBASE_PRIVATE_KEY
      const clientEmail = envConfig.FIREBASE_CLIENT_EMAIL

      if (!projectId || !privateKey || !clientEmail) {
        this.logger.warn(
          'Missing Firebase credentials (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL). Skipping Firebase initialization.',
        )
        return
      }

      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            clientEmail,
          }),
        })
        this.logger.log('Firebase Admin initialized successfully')
      } catch (error) {
        this.logger.warn(
          'Failed to initialize Firebase Admin. Push notifications will not work.',
          error,
        )
      }
    }
  }

  async send(
    userId: string,
    title: string,
    body: string,
    type: 'ORDER_UPDATE' | 'PROMOTION' | 'LOW_STOCK',
    data?: any,
  ) {
    // 1. Save to Database
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: type, // Ensure type matches enum
        content: body,
        channel: 'APP', // Default channel for DB log
      },
    })

    // 2. Real-time (Socket.io)
    this.socketGateway.sendToUser(userId, 'notification', {
      id: notification.id,
      title,
      body,
      type,
      data,
      createdAt: notification.createdAt,
    })

    // 3. Push Notification (FCM)
    const devices = await this.prisma.device.findMany({
      where: { userId, isActive: true, fcmToken: { not: null } },
    })

    const tokens = devices.map((d) => d.fcmToken).filter((t) => t !== null)
    if (tokens.length > 0) {
      try {
        await admin.messaging().sendEachForMulticast({
          tokens,
          notification: { title, body },
          data: data ? { ...data, type } : { type },
        })
      } catch (error) {
        this.logger.error(`Failed to send FCM to user ${userId}`, error)
      }
    }

    // 4. Email (Optional logic based on priority)
    // Fetch user email if not passed
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (user && user.email) {
      await this.emailService.sendNotification(user.email, title, body)
    }
  }

  @OnEvent('order.updated')
  async handleOrderUpdate(payload: { userId: string; orderId: string; status: string }) {
    await this.send(
      payload.userId,
      'Cập nhật đơn hàng',
      `Đơn hàng #${payload.orderId} của bạn đã chuyển sang trạng thái: ${payload.status}`,
      'ORDER_UPDATE',
      { orderId: payload.orderId },
    )
  }

  @OnEvent('promotion.created') // Example event
  async handlePromotionCreated(payload: { code: string; description: string; userIds?: string[] }) {
    if (payload.userIds) {
      for (const userId of payload.userIds) {
        await this.send(
          userId,
          'Mã khuyến mãi mới!',
          `Nhập mã ${payload.code} để nhận ưu đãi: ${payload.description}`,
          'PROMOTION',
        )
      }
    }
  }

  @OnEvent('inventory.low_stock')
  async handleLowStock(payload: {
    inventoryId: string
    itemName: string
    currentStock: number
    threshold: number
  }) {
    this.logger.warn(
      `Low stock alert for ${payload.itemName}: ${payload.currentStock} (Threshold: ${payload.threshold})`,
    )

    // Find Admins/Managers to notify
    // Assuming 'ADMIN' and 'MANAGER' roles exist.
    // Optimized: Fetch users where role.name in ['ADMIN', 'MANAGER']
    const admins = await this.prisma.user.findMany({
      where: {
        role: {
          name: { in: ['ADMIN', 'MANAGER'] },
        },
        status: 'ACTIVE',
      },
      select: { id: true },
    })

    for (const admin of admins) {
      await this.send(
        admin.id,
        'Cảnh báo tồn kho!',
        `Nguyên liệu ${payload.itemName} sắp hết. Tồn kho hiện tại: ${payload.currentStock} ${payload.threshold ? `(Ngưỡng: ${payload.threshold})` : ''}`,
        'LOW_STOCK',
        { inventoryId: payload.inventoryId },
      )
    }
  }

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to 20 recent notifications
    })

    return notifications.map((n) => ({
      id: n.id,
      title: this.getTitleFromType(n.type),
      content: n.content,
      type: n.type,
      isRead: !!n.readAt,
      createdAt: n.createdAt,
      data: undefined,
    }))
  }

  private getTitleFromType(type: string): string {
    switch (type) {
      case 'ORDER_UPDATE':
        return 'Cập nhật đơn hàng'
      case 'PROMOTION':
        return 'Khuyến mãi'
      case 'LOW_STOCK':
        return 'Cảnh báo tồn kho'
      case 'RECOMMENDATION':
        return 'Gợi ý món ăn'
      default:
        return 'Thông báo mới'
    }
  }

  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      await this.prisma.notification.update({
        where: { id: notificationId, userId },
        data: { readAt: new Date() },
      })
    } else {
      await this.prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      })
    }
    return true
  }
}
