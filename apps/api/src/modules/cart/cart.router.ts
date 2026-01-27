import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { Context } from '@/trpc/context'
import { CartService } from './cart.service'
import {
  AddCartItemSchema,
  AddCartItemType,
  UpdateCartItemSchema,
  UpdateCartItemType,
  RemoveCartItemSchema,
  RemoveCartItemType,
  GetCartResSchema,
  CartItemSchema,
} from '@repo/schema'

@Router({ alias: 'cart' })
@UseMiddlewares(AuthMiddleware)
export class CartRouter {
  constructor(private readonly cartService: CartService) {}

  @Query({
    output: GetCartResSchema,
  })
  async get(@Ctx() ctx: Context) {
    return this.cartService.getCart(ctx.user!.userId)
  }

  @Mutation({
    input: AddCartItemSchema,
    output: CartItemSchema,
  })
  async add(@Input() input: AddCartItemType, @Ctx() ctx: Context) {
    return this.cartService.addToCart(ctx.user!.userId, input)
  }

  @Mutation({
    input: UpdateCartItemSchema,
    output: CartItemSchema,
  })
  async update(@Input() input: UpdateCartItemType, @Ctx() ctx: Context) {
    return this.cartService.updateCartItem(ctx.user!.userId, input)
  }

  @Mutation({
    input: RemoveCartItemSchema,
    output: CartItemSchema,
  })
  async remove(@Input() input: RemoveCartItemType, @Ctx() ctx: Context) {
    return this.cartService.removeFromCart(ctx.user!.userId, input)
  }
}
