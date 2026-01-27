import { Injectable, Logger } from '@nestjs/common'
import { TRPCError } from '@trpc/server'
import { MiddlewareOptions, TRPCMiddleware } from 'nestjs-trpc'
import { Context } from '@/trpc/context'
import { PrismaService } from '@/shared/prisma'
import { RoleName } from '@repo/constants'

@Injectable()
export class DynamicAuthMiddleware implements TRPCMiddleware {
  private readonly logger = new Logger(DynamicAuthMiddleware.name)

  constructor(private readonly prisma: PrismaService) {}

  async use(opts: MiddlewareOptions) {
    const ctx = opts.ctx as Context
    const { next, path, type } = opts

    // 1. Bypass if user is Admin
    if (ctx.user?.roleName === 'ADMIN') {
      return next()
    }

    // 2. Identify the required permission
    // Path: e.g. 'order.create'
    // Method: 'POST' (Mutation) or 'GET' (Query)
    // We need to map TRPC type to HTTP Method as per our Permission Schema (HTTPMethod enum)
    // Mutation -> POST, Query -> GET

    const method = type === 'mutation' ? 'POST' : 'GET'
    const requiredPath = path

    // 3. Check if such permission exists in DB (Optional: only check if it exists in DB, otherwise allow? Or strict deny?)
    // Strict Deny: If not Admin, and no explicit permission, DENY.
    // However, we need to be careful about public procedures or those covered by AuthMiddleware/AdminMiddleware only.
    // IF we apply this globally, it will block everything.
    // IMPT: This middleware should probably only run if specifically applied, OR we have a whitelist.
    // BUT the requirement is "Dynamic Permission".
    // Strategy:
    // - If current user has the permission assigned to their role, ALLOW.
    // - Permissions are stored in `ctx.user`? No, `ctx.user` usually has basics.
    // - We need to fetch permissions for the role. Optimally caching this or user has it in session/token (too big).
    // - Let's fetch from DB or Cache. `ctx.user.roleId` is available.

    if (!ctx.user) {
      // Not logged in. If the procedure is public, this middleware shouldn't be here or should skip?
      // If we use Global Guard logic, we might need metadata.
      // For TRPC middleware, we usually chain them. If this follows AuthMiddleware, user exists.
      // If AuthMiddleware failed, we wouldn't be here (if sequential).
      // If public, ctx.user is undefined.
      // Let's assume this middleware is used AFTER AuthMiddleware.
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated' })
    }

    // Get Permissions for Role
    // TODO: Cache this!
    const roleWithPermissions = await this.prisma.role.findUnique({
      where: { id: ctx.user.roleId },
      include: { permissions: true },
    })

    if (!roleWithPermissions) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Role not found' })
    }

    // Check match
    const hasPermission = roleWithPermissions.permissions.some(
      (p) => p.path === requiredPath && p.method === method,
    )

    // Also check wildcard or module level?
    // Schema has 'module' but path is exact?
    // Let's assume exact match for now as per "Assign Permissions to Role (by path & method)".
    // Maybe we support `order.*` later.

    if (!hasPermission) {
      // We might want to allow if the permission doesn't exist in the DB at all?
      // i.e. System hasn't defined this as a protected action.
      // But "Dynamic" usually implies we define what is allowed.
      // Let's check if Permission record exists for this path/method.
      const permissionRecord = await this.prisma.permission.findUnique({
        where: { path_method: { path: requiredPath, method: method as any } },
      })

      // If permission doesn't exist in DB, maybe it's not a protected dynamic permission?
      // ALLOW if not defined? OR DENY?
      // Default secure: DENY. But that requires seeding ALL permissions.
      // Let's go with: IF permission record exists, User MUST have it.
      // IF it doesn't exist, fall back to code-level decorators (AuthMiddleware, etc).

      if (permissionRecord) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Missing permission: ${requiredPath} (${method})`,
        })
      }
    }

    return next()
  }
}
