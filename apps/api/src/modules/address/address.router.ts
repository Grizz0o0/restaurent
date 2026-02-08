import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { Injectable } from '@nestjs/common'
import { AddressService } from './address.service'
import {
  AddressSchema,
  CreateAddressBodySchema,
  UpdateAddressBodySchema,
  GetAddressesQuerySchema,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import { z } from 'zod'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'

@Router({ alias: 'address' })
export class AddressRouter {
  constructor(private readonly addressService: AddressService) {}

  @Mutation({
    input: CreateAddressBodySchema,
    output: AddressSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async create(@Input() input: any, @Ctx() ctx: Context) {
    return this.addressService.create(ctx.user!.userId, input)
  }

  @Query({
    input: GetAddressesQuerySchema,
    output: z.array(AddressSchema),
  })
  @UseMiddlewares(AuthMiddleware)
  async list(@Input() input: any, @Ctx() ctx: Context) {
    return this.addressService.list(ctx.user!.userId)
  }

  @Mutation({
    input: UpdateAddressBodySchema,
    output: AddressSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async update(@Input() input: any, @Ctx() ctx: Context) {
    return this.addressService.update(ctx.user!.userId, input)
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: AddressSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async delete(@Input() input: { id: string }, @Ctx() ctx: Context) {
    return this.addressService.delete(ctx.user!.userId, input.id)
  }

  @Mutation({
    input: z.object({ id: z.string() }),
    output: AddressSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async setDefault(@Input() input: { id: string }, @Ctx() ctx: Context) {
    return this.addressService.setDefault(ctx.user!.userId, input.id)
  }
}
