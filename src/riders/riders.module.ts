import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RidersController } from './riders.controller';
import { RidersService } from './riders.service';

import { Rider } from './entities/rider.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rider,
      User,
      Order,
    ]),
  ],
  controllers: [RidersController],
  providers: [RidersService],
})
export class RidersModule {}