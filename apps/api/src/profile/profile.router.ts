import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { ProfileService } from './profile.service'
import {
  ProfileDetailResSchema,
  UpdateProfileBodySchema,
  UpdateProfileBodyType,
} from '@repo/schema'
import { Context } from '@/trpc/context'

@Router({ alias: 'profile' })
@UseMiddlewares(AuthMiddleware)
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
