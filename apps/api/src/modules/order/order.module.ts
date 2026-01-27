import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderRouter } from './order.router'
import { OrderRepo } from './order.repo'
import { DishModule } from '@/modules/dish/dish.module'
import { NotificationModule } from '@/modules/notification/notification.module'

@Module({
  imports: [DishModule, NotificationModule],
  providers: [OrderService, OrderRouter, OrderRepo],
  exports: [OrderService],
})
export class OrderModule {}
