import { Injectable } from '@nestjs/common'
import { RoleName } from '@repo/constants'
import { PrismaService } from '@/shared/prisma'

@Injectable()
export class SharedRoleRepository {
  private clientRoleId: string | null = null
  private adminRoleId: string | null = null

  constructor(private readonly prismaService: PrismaService) {}
  private async getRole(roleName: string) {
    return await this.prismaService.role.findFirstOrThrow({
      where: {
        AND: [{ name: roleName }, { deletedAt: null }],
      },
    })
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role = await this.getRole(RoleName.Client)
    this.clientRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }
    const role = await this.getRole(RoleName.Admin)
    this.adminRoleId = role.id
    return role.id
  }
}
