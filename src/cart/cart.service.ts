import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CartItem } from './entities/cart.entity';
import { Product } from '../users/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async addToCart(userId: string, dto: AddToCartDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cartItem = this.cartRepo.create({
      user,
      product,
      quantity: dto.quantity,
    });

    return this.cartRepo.save(cartItem);
  }

  async getCart(userId: string) {
    return this.cartRepo.find({
      where: { user: { id: userId } },
      relations: {
        product: true,
        user: false,
      },
    });
  }

  async removeItem(id: string) {
    return this.cartRepo.delete(id);
  }
}