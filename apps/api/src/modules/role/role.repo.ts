import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma'
import { CreateRoleBodyType, UpdateRoleBodyType } from '@repo/schema'
import { paginate } from '@/shared/utils/prisma.util'

@Injectable()
export class RoleRepo {
  constructor(private readonly prismaService: PrismaService) {}

  count(): Promise<number> {
    return this.prismaService.role.count({ where: { deletedAt: null } })
  }

  async list({ page, limit }: { page: number; limit: number }) {
    return paginate(
      this.prismaService.role,
      {
        where: { deletedAt: null },
      },
      { page, limit },
    )
  }

  findById(id: string) {
    return this.prismaService.role.findUnique({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          where: { deletedAt: null },
        },
      },
    })
  }

  create({ data, createdById }: { data: CreateRoleBodyType; createdById: string }) {
    return this.prismaService.role.create({
      data: { ...data, createdById },
    })
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: string
    data: UpdateRoleBodyType
    updatedById: string
  }) {
    if (data.permissionIds && data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: { id: { in: data.permissionIds } },
      })

      const deletedPermission = permissions.filter((p) => p.deletedAt)
      if (deletedPermission.length > 0) {
        const deletedPermissionIds = deletedPermission.map((p) => p.id).join(', ')
        throw new BadRequestException(`Permission is deleted:::${deletedPermissionIds}`)
      }
    }

    return this.prismaService.role.update({
      where: { id, deletedAt: null },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions:
          data.permissionIds && data.permissionIds.length > 0
            ? {
                set: data.permissionIds.map((p: string) => ({ id: p })),
              }
            : undefined,
        updatedById,
      },
      include: { permissions: true },
    })
  }

  async assignPermissions({
    roleId,
    permissionIds,
    updatedById,
  }: {
    roleId: string
    permissionIds: string[]
    updatedById: string
  }) {
    if (permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: { id: { in: permissionIds } },
      })
      const deletedPermission = permissions.filter((p) => p.deletedAt)
      if (deletedPermission.length > 0) {
        throw new BadRequestException('Some permissions are deleted')
      }
    }

    return this.prismaService.role.update({
      where: { id: roleId, deletedAt: null },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: { permissions: true },
    })
  }

  delete({ id, deletedById, isHard }: { id: string; deletedById: string; isHard?: boolean }) {
    return isHard
      ? this.prismaService.role.delete({ where: { id, deletedAt: null } })
      : this.prismaService.role.update({
          where: { id, deletedAt: null },
          data: { isActive: false, deletedAt: new Date(), deletedById },
        })
  }
}
