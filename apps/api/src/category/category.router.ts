import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { RoleName } from '@repo/constants'
import {
  GetCategoriesQuerySchema,
  GetCategoriesResSchema,
  CreateCategoryBodySchema,
  UpdateCategoryBodySchema,
  CreateCategoryBodyType,
  GetCategoriesQueryType,
  UpdateCategoryBodyType,
  CategoryDetailResSchema,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import { CategoryService } from './category.service'
import { z } from 'zod'

@Router({ alias: 'category' })
@UseGuards(AuthenticationGuard)
export class CategoryRouter {
  constructor(private readonly categoryService: CategoryService) {}

  @Query({
    input: GetCategoriesQuerySchema,
    output: GetCategoriesResSchema,
  })
  async list(@Input() input: GetCategoriesQueryType) {
    return this.categoryService.list(input)
  }

  @Query({
    input: z.object({ id: z.string() }),
    output: CategoryDetailResSchema,
  })
  async detail(@Input('id') id: string) {
    return this.categoryService.findById(id)
  }

  @Mutation({
    input: CreateCategoryBodySchema,
    output: CategoryDetailResSchema,
  })
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.Seller)
  async create(@Input() input: CreateCategoryBodyType, @Ctx() ctx: Context) {
    return this.categoryService.create({ ...input, createdById: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: UpdateCategoryBodySchema,
    }),
    output: CategoryDetailResSchema,
  })
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.Seller)
  async update(@Input() input: { id: string; data: UpdateCategoryBodyType }, @Ctx() ctx: Context) {
    return this.categoryService.update({
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
    return this.categoryService.delete(id, ctx.user!.userId)
  }
}
