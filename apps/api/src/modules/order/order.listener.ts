import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { SocketGateway } from '@/modules/socket/socket.gateway'

@Injectable()
export class OrderListener {
  constructor(private readonly socketGateway: SocketGateway) {}

  @OnEvent('order.updated')
  handleOrderUpdatedEvent(payload: { userId?: string; orderId: string; status: string }) {
    // Notify the specific user if userId is present
    if (payload.userId) {
      this.socketGateway.sendToUser(payload.userId, 'order_updated', payload)
    }

    // Also broadcast to admin room (if exists) or just generic "order_updated" for dashboard
    // For now, let's just focus on the customer experience
  }
}
