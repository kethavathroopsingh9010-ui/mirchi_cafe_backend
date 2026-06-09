import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../users/entities/product.entity';
import { Category } from '../users/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateProductDto) {
    const category =
      await this.categoryRepo.findOne({
        where: { id: dto.categoryId },
      });

    if (!category) {
      throw new Error('Category not found');
    }

    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category,
    });

    return this.productRepo.save(product);
  }

  async findAll() {
    return this.productRepo.find();
  }
}