import { Injectable, BadRequestException } from '@nestjs/common'
import { OrderRepo } from './order.repo'
import { PrismaService } from '@/shared/prisma/prisma.service'

import { CreateOrderBodyType, GetOrdersQueryType } from '@repo/schema'
import { DishRepo } from '@/modules/dish/dish.repo'
import { createPaginationResult } from '@/shared/utils/pagination.util'

import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly dishRepo: DishRepo,
    private readonly prismaService: PrismaService,
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

  async createFromCart({
    userId,
    tableId,
    roleName,
    promotionCode,
    guestInfo,
  }: {
    userId: string
    tableId?: string
    roleName: string
    promotionCode?: string
    guestInfo?: any
  }) {
    // If Guest, force tableId from token
    if (roleName === 'GUEST') {
      if (!tableId) throw new BadRequestException('Guest must belong to a table')
    }

    return this.prismaService.$transaction(async (tx) => {
      // 1. Fetch Cart Items
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: {
          sku: {
            include: {
              dish: {
                include: { dishTranslations: true },
              },
            },
          },
        },
      })

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty')
      }

      // 2. Calculate Subtotal & Prepare Snapshots
      let subTotal = 0
      const snapshots = []

      for (const item of cartItems) {
        const price = Number(item.sku.price)
        const quantity = item.quantity
        const itemTotal = price * quantity
        subTotal += itemTotal

        // Find English translation or fallback
        const dishName = item.sku.dish.dishTranslations[0]?.name || 'Unknown Dish'

        snapshots.push({
          dishName: dishName,
          price: item.sku.price, // Keep as Decimal or convert to number depending on repo/prisma handling? Repo expects number usually or Prisma Decimal.
          // Check OrderRepo.create implementation later. Assuming it handles what we pass or we construct relation here.
          // Actually, OrderRepo.create takes a custom structure.
          // But here we are using transaction, maybe better to use prisma directly or use logic similar to OrderRepo.
          // Let's rely on constructing data for Prisma create directly for atomicity or use OrderRepo if it supports transaction passing (it doesn't seem to).
          // So I will implement creation logic here using `tx`.
          quantity: quantity,
          images: item.sku.images,
          skuValue: item.sku.value,
          skuId: item.skuId,
        })
      }

      // 3. Apply Promotion
      let discount = 0
      let promotionId = null

      if (promotionCode) {
        // We reuse PromotionService logic but need to inject it or replicate it.
        // Since PromotionService uses `this.prisma`, we might need to be careful if we want it to verify against the DB using `tx`.
        // PromotionService.apply is readonly (checks), so it's mostly fine to use the main instance,
        // but if we want to lock promotion usage, we definitely need `tx`.
        // For now, let's call PromotionService.apply. Ideally, we should refactor PromotionService to accept a prisma client or transaction.
        // Or just re-implement check here for safety.

        const promotion = await tx.promotion.findUnique({ where: { code: promotionCode } })

        if (!promotion) throw new BadRequestException('Invalid promotion code')

        // Simple validation replications
        const now = new Date()
        if (now < promotion.validFrom || now > promotion.validTo) {
          throw new BadRequestException('Promotion is expired or not yet valid')
        }
        if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
          throw new BadRequestException('Promotion usage limit exceeded')
        }
        if (promotion.minOrderValue && subTotal < Number(promotion.minOrderValue)) {
          throw new BadRequestException(
            `Minimum order value of ${Number(promotion.minOrderValue)} required`,
          )
        }

        if (promotion.type === 'FIXED') {
          discount = Number(promotion.amount)
        } else if (promotion.type === 'PERCENTAGE') {
          if (promotion.percentage) {
            discount = (subTotal * Number(promotion.percentage)) / 100
          }
        }

        if (discount > subTotal) discount = subTotal

        promotionId = promotion.id

        // Increment usage
        await tx.promotion.update({
          where: { id: promotion.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      // 4. Create Order
      const totalAmount = subTotal - discount

      const order = await tx.order.create({
        data: {
          userId: roleName === 'GUEST' ? null : userId,
          guestId: roleName === 'GUEST' ? userId : null,
          tableId: tableId || null,
          restaurantId: null, // Should infer from table/user? For now null or fetch default.
          totalAmount: totalAmount,
          discount: discount,
          status: 'PENDING_CONFIRMATION', // Enum
          channel: 'WEB', // Default
          promotionId: promotionId,
          guestInfo: guestInfo || undefined,
          items: {
            create: snapshots,
          },
        },
      })

      // 5. Clear Cart
      await tx.cartItem.deleteMany({
        where: { userId },
      })

      // Emit event
      this.eventEmitter.emit('order.created', {
        orderId: order.id,
        userId: userId,
        totalAmount: totalAmount,
      })

      return order
    })
  }

  async list(query: GetOrdersQueryType) {
    const { data, total } = await this.orderRepo.list(query)
    return createPaginationResult(data, total, query)
  }
}
