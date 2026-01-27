import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import {
  CreateReservationBodySchema,
  UpdateReservationBodySchema,
  CreateReservationBodyType,
  UpdateReservationBodyType,
  GetReservationsQuerySchema,
  GetReservationsQueryType,
  ReservationSchema,
  GetReservationsResSchema,
  CheckAvailabilityQuerySchema,
  CheckAvailabilityQueryType,
} from '@repo/schema'
import { Context } from '@/trpc/context'
import { ReservationService } from './reservation.service'
import { z } from 'zod'

@Router({ alias: 'reservation' })
@UseMiddlewares(AuthMiddleware)
export class ReservationRouter {
  constructor(private readonly reservationService: ReservationService) {}

  @Query({
    input: GetReservationsQuerySchema,
    output: GetReservationsResSchema,
  })
  async list(@Input() input: GetReservationsQueryType) {
    return this.reservationService.list(input)
  }

  @Query({
    input: CheckAvailabilityQuerySchema,
    output: z.object({ available: z.boolean() }),
  })
  async checkAvailability(@Input() input: CheckAvailabilityQueryType) {
    return this.reservationService.getAvailability(input)
  }

  @Mutation({
    input: CreateReservationBodySchema,
    output: ReservationSchema,
  })
  async create(@Input() input: CreateReservationBodyType, @Ctx() ctx: Context) {
    return this.reservationService.create({ ...input, userId: ctx.user!.userId })
  }

  @Mutation({
    input: z.object({
      id: z.string(),
      data: UpdateReservationBodySchema,
    }),
    output: ReservationSchema,
  })
  async update(
    @Input() input: { id: string; data: UpdateReservationBodyType },
    @Ctx() ctx: Context,
  ) {
    return this.reservationService.update(input.id, {
      ...input.data,
      updatedById: ctx.user!.userId,
    })
  }
}
