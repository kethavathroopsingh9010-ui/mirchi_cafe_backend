import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { Product } from '../users/entities/product.entity';
import { Category } from '../users/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}