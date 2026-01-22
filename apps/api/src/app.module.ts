import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TRPCModule } from 'nestjs-trpc'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { SharedModule } from '@/shared/shared.module'
import { TrpcModule } from './trpc/trpc.module'
import { PermissionModule } from '@/permission/permission.module'
import { RoleModule } from '@/role/role.module'
import { AdminModule } from '@/admin/admin.module'
import { UserModule } from '@/user/user.module'
import { ProfileModule } from '@/profile/profile.module'
import { SocketModule } from './socket/socket.module'

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot(),
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
    }),
    AuthModule,
    AdminModule,
    PermissionModule,
    RoleModule,
    UserModule,
    ProfileModule,
    TrpcModule,
    SocketModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
