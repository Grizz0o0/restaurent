import { Module } from '@nestjs/common'
import { AuthMiddleware } from './middlewares/auth.middleware'
import { AdminRoleMiddleware } from './middlewares/admin-role.middleware'
import { AppContext } from './context'

import { DynamicAuthMiddleware } from './middlewares/dynamic-auth.middleware'

@Module({
  providers: [AuthMiddleware, AdminRoleMiddleware, DynamicAuthMiddleware, AppContext],
  exports: [AppContext, AuthMiddleware, AdminRoleMiddleware, DynamicAuthMiddleware],
})
export class TrpcModule {}
