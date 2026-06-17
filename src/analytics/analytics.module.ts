import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Rider } from '../riders/entities/rider.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../orders/entities/orderItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Rider, Product, OrderItem])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}