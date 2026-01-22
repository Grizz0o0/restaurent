import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { ProfileService } from './profile.service'
import {
  ProfileDetailResSchema,
  UpdateProfileBodySchema,
  UpdateProfileBodyType,
} from '@repo/schema'
import { Context } from '@/trpc/context'

@Router({ alias: 'profile' })
@UseGuards(AuthenticationGuard)
export class ProfileRouter {
  constructor(private readonly profileService: ProfileService) {}

  @Query({
    output: ProfileDetailResSchema,
  })
  async getProfile(@Ctx() ctx: Context) {
    return this.profileService.getProfile(ctx.user!.userId)
  }

  @Mutation({
    input: UpdateProfileBodySchema,
    output: ProfileDetailResSchema,
  })
  async updateProfile(@Input() input: UpdateProfileBodyType, @Ctx() ctx: Context) {
    return this.profileService.updateProfile(ctx.user!.userId, input)
  }
}
