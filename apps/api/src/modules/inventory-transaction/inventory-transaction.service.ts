import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../shared/prisma/prisma.service'
import { TransactionReason, Prisma } from 'src/generated/prisma/client'

@Injectable()
export class InventoryTransactionService {
  constructor(private prisma: PrismaService) {}

  async logTransaction(
    inventoryId: string,
    changeQuantity: number | Prisma.Decimal,
    reason: TransactionReason,
  ) {
    return this.prisma.inventoryTransaction.create({
      data: {
        inventoryId,
        changeQuantity: new Prisma.Decimal(changeQuantity),
        reason,
      },
    })
  }

  async findAll(params: {
    skip?: number
    take?: number
    cursor?: Prisma.InventoryTransactionWhereUniqueInput
    where?: Prisma.InventoryTransactionWhereInput
    orderBy?: Prisma.InventoryTransactionOrderByWithRelationInput
  }) {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.inventoryTransaction.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        inventory: true,
      },
    })
  }
}
