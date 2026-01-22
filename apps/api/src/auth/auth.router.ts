import { Ctx, Input, Mutation, Query, Router } from 'nestjs-trpc'
import { UseGuards } from '@nestjs/common'
import { AuthenticationGuard } from '@/shared/guards/authentication.guard'
import { IsPublic } from '@/shared/decorators/auth.decorator'
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
} from '@repo/schema'
import { Context } from '@/trpc/context'

@Router({ alias: 'auth' })
@UseGuards(AuthenticationGuard)
export class AuthRouter {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @IsPublic()
  @Mutation({ input: RegisterBodySchema, output: RegisterResSchema })
  async register(@Input() input: RegisterBodyType) {
    return this.authService.register(input)
  }

  @IsPublic()
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

  @IsPublic()
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

  @IsPublic()
  @Mutation({ input: SendOTPBodySchema })
  async sendOTP(@Input() input: SendOTPBodyType) {
    return this.authService.sendOTP(input)
  }

  @IsPublic()
  @Mutation({ input: LogoutBodySchema })
  async logout(@Input() input: LogoutBodyType) {
    return this.authService.logout(input.refreshToken)
  }

  @IsPublic()
  @Mutation({ input: ForgotPasswordBodySchema })
  async forgotPassword(@Input() input: ForgotPasswordBodyType) {
    return this.authService.forgotPassword(input)
  }

  @IsPublic()
  @Query({ output: GetAuthorizationUrlResSchema })
  googleUrl(@Ctx() ctx: Context) {
    const userAgent = ctx.req.headers['user-agent'] || ''
    const ip = ctx.req.ip || ctx.req.connection?.remoteAddress || ''

    return this.googleService.getAuthorizationUrl({ ip, userAgent })
  }

  @IsPublic()
  @Mutation({
    input: GoogleCallbackBodySchema,
    output: LoginResSchema,
  })
  async googleCallback(@Input() input: GoogleCallbackBodyType) {
    return this.googleService.googleCallback(input)
  }

  @Query({ output: GetSessionsResSchema })
  async getActiveSessions(@Ctx() ctx: Context) {
    return this.authService.getActiveSessions(ctx.user!.userId)
  }

  @Mutation({ input: RevokeSessionBodySchema })
  async revokeSession(@Input() input: RevokeSessionBodyType, @Ctx() ctx: Context) {
    return this.authService.revokeSession(ctx.user!.userId, input.id)
  }

  @Mutation({ output: RevokeAllSessionsResSchema })
  async revokeAllSessions(@Ctx() ctx: Context) {
    return this.authService.revokeAllSessions(ctx.user!.userId)
  }

  @Mutation({ input: ChangePasswordBodySchema })
  async changePassword(@Input() input: ChangePasswordBodyType, @Ctx() ctx: Context) {
    return this.authService.changePassword(ctx.user!.userId, input)
  }
}
