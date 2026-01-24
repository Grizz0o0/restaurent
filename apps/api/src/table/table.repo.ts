import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'
import { CreateTableBodyType, UpdateTableBodyType, GetTablesQueryType } from '@repo/schema'
import { paginate } from '@/shared/utils/prisma.util'

@Injectable()
export class TableRepo {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateTableBodyType & { createdById: string; restaurantId: string; qrCode: string },
  ) {
    return this.prisma.restaurantTable.create({
      data: {
        ...data,
      },
    })
  }

  async update(id: string, data: UpdateTableBodyType & { updatedById: string }) {
    return this.prisma.restaurantTable.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, deletedById: string) {
    // Hard delete or Soft delete? Table usually can be soft deleted.
    // Assuming RestaurantTable has deletedAt (based on schema convention, though I should check model)
    // Checking previous softDeleteExtension, RestaurantTable IS included.
    return this.prisma.extended.restaurantTable.softDelete({ id })
  }

  async findById(id: string) {
    return this.prisma.restaurantTable.findUnique({
      where: { id },
    })
  }

  async list(query: GetTablesQueryType) {
    const { page, limit, search } = query
    const where = {
      deletedAt: null,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    }

    return paginate(
      this.prisma.restaurantTable,
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
      { page, limit },
    )
  }
}
