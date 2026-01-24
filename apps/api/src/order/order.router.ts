import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { RoleName } from '@repo/constants'
import {
  CreateOrderBodySchema,
  CreateOrderBodyType,
  GetOrdersQuerySchema,
  GetOrdersQueryType,
  GetOrdersResSchema,
  OrderSchema,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import { OrderService } from './order.service'

@Router({ alias: 'order' })
@UseGuards(AuthenticationGuard)
export class OrderRouter {
  constructor(private readonly orderService: OrderService) {}

  @Mutation({
    input: CreateOrderBodySchema,
    output: OrderSchema,
  })
  // Guest, Waiter, Admin can create orders
  @UseGuards(RolesGuard)
  @Roles(RoleName.Guest, RoleName.Admin, RoleName.Seller)
  async create(@Input() input: CreateOrderBodyType, @Ctx() ctx: Context) {
    return this.orderService.create({
      data: input,
      userId: ctx.user!.userId,
      tableId: ctx.user!.tableId,
      roleName: ctx.user!.roleName,
    })
  }

  @Query({
    input: GetOrdersQuerySchema,
    output: GetOrdersResSchema,
  })
  @UseGuards(RolesGuard)
  @Roles(RoleName.Admin, RoleName.Seller) // Guests usually don't list all orders, maybe only their own (in later improvement)
  async list(@Input() input: GetOrdersQueryType) {
    return this.orderService.list(input)
  }
}
