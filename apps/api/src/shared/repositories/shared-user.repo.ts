import { Injectable } from '@nestjs/common'
import { PermissionType, RoleType, UserType } from '@repo/schema'
import { PrismaService } from 'src/shared/services/prisma.service'

type UserIncludeRolePermissionsType = UserType & {
  role: RoleType & { permissions: PermissionType[] }
}

import { Prisma } from '@repo/db'

export type WhereUniqueUserType = Prisma.UserWhereUniqueInput

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findUnique(where: WhereUniqueUserType): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where,
    })
  }

  findUniqueWithRolePermissions(
    where: WhereUniqueUserType,
  ): Promise<UserIncludeRolePermissionsType | null> {
    return this.prismaService.user.findUnique({
      where,
      include: {
        role: {
          include: {
            permissions: {
              where: { deletedAt: null },
            },
          },
        },
      },
    })
  }

  update(
    where: WhereUniqueUserType,
    data: Partial<Omit<UserType, 'id'>>,
  ): Promise<UserType | null> {
    return this.prismaService.user.update({
      where,
      data: { ...data, updatedAt: new Date() },
    })
  }
}
