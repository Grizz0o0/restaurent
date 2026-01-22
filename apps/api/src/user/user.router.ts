import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
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
import { Context } from 'src/trpc/context'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { REQUEST_USER_KEY } from '@repo/constants'
import z from 'zod'

@Router({ alias: 'user' })
@UseGuards(AuthenticationGuard)
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
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.userService.create({ data: input, createdById: user.userId })
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
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.userService.update({
      id: input.params.userId,
      data: input.body,
      updatedById: user.userId,
    })
  }

  @Mutation({
    input: GetUserDetailParamsSchema,
    output: z.object({ message: z.string() }),
  })
  async delete(@Input() input: GetUserDetailParamsType, @Ctx() ctx: Context) {
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.userService.delete({ id: input.userId, deletedById: user.userId })
  }
}
