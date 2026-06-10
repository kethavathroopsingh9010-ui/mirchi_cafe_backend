import { Injectable, NotFoundException } from '@nestjs/common';
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

  // CREATE PRODUCT
  async create(dto: CreateProductDto) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const product = this.productRepo.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category,
    });

    return await this.productRepo.save(product);
  }

  // GET ALL PRODUCTS
  async findAll() {
    return await this.productRepo.find({
      relations: {
        category: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // GET SINGLE PRODUCT
  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}