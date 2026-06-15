import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Delivery } from './entities/delivery.entity';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';

import { Order } from '../orders/entities/order.entity';
import { Rider } from '../riders/entities/rider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Delivery, Order, Rider])],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}