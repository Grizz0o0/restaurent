import { Injectable } from '@nestjs/common'
import { CreatePermissionBodyType, UpdatePermissionBodyType } from '@repo/schema'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class PermissionRepo {
  constructor(private readonly prismaService: PrismaService) {}

  count(): Promise<number> {
    return this.prismaService.permission.count({ where: { deletedAt: null } })
  }

  list({ skip, limit }: { skip: number; limit: number }) {
    return this.prismaService.permission.findMany({
      where: { deletedAt: null },
      skip,
      take: limit,
    })
  }

  findById(id: string) {
    return this.prismaService.permission.findUnique({
      where: { id, deletedAt: null },
    })
  }

  create({ createdById, data }: { createdById: string; data: CreatePermissionBodyType }) {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: string
    updatedById: string
    data: UpdatePermissionBodyType
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ...rest } = data
    return this.prismaService.permission.update({
      where: { id, deletedAt: null },
      data: { ...rest, updatedById },
    })
  }

  delete({ id, deletedById, isHard }: { id: string; deletedById: string; isHard?: boolean }) {
    return isHard
      ? this.prismaService.permission.delete({ where: { id } })
      : this.prismaService.permission.update({
          where: { id, deletedAt: null },
          data: { deletedAt: new Date(), deletedById },
        })
  }
}
