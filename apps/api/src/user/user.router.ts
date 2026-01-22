import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { RoleName } from '@repo/constants'
import { UserService } from './user.service'
import {
  GetUsersQuerySchema,
  GetUsersResSchema,
  GetUserDetailParamsSchema,
  UserDetailResSchema,
  CreateUserBodySchema,
  UpdateUserBodySchema,
  GetUsersQueryType,
  GetUserDetailParamsType,
  CreateUserBodyType,
  UpdateUserBodyType,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import z from 'zod'

@Router({ alias: 'user' })
@UseGuards(AuthenticationGuard, RolesGuard)
@Roles(RoleName.Admin)
export class UserRouter {
  constructor(private readonly userService: UserService) {}

  @Query({
    input: GetUsersQuerySchema,
    output: GetUsersResSchema,
  })
  async list(@Input() input: GetUsersQueryType) {
    return this.userService.list({
      limit: input.limit,
      page: input.page,
      roleId: input.roleId,
      status: input.status,
    })
  }

  @Query({
    input: GetUserDetailParamsSchema,
    output: UserDetailResSchema,
  })
  async detail(@Input() input: GetUserDetailParamsType) {
    return this.userService.findById(input.userId)
  }

  @Mutation({
    input: CreateUserBodySchema,
    output: UserDetailResSchema,
  })
  async create(@Input() input: CreateUserBodyType, @Ctx() ctx: Context) {
    return this.userService.create({ data: input, createdById: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      params: GetUserDetailParamsSchema,
      body: UpdateUserBodySchema,
    }),
    output: UserDetailResSchema,
  })
  async update(
    @Input() input: { params: GetUserDetailParamsType; body: UpdateUserBodyType },
    @Ctx() ctx: Context,
  ) {
    return this.userService.update({
      id: input.params.userId,
      data: input.body,
      updatedById: ctx.user!.userId,
    })
  }

  @Mutation({
    input: GetUserDetailParamsSchema,
    output: z.object({ message: z.string() }),
  })
  async delete(@Input() input: GetUserDetailParamsType, @Ctx() ctx: Context) {
    return this.userService.delete({ id: input.userId, deletedById: ctx.user!.userId })
  }
}
