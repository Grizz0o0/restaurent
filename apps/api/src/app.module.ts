import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { envSchema, Env } from './env.validation'
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
import { DishModule } from './dish/dish.module'
import { CategoryModule } from './category/category.module'
import { UploadModule } from './upload/upload.module'

@Module({
  imports: [
    SharedModule,
    ConfigModule.forRoot({
      validate: (config) => envSchema.parse(config),
      isGlobal: true,
    }),
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
    DishModule,
    CategoryModule,
    UploadModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => [
        {
          ttl: config.get('THROTTLE_TTL'),
          limit: config.get('THROTTLE_LIMIT'),
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
