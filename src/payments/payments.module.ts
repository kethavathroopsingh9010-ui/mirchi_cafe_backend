import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

import { PaymentsService } from '../payments/payments.service';
import { PaymentsController } from '../payments/payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}