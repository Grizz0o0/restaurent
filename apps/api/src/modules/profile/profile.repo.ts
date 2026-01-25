import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'
import { UpdateProfileBodyType } from '@repo/schema'

@Injectable()
export class ProfileRepo {
  constructor(private readonly prismaService: PrismaService) {}

  findByIdWithRoleAndPermissions(userId: string) {
    return this.prismaService.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        status: true,
        roleId: true,
        failedLoginAttempts: true,
        lockedAt: true,
        createdById: true,
        updatedById: true,
        deletedById: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                method: true,
                path: true,
                module: true,
              },
            },
          },
        },
      },
    })
  }

  updateProfile({ userId, data }: { userId: string; data: UpdateProfileBodyType }) {
    return this.prismaService.user.update({
      where: { id: userId, deletedAt: null },
      data: {
        ...data,
        updatedById: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        avatar: true,
        status: true,
        roleId: true,
        failedLoginAttempts: true,
        lockedAt: true,
        createdById: true,
        updatedById: true,
        deletedById: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            permissions: {
              where: { deletedAt: null },
              select: {
                id: true,
                name: true,
                method: true,
                path: true,
                module: true,
              },
            },
          },
        },
      },
    })
  }
}
