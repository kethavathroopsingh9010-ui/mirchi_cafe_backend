import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Product } from '../users/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CartItem } from '../cart/entities/cart.entity';
import { Rider } from '../riders/entities/rider.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      User,
      CartItem,
      Rider,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}