import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'

import { AddCartItemType, UpdateCartItemType, RemoveCartItemType } from '@repo/schema'

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        sku: {
          include: {
            dish: {
              include: {
                dishTranslations: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedItems = items.map((item) => {
      // Find English translation or fallback to first one, or just assume frontend handles it.
      // Ideally we should filter translations based on language, but for now let's just return structure matching schema.
      // The schema expects dish to have 'name', but dishTranslations has 'name'.
      // We might need to adjust the schema or the response.

      // For now, let's map it simply.
      const dishName = item.sku.dish.dishTranslations[0]?.name || 'Unknown Dish'

      return {
        id: item.id,
        quantity: item.quantity,
        skuId: item.skuId,
        sku: {
          id: item.sku.id,
          value: item.sku.value,
          price: item.sku.price.toNumber(),
          stock: item.sku.stock,
          images: item.sku.images,
          dish: {
            id: item.sku.dish.id,
            name: dishName,
            images: item.sku.dish.images,
          },
        },
      }
    })

    const total = formattedItems.reduce((acc, item) => acc + item.sku.price * item.quantity, 0)

    return {
      items: formattedItems,
      total,
    }
  }

  async addToCart(userId: string, input: AddCartItemType) {
    const { skuId, quantity } = input

    // Check if SKU exists
    const sku = await this.prisma.sKU.findUnique({
      where: { id: skuId },
    })
    if (!sku) {
      throw new NotFoundException('SKU not found')
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        userId,
        skuId,
      },
    })

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      })
    } else {
      return this.prisma.cartItem.create({
        data: {
          userId,
          skuId,
          quantity,
        },
      })
    }
  }

  async updateCartItem(userId: string, input: UpdateCartItemType) {
    const { itemId, quantity } = input

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    })

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Cart item not found')
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    })
  }

  async removeFromCart(userId: string, input: RemoveCartItemType) {
    const { itemId } = input

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    })

    if (!item || item.userId !== userId) {
      throw new NotFoundException('Cart item not found')
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    })
  }
}
