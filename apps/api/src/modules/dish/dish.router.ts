import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { AdminRoleMiddleware } from '@/trpc/middlewares/admin-role.middleware'
import { RoleName } from '@repo/constants'
import {
  GetDishesQuerySchema,
  GetDishesResSchema,
  CreateDishBodySchema,
  UpdateDishBodySchema,
  CreateDishBodyType,
  GetDishesQueryType,
  UpdateDishBodyType,
  DishDetailResSchema,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import { DishService } from './dish.service'
import { z } from 'zod'

@Router({ alias: 'dish' })
export class DishRouter {
  constructor(private readonly dishService: DishService) {}

  @Query({
    input: GetDishesQuerySchema,
    output: GetDishesResSchema,
  })
  async list(@Input() input: GetDishesQueryType) {
    return this.dishService.list(input)
  }

  @Query({
    input: z.object({ id: z.string() }),
    output: DishDetailResSchema,
  })
  async detail(@Input('id') id: string) {
    return this.dishService.findById(id)
  }

  @Mutation({
    input: CreateDishBodySchema,
    output: DishDetailResSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware) // Admin or Seller can create dishes
  async create(@Input() input: CreateDishBodyType, @Ctx() ctx: Context) {
    return this.dishService.create({ ...input, createdById: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      variants: UpdateDishBodySchema.shape.variants,
    }),
    output: z.array(z.object({ id: z.string(), value: z.string() })),
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async checkVariantUpdate(
    @Input() input: { id: string; variants: UpdateDishBodyType['variants'] },
  ) {
    return this.dishService.checkVariantUpdateImpact(input.id, input.variants)
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: UpdateDishBodySchema,
    }),
    output: DishDetailResSchema,
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async update(@Input() input: { id: string; data: UpdateDishBodyType }, @Ctx() ctx: Context) {
    return this.dishService.update({
      id: input.id,
      data: input.data,
      updatedById: ctx.user!.userId,
    })
  }
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.any(),
  })
  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  async delete(@Input('id') id: string, @Ctx() ctx: Context) {
    return this.dishService.delete(id, ctx.user!.userId)
  }
}
