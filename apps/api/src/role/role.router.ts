import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { AdminRoleMiddleware } from '@/trpc/middlewares/admin-role.middleware'
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
import { Context } from '@/trpc/context'
import z from 'zod'

@Router({ alias: 'role' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
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
    return this.roleService.create({ data: input, createdById: ctx.user!.userId })
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
    return this.roleService.update({
      id: input.params.roleId,
      data: input.body,
      updatedById: ctx.user!.userId,
    })
  }

  @Mutation({
    input: GetRoleDetailParamsSchema,
    output: z.object({ message: z.string() }),
  })
  async delete(@Input() input: GetRoleDetailParamsType, @Ctx() ctx: Context) {
    return this.roleService.delete({ id: input.roleId, deletedById: ctx.user!.userId })
  }
}
