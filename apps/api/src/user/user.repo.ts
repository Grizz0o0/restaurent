import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateUserBodyType, UpdateUserBodyType } from '@repo/schema'
import { UserStatus } from '@repo/constants'

@Injectable()
export class UserRepo {
  constructor(private readonly prismaService: PrismaService) {}

  count(where?: { roleId?: string; status?: string }) {
    return this.prismaService.user.count({
      where: {
        deletedAt: null,
        ...(where?.roleId && { roleId: where.roleId }),
        ...(where?.status && { status: where.status as UserStatus }),
      },
    })
  }

  list({
    skip,
    limit,
    roleId,
    status,
  }: {
    skip: number
    limit: number
    roleId?: string
    status?: string
  }) {
    return this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        ...(roleId && { roleId }),
        ...(status && { status: status as UserStatus }),
      },
      skip,
      take: limit,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  findById(id: string) {
    return this.prismaService.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })
  }

  create({ data, createdById }: { data: CreateUserBodyType; createdById: string }) {
    return this.prismaService.user.create({
      data: {
        ...data,
        status: data.status || UserStatus.ACTIVE,
        createdById,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })
  }

  update({ id, data, updatedById }: { id: string; data: UpdateUserBodyType; updatedById: string }) {
    return this.prismaService.user.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    })
  }

  delete({ id, deletedById }: { id: string; deletedById: string }) {
    return this.prismaService.user.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }
}
