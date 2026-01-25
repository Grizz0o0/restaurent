import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { AdminRoleMiddleware } from '@/trpc/middlewares/admin-role.middleware'
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
@UseMiddlewares(AuthMiddleware) // Authentication required for all order actions
export class OrderRouter {
  constructor(private readonly orderService: OrderService) {}

  @Mutation({
    input: CreateOrderBodySchema,
    output: OrderSchema,
  })
  // Guest, Waiter, Admin can create orders. AuthMiddleware validates token (which guests also have)
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
  @UseMiddlewares(AdminRoleMiddleware) // Only Admin/Seller can list all orders (add Seller check later if needed, assume AdminRoleMiddleware covers privileged access)
  async list(@Input() input: GetOrdersQueryType) {
    return this.orderService.list(input)
  }
}
