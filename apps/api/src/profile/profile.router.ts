import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { ProfileService } from './profile.service'
import {
  ProfileDetailResSchema,
  UpdateProfileBodySchema,
  UpdateProfileBodyType,
} from '@repo/schema'
import { Context } from 'src/trpc/context'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { REQUEST_USER_KEY } from '@repo/constants'

@Router({ alias: 'profile' })
@UseGuards(AuthenticationGuard)
export class ProfileRouter {
  constructor(private readonly profileService: ProfileService) {}

  @Query({
    output: ProfileDetailResSchema,
  })
  async getProfile(@Ctx() ctx: Context) {
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.profileService.getProfile(user.userId)
  }

  @Mutation({
    input: UpdateProfileBodySchema,
    output: ProfileDetailResSchema,
  })
  async updateProfile(@Input() input: UpdateProfileBodyType, @Ctx() ctx: Context) {
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.profileService.updateProfile(user.userId, input)
  }
}
