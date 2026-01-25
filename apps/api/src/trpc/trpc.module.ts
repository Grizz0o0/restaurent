import { Module } from '@nestjs/common'
import { AuthMiddleware } from './middlewares/auth.middleware'
import { AdminRoleMiddleware } from './middlewares/admin-role.middleware'
import { AppContext } from './context'

@Module({
  providers: [AuthMiddleware, AdminRoleMiddleware, AppContext],
  exports: [AppContext, AuthMiddleware, AdminRoleMiddleware], // Export if needed elsewhere
})
export class TrpcModule {}
