import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderRouter } from './order.router'
import { OrderRepo } from './order.repo'
import { DishModule } from '@/dish/dish.module'

@Module({
  imports: [DishModule],
  providers: [OrderService, OrderRouter, OrderRepo],
  exports: [OrderService],
})
export class OrderModule {}
