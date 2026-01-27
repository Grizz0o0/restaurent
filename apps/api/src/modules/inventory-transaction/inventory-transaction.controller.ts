import { Controller, Get, Query } from '@nestjs/common'
import { InventoryTransactionService } from './inventory-transaction.service'
import { Prisma } from 'src/generated/prisma/client'

@Controller('inventory-transactions')
export class InventoryTransactionController {
  constructor(private readonly service: InventoryTransactionService) {}

  @Get()
  findAll(
    @Query('inventoryId') inventoryId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const where: Prisma.InventoryTransactionWhereInput = {}
    if (inventoryId) {
      where.inventoryId = inventoryId
    }

    return this.service.findAll({
      where,
      skip: page ? (Number(page) - 1) * Number(limit) : undefined,
      take: limit ? Number(limit) : undefined,
      orderBy: { timestamp: 'desc' },
    })
  }
}
