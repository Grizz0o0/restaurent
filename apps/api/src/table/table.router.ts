import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { RoleName } from '@repo/constants'
import {
  GetTablesQuerySchema,
  GetTablesResSchema,
  CreateTableBodySchema,
  UpdateTableBodySchema,
  CreateTableBodyType,
  GetTablesQueryType,
  UpdateTableBodyType,
  RestaurantTableSchema,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import { TableService } from './table.service'
import { z } from 'zod'

@Router({ alias: 'table' })
@UseGuards(AuthenticationGuard)
@Roles(RoleName.Admin) // Only Admin can manage tables
export class TableRouter {
  constructor(private readonly tableService: TableService) {}

  @Query({
    input: GetTablesQuerySchema,
    output: GetTablesResSchema,
  })
  async list(@Input() input: GetTablesQueryType) {
    return this.tableService.list(input)
  }

  @Query({
    input: z.object({ id: z.string() }),
    output: RestaurantTableSchema,
  })
  async detail(@Input('id') id: string) {
    return this.tableService.findById(id)
  }

  @Mutation({
    input: CreateTableBodySchema,
    output: RestaurantTableSchema,
  })
  @UseGuards(RolesGuard)
  async create(@Input() input: CreateTableBodyType, @Ctx() ctx: Context) {
    return this.tableService.create({ ...input, createdById: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: UpdateTableBodySchema,
    }),
    output: RestaurantTableSchema,
  })
  @UseGuards(RolesGuard)
  async update(@Input() input: { id: string; data: UpdateTableBodyType }, @Ctx() ctx: Context) {
    return this.tableService.update(input.id, {
      ...input.data,
      updatedById: ctx.user!.userId,
    })
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.any(),
  })
  @UseGuards(RolesGuard)
  async delete(@Input('id') id: string, @Ctx() ctx: Context) {
    return this.tableService.delete(id, ctx.user!.userId)
  }
}
