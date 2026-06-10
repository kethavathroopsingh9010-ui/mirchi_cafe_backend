import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { CartItem } from '../cart/entities/cart.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,
  ) {}

  async createOrder(dto: CreateOrderDto) {
    const cartItems = await this.cartRepo.find({
      where: {
        user: { id: dto.userId },
      },
      relations: {
        product: true,
        user : true,
      },
    });

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    let total = 0;

    const orderItems = cartItems.map((item) => {
      total += Number(item.product.price) * item.quantity;

      return this.orderItemRepo.create({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      });
    });

    const order = this.orderRepo.create({
      user: cartItems[0].user,
      items: orderItems,
      totalAmount: total,
    });

    const savedOrder = await this.orderRepo.save(order);

    // clear cart after order
    await this.cartRepo.delete({
      user: { id: dto.userId },
    });

    return savedOrder;
  }

  async findUserOrders(userId: string) {
    return this.orderRepo.find({
      where: {
        user: { id: userId },
      },
      relations: {
        items:{
                product:true,
        }
      },
    });
  }
}