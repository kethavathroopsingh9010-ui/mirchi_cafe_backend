import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Commission } from './entities/commission.entity';
import { Order } from '../orders/entities/order.entity';

import { CommissionService } from './commission.service';
import { CommissionController } from './commission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Commission,
      Order,
    ]),
  ],
  providers: [CommissionService],
  controllers: [CommissionController],
  exports: [CommissionService],
})
export class CommissionModule {}