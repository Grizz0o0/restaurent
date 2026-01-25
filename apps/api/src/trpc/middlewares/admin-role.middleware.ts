import { Injectable } from '@nestjs/common'
import { TRPCError } from '@trpc/server'
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc'
import { RoleName } from '@repo/constants'
import { Context } from '@/trpc/context'

@Injectable()
export class AdminRoleMiddleware implements TRPCMiddleware {
  async use(opts: MiddlewareOptions) {
    const ctx = opts.ctx as Context
    const { next } = opts
    const user = ctx.user as { roleName: string } | undefined

    if (!user) {
      // AuthMiddleware should have run first. If not, we deny access safe.
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' })
    }

    if (user.roleName !== RoleName.Admin) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied: Admins only' })
    }

    return next()
  }
}
