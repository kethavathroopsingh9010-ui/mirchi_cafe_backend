import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartService } from './cart.service';
import { CartController } from './cart.controller';

import { CartItem } from './entities/cart.entity';
import { Product } from '../users/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      Product,
      User,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}