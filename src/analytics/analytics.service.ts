import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Rider } from '../riders/entities/rider.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from '../orders/entities/orderItem.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Rider)
    private riderRepo: Repository<Rider>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
  ) {}

  //  TOTAL OVERVIEW
  async getDashboardStats() {
    const [orders, users, riders] = await Promise.all([
      this.orderRepo.count(),
      this.userRepo.count(),
      this.riderRepo.count(),
    ]);

    const revenueData = await this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'revenue')
      .getRawOne();

    return {
      totalOrders: orders,
      totalUsers: users,
      totalRiders: riders,
      totalRevenue: Number(revenueData.revenue || 0),
    };
  }

  //  TOP PRODUCTS - FIXED
  async topProducts() {
    return this.orderItemRepo
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.product', 'product') // Join towards product
      .select('product.name', 'name')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .groupBy('product.id')
      .addGroupBy('product.name') // 🌟 Enforced to maintain strict ANSI/PostgreSQL grouping requirements
      .orderBy('\"totalSold\"', 'DESC')
      .limit(5)
      .getRawMany();
  }

  //  DAILY REVENUE
  async dailyRevenue() {
    return this.orderRepo
      .createQueryBuilder('order')
      .select("DATE(order.createdAt)", "date")
      .addSelect("SUM(order.totalAmount)", "revenue")
      .groupBy("DATE(order.createdAt)")
      .orderBy("date", "DESC")
      .getRawMany();
  }
}