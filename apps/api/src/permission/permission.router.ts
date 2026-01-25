import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { AdminRoleMiddleware } from '@/trpc/middlewares/admin-role.middleware'
import { PermissionService } from './permission.service'
import {
  GetPermissionsQuerySchema,
  GetPermissionsResSchema,
  GetPermissionParamsSchema,
  GetPermissionDetailResSchema,
  CreatePermissionBodySchema,
  UpdatePermissionBodySchema,
  GetPermissionsQueryType,
  GetPermissionParamsType,
  CreatePermissionBodyType,
  UpdatePermissionBodyType,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import z from 'zod'

@Router({ alias: 'permission' })
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class PermissionRouter {
  constructor(private readonly permissionService: PermissionService) {}

  @Query({
    input: GetPermissionsQuerySchema,
    output: GetPermissionsResSchema,
  })
  async list(@Input() input: GetPermissionsQueryType) {
    return this.permissionService.list({
      limit: input.limit,
      page: input.page,
    })
  }

  @Query({
    input: GetPermissionParamsSchema,
    output: GetPermissionDetailResSchema,
  })
  async detail(@Input() input: GetPermissionParamsType) {
    return this.permissionService.findById(input.permissionId)
  }

  @Mutation({
    input: CreatePermissionBodySchema,
    output: GetPermissionDetailResSchema,
  })
  async create(@Input() input: CreatePermissionBodyType, @Ctx() ctx: Context) {
    return this.permissionService.create({ data: input, createdById: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      params: GetPermissionParamsSchema,
      body: UpdatePermissionBodySchema,
    }),
    output: GetPermissionDetailResSchema,
  })
  async update(
    @Input() input: { params: GetPermissionParamsType; body: UpdatePermissionBodyType },
    @Ctx() ctx: Context,
  ) {
    return this.permissionService.update({
      id: input.params.permissionId,
      data: input.body,
      updatedById: ctx.user!.userId,
    })
  }

  @Mutation({
    input: GetPermissionParamsSchema,
    output: z.object({ message: z.string() }),
  })
  async delete(@Input() input: GetPermissionParamsType, @Ctx() ctx: Context) {
    return this.permissionService.delete({ id: input.permissionId, deletedById: ctx.user!.userId })
  }
}
