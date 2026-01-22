import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TRPCModule } from 'nestjs-trpc'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { TrpcModule } from './trpc/trpc.module'
import { PermissionModule } from 'src/permission/permission.module'
import { RoleModule } from 'src/role/role.module'
import { AdminModule } from 'src/admin/admin.module'
import { UserModule } from 'src/user/user.module'
import { ProfileModule } from 'src/profile/profile.module'

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
