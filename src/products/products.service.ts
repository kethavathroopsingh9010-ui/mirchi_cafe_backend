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
    const category = dto.categoryId
      ? await this.categoryRepo.findOne({
          where: { id: dto.categoryId },
        })
      : null;

    const product = this.productRepo.create({
      name: dto.name,
      price: dto.price,
      description: dto.description,
      category: category ?? undefined,
    });

    return this.productRepo.save(product);
  }

  // GET ALL PRODUCTS WITH OPTIONAL BRANCH FILTER
  async findAll(branchId?: string) {
    const findOptions: any = {
      relations: {
        category: true,
      },
      order: {
        createdAt: 'DESC',
      },
    };

    // If a branchId is provided, filter down to that branch's scope.
    // (Assuming your Product or Category entity maps back to a Branch relationship)
    if (branchId) {
      findOptions.where = {
        category: {
          branch: { id: branchId }
        }
      };
    }

    return await this.productRepo.find(findOptions);
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