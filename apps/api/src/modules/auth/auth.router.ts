import { Ctx, Input, Mutation, Query, Router, UseMiddlewares } from 'nestjs-trpc'
import { AuthMiddleware } from '@/trpc/middlewares/auth.middleware'
import { AuthService } from './auth.service'
import { GoogleService } from './google.service'
import {
  RegisterBodySchema,
  LoginBodySchema,
  RegisterBodyType,
  LoginBodyType,
  RegisterResSchema,
  LoginResSchema,
  SendOTPBodySchema,
  ForgotPasswordBodySchema,
  RefreshTokenBodySchema,
  LogoutBodySchema,
  GetAuthorizationUrlResSchema,
  RefreshTokenResSchema,
  RefreshTokenBodyType,
  SendOTPBodyType,
  LogoutBodyType,
  ForgotPasswordBodyType,
  GoogleCallbackBodySchema,
  GoogleCallbackBodyType,
  GetSessionsResSchema,
  RevokeSessionBodySchema,
  RevokeSessionBodyType,
  RevokeAllSessionsResSchema,
  ChangePasswordBodySchema,
  ChangePasswordBodyType,
  GuestLoginBodySchema,
  GuestLoginBodyType,
  TwoFactorSetupResSchema,
  DisableTwoFactorAuthBodySchema,
  DisableTwoFactorAuthBodyType,
} from '@repo/schema'
import { Context } from '@/trpc/context'

@Router({ alias: 'auth' })
export class AuthRouter {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Mutation({ input: RegisterBodySchema, output: RegisterResSchema })
  async register(@Input() input: RegisterBodyType, @Ctx() ctx: Context) {
    const userAgent = ctx.req.headers['user-agent'] || ''
    const ip = ctx.req.ip || ctx.req.connection?.remoteAddress || ''

    return this.authService.register({
      ...input,
      userAgent,
      ip,
    })
  }

  @Mutation({ input: LoginBodySchema, output: LoginResSchema })
  async login(@Input() input: LoginBodyType, @Ctx() ctx: Context) {
    const userAgent = ctx.req.headers['user-agent'] || ''
    const ip = ctx.req.ip || ctx.req.connection?.remoteAddress || ''

    return this.authService.login({
      ...input,
      userAgent,
      ip,
    })
  }

  @Mutation({ input: RefreshTokenBodySchema, output: RefreshTokenResSchema })
  async refreshToken(@Input() input: RefreshTokenBodyType, @Ctx() ctx: Context) {
    const userAgent = ctx.req.headers['user-agent'] || ''
    const ip = ctx.req.ip || ctx.req.connection?.remoteAddress || ''

    return this.authService.refreshToken({
      ...input,
      userAgent,
      ip,
    })
  }

  @Mutation({ input: SendOTPBodySchema })
  async sendOTP(@Input() input: SendOTPBodyType) {
    return this.authService.sendOTP(input)
  }

  @Mutation({ input: LogoutBodySchema })
  async logout(@Input() input: LogoutBodyType) {
    return this.authService.logout(input.refreshToken)
  }

  @Mutation({ input: ForgotPasswordBodySchema })
  async forgotPassword(@Input() input: ForgotPasswordBodyType) {
    return this.authService.forgotPassword(input)
  }

  @Query({ output: GetAuthorizationUrlResSchema })
  googleUrl(@Ctx() ctx: Context) {
    const userAgent = ctx.req.headers['user-agent'] || ''
    const ip = ctx.req.ip || ctx.req.connection?.remoteAddress || ''

    return this.googleService.getAuthorizationUrl({ ip, userAgent })
  }

  @Mutation({
    input: GoogleCallbackBodySchema,
    output: LoginResSchema,
  })
  async googleCallback(@Input() input: GoogleCallbackBodyType) {
    return this.googleService.googleCallback(input)
  }

  @Query({ output: GetSessionsResSchema })
  @UseMiddlewares(AuthMiddleware)
  async getActiveSessions(@Ctx() ctx: Context) {
    return this.authService.getActiveSessions(ctx.user!.userId)
  }

  @Mutation({ input: RevokeSessionBodySchema })
  @UseMiddlewares(AuthMiddleware)
  async revokeSession(@Input() input: RevokeSessionBodyType, @Ctx() ctx: Context) {
    return this.authService.revokeSession(ctx.user!.userId, input.id)
  }

  @Mutation({ output: RevokeAllSessionsResSchema })
  @UseMiddlewares(AuthMiddleware)
  async revokeAllSessions(@Ctx() ctx: Context) {
    return this.authService.revokeAllSessions(ctx.user!.userId)
  }

  @Mutation({ input: ChangePasswordBodySchema })
  @UseMiddlewares(AuthMiddleware)
  async changePassword(@Input() input: ChangePasswordBodyType, @Ctx() ctx: Context) {
    return this.authService.changePassword(ctx.user!.userId, input)
  }

  @Mutation({
    input: GuestLoginBodySchema,
    output: LoginResSchema,
  })
  async guestLogin(@Input() input: GuestLoginBodyType) {
    return this.authService.guestLogin(input)
  }

  @Mutation({ output: TwoFactorSetupResSchema })
  @UseMiddlewares(AuthMiddleware)
  async setup2FA(@Ctx() ctx: Context) {
    return this.authService.setupTwoFactorAuth(ctx.user!.userId)
  }

  @Mutation({ input: DisableTwoFactorAuthBodySchema })
  @UseMiddlewares(AuthMiddleware)
  async disable2FA(@Input() input: DisableTwoFactorAuthBodyType, @Ctx() ctx: Context) {
    return this.authService.disableTwoFactorAuth({ ...input, userId: ctx.user!.userId })
  }
}
