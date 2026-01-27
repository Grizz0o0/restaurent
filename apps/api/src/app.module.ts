import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { envSchema, Env } from './env.validation'
import { TRPCModule } from 'nestjs-trpc'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './modules/auth/auth.module'
import { SharedModule } from '@/shared/shared.module'
import { TrpcModule } from './trpc/trpc.module'
import { PermissionModule } from '@/modules/permission/permission.module'
import { RoleModule } from '@/modules/role/role.module'
import { AdminModule } from '@/modules/admin/admin.module'
import { UserModule } from '@/modules/user/user.module'
import { ProfileModule } from '@/modules/profile/profile.module'
import { SocketModule } from './modules/socket/socket.module'
import { DishModule } from './modules/dish/dish.module'
import { CategoryModule } from './modules/category/category.module'
import { UploadModule } from './modules/upload/upload.module'
import { TableModule } from './modules/table/table.module'
import { OrderModule } from './modules/order/order.module'
import { ReviewModule } from './modules/review/review.module'
import { PromotionModule } from './modules/promotion/promotion.module'
import { NotificationModule } from './modules/notification/notification.module'
import { CartModule } from './modules/cart/cart.module'
import { LanguageModule } from './modules/language/language.module'
import { SupplierModule } from './modules/supplier/supplier.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { InventoryTransactionModule } from './modules/inventory-transaction/inventory-transaction.module'

import { EventEmitterModule } from '@nestjs/event-emitter'

import superjson from 'superjson'

import { AppContext } from './trpc/context'

@Module({
  imports: [
    SharedModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      validate: (config) => envSchema.parse(config),
      isGlobal: true,
    }),
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
      transformer: superjson,
      context: AppContext,
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
    TableModule,
    OrderModule,
    ReviewModule,
    PromotionModule,
    NotificationModule,
    NotificationModule,
    CartModule,
    LanguageModule,
    SupplierModule,
    InventoryModule,
    InventoryTransactionModule,

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
    AppContext,
  ],
})
export class AppModule {}
