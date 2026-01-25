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
        userTranslations: {
          select: {
            languageId: true,
            address: true,
            description: true,
          },
        },
      },
    })
  }

  async updateProfile({ userId, data }: { userId: string; data: UpdateProfileBodyType }) {
    const { translations, ...rest } = data

    return this.prismaService.$transaction(async (tx) => {
      if (translations) {
        for (const t of translations) {
          const existing = await tx.userTranslation.findFirst({
            where: { userId, languageId: t.languageId },
          })

          if (existing) {
            await tx.userTranslation.update({
              where: { id: existing.id },
              data: {
                address: t.address,
                description: t.description,
              },
            })
          } else {
            await tx.userTranslation.create({
              data: {
                userId,
                languageId: t.languageId,
                address: t.address,
                description: t.description,
              },
            })
          }
        }
      }

      return tx.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          ...rest,
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
          userTranslations: {
            select: {
              languageId: true,
              address: true,
              description: true,
            },
          },
        },
      })
    })
  }
}
