import { Injectable, BadRequestException } from '@nestjs/common'
import { OrderRepo } from './order.repo'
import { CreateOrderBodyType, GetOrdersQueryType } from '@repo/schema'
import { DishRepo } from '@/modules/dish/dish.repo'
import { createPaginationResult } from '@/shared/utils/pagination.util'

import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly dishRepo: DishRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateStatus(orderId: string, status: string, userId?: string) {
    const order = await this.orderRepo.updateStatus(orderId, status as any) // Type cast if needed

    this.eventEmitter.emit('order.updated', {
      userId: order.userId, // Assuming order has userId
      orderId: order.id,
      status: order.status,
    })

    return order
  }

  async create({
    data,
    userId,
    tableId,
    roleName,
  }: {
    data: CreateOrderBodyType
    userId: string
    tableId?: string // From token (Guest)
    roleName: string
  }) {
    // If Guest, force tableId from token
    if (roleName === 'GUEST') {
      if (!tableId) throw new BadRequestException('Guest must belong to a table')
      data.tableId = tableId
    }

    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must have items')
    }

    // Fetch dishes to calculate price
    // Assuming findByIds or list with filter
    // For simplicity, fetching generic list or using Promise.all (not ideal for N items but okay for small orders)
    // Better: add findByIds to DishRepo. Or just iterate.

    let totalPrice = 0
    const orderItems = []

    for (const item of data.items) {
      const dish = await this.dishRepo.findById(item.dishId)
      if (!dish) throw new BadRequestException(`Dish ${item.dishId} not found`)

      const price = Number((dish as any).basePrice) || 0
      const itemTotal = price * item.quantity
      totalPrice += itemTotal

      orderItems.push({
        dishName: (dish as any).name || 'Unknown Dish',
        price: price,
        quantity: item.quantity,
        images: (dish as any).images || [],
        skuValue: item.note || '',
      })
    }

    return this.orderRepo.create({
      tableId: data.tableId || null,
      guestId: roleName === 'GUEST' ? userId : null,
      totalPrice,
      status: 'PENDING',
      items: orderItems,
    })
  }

  async list(query: GetOrdersQueryType) {
    const { data, total } = await this.orderRepo.list(query)
    return createPaginationResult(data, total, query)
  }
}
