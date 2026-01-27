import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { Prisma } from 'src/generated/prisma/client'
import { CreateInventoryBodyType, UpdateInventoryBodyType } from '@repo/schema'

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInventoryBodyType) {
    const { restaurantId, supplierId, ...rest } = data
    return this.prisma.inventory.create({
      data: {
        ...rest,
        restaurant: { connect: { id: restaurantId } },
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
      },
    })
  }

  async linkDish(inventoryId: string, dishId: string, quantityUsed: number) {
    return this.prisma.inventoryDish.create({
      data: {
        inventoryId,
        dishId,
        quantityUsed: new Prisma.Decimal(quantityUsed),
      },
    })
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.InventoryWhereUniqueInput
    where?: Prisma.InventoryWhereInput
    orderBy?: Prisma.InventoryOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.inventory.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        supplier: true,
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        dishes: {
          include: {
            dish: true,
          },
        },
        transactions: true,
      },
    })
  }

  async update(id: string, data: UpdateInventoryBodyType) {
    const { supplierId, ...rest } = data
    return this.prisma.inventory.update({
      where: { id },
      data: {
        ...rest,
        supplier: supplierId ? { connect: { id: supplierId } } : undefined,
      },
    })
  }

  async remove(id: string) {
    return this.prisma.inventory.delete({
      where: { id },
    })
  }
}
