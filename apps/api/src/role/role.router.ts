import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { RoleService } from './role.service'
import {
  GetRolesQuerySchema,
  GetRolesResSchema,
  GetRoleDetailParamsSchema,
  GetRoleDetailResSchema,
  CreateRoleBodySchema,
  UpdateRoleBodySchema,
  GetRolesQueryType,
  GetRoleDetailParamsType,
  CreateRoleBodyType,
  UpdateRoleBodyType,
} from '@repo/schema'
import { Context } from 'src/trpc/context'
import { AccessTokenPayload } from 'src/shared/types/jwt.type'
import { REQUEST_USER_KEY } from '@repo/constants'
import z from 'zod'

@Router({ alias: 'role' })
@UseGuards(AuthenticationGuard)
export class RoleRouter {
  constructor(private readonly roleService: RoleService) {}

  @Query({
    input: GetRolesQuerySchema,
    output: GetRolesResSchema,
  })
  async list(@Input() input: GetRolesQueryType) {
    return this.roleService.list({
      limit: input.limit,
      page: input.page,
    })
  }

  @Query({
    input: GetRoleDetailParamsSchema,
    output: GetRoleDetailResSchema,
  })
  async detail(@Input() input: GetRoleDetailParamsType) {
    return this.roleService.findById(input.roleId)
  }

  @Mutation({
    input: CreateRoleBodySchema,
    output: GetRoleDetailResSchema,
  })
  async create(@Input() input: CreateRoleBodyType, @Ctx() ctx: Context) {
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.roleService.create({ data: input, createdById: user.userId })
  }

  @Mutation({
    input: z.object({
      params: GetRoleDetailParamsSchema,
      body: UpdateRoleBodySchema,
    }),
    output: GetRoleDetailResSchema,
  })
  async update(
    @Input() input: { params: GetRoleDetailParamsType; body: UpdateRoleBodyType },
    @Ctx() ctx: Context,
  ) {
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.roleService.update({
      id: input.params.roleId,
      data: input.body,
      updatedById: user.userId,
    })
  }

  @Mutation({
    input: GetRoleDetailParamsSchema,
    output: z.object({ message: z.string() }),
  })
  async delete(@Input() input: GetRoleDetailParamsType, @Ctx() ctx: Context) {
    const user = (ctx.req as any)[REQUEST_USER_KEY] as AccessTokenPayload
    return this.roleService.delete({ id: input.roleId, deletedById: user.userId })
  }
}
