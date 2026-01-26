import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { PromotionService } from './promotion.service'
import { Context } from '@/trpc/context'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { AdminRoleMiddleware } from '@/trpc/middlewares/admin-role.middleware'
import {
  CreatePromotionSchema,
  CreatePromotionType,
  UpdatePromotionSchema,
  UpdatePromotionType,
  ApplyPromotionSchema,
  ApplyPromotionType,
  PromotionSchema,
  ApplyPromotionResSchema,
} from '@repo/schema'
import { z } from 'zod'

@Router({ alias: 'promotion' })
@UseMiddlewares(AuthMiddleware)
export class PromotionRouter {
  constructor(private readonly promotionService: PromotionService) {}

  @Mutation({
    input: CreatePromotionSchema,
    output: PromotionSchema,
  })
  @UseMiddlewares(AdminRoleMiddleware)
  async create(@Input() input: CreatePromotionType, @Ctx() ctx: Context) {
    return this.promotionService.create(input)
  }

  @Query({
    output: z.array(PromotionSchema),
  })
  @UseMiddlewares(AdminRoleMiddleware)
  async list() {
    return this.promotionService.findAll()
  }

  // Note: promotionService.findOne takes ID, but tRPC usually passes input object.
  // We'll define a simple schema for ID input or just assume string if allowed (tRPC prefers objects).
  // Using z.object({ id: z.string() }) inline or from schema if available.
  @Query({
    input: z.object({ id: z.string() }),
    output: PromotionSchema,
  })
  @UseMiddlewares(AdminRoleMiddleware)
  async get(@Input() input: { id: string }) {
    return this.promotionService.findOne(input.id)
  }

  @Mutation({
    input: z.object({ id: z.string(), data: UpdatePromotionSchema }),
    output: PromotionSchema,
  })
  @UseMiddlewares(AdminRoleMiddleware)
  async update(@Input() input: { id: string; data: UpdatePromotionType }) {
    return this.promotionService.update(input.id, input.data)
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: PromotionSchema,
  })
  @UseMiddlewares(AdminRoleMiddleware)
  async delete(@Input() input: { id: string }) {
    return this.promotionService.remove(input.id)
  }

  @Mutation({
    input: ApplyPromotionSchema,
    output: ApplyPromotionResSchema,
  })
  async applyCode(@Input() input: ApplyPromotionType) {
    return this.promotionService.apply(input)
  }
}
