import { Input, Mutation, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { AdminService } from './admin.service'
import {
  BanUserBodySchema,
  BanUserBodyType,
  UnbanUserBodySchema,
  UnbanUserBodyType,
  ForceLogoutBodySchema,
  ForceLogoutBodyType,
} from '@repo/schema'
import { RoleName } from '@repo/constants'
import { RolesGuard } from 'src/shared/guards/roles.guard'
import { Roles } from 'src/shared/decorators/roles.decorator'

@Router({ alias: 'admin' })
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles(RoleName.Admin)
export class AdminRouter {
  constructor(private readonly adminService: AdminService) {}

  @Mutation({ input: BanUserBodySchema })
  async banUser(@Input() input: BanUserBodyType) {
    return this.adminService.banUser(input.userId)
  }

  @Mutation({ input: UnbanUserBodySchema })
  async unbanUser(@Input() input: UnbanUserBodyType) {
    return this.adminService.unbanUser(input.userId)
  }

  @Mutation({ input: ForceLogoutBodySchema })
  async forceLogout(@Input() input: ForceLogoutBodyType) {
    return this.adminService.forceLogout(input.userId)
  }
}
