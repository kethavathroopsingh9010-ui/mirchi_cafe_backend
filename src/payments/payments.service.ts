import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Payment,
  PaymentStatus,
  PaymentMethod,
} from './entities/payment.entity';

import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // CREATE PAYMENT
  async createPayment(orderId: string, method: PaymentMethod) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = this.paymentRepo.create({
      order,
      method,
      amount: Number(order.totalAmount), 
      status:
        method === PaymentMethod.COD
          ? PaymentStatus.PENDING
          : PaymentStatus.PROCESSING,
    });

    return this.paymentRepo.save(payment);
  }

  // MARK PAYMENT SUCCESS
  async markSuccess(paymentId: string, transactionId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.transactionId = transactionId;

    return this.paymentRepo.save(payment);
  }

  // GET PAYMENT
  async findOne(id: string) {
    return this.paymentRepo.findOne({
      where: { id },
      relations: {
        order: true,
      },
    });
  }
}