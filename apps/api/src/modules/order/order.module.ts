import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderRouter } from './order.router'
import { OrderRepo } from './order.repo'
import { DishModule } from '@/modules/dish/dish.module'
import { NotificationModule } from '@/modules/notification/notification.module'
import { AddressModule } from '@/modules/address/address.module'

@Module({
  imports: [DishModule, NotificationModule, AddressModule],

  providers: [OrderService, OrderRouter, OrderRepo],
  exports: [OrderService],
})
export class OrderModule {}
