import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { IsPublic } from '@/shared/decorators/auth.decorator'
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
@UseGuards(AuthenticationGuard)
export class DishRouter {
  constructor(private readonly dishService: DishService) {}

  @IsPublic()
  @Query({
    input: GetDishesQuerySchema,
    output: GetDishesResSchema,
  })
  async list(@Input() input: GetDishesQueryType) {
    return this.dishService.list(input)
  }

  @IsPublic()
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
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.Seller) // Admin or Seller can create dishes
  async create(@Input() input: CreateDishBodyType, @Ctx() ctx: Context) {
    return this.dishService.create({ ...input, createdById: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: UpdateDishBodySchema,
    }),
    output: DishDetailResSchema,
  })
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.Seller)
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
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.Seller)
  async delete(@Input('id') id: string, @Ctx() ctx: Context) {
    return this.dishService.delete(id, ctx.user!.userId)
  }
}
