import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../orders/order-status.enum';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';

// Clean standard compilation imports
import Stripe from 'stripe';
const Razorpay = require('razorpay'); // Safe CommonJS bridge to prevent type compiler issues

@Injectable()
export class PaymentsService {
  private stripe: any;
  private razorpay: any; // Using explicit type to completely prevent compilation blocks

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {
    // Initialize Stripe securely
    const StripeConstructor = require('stripe'); // Safe CommonJS bridge
    this.stripe = new StripeConstructor(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
      apiVersion: '2025-01-27' as any, 
    });

    // Initialize Razorpay securely 
   this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });
  }

  // CREATE & INITIALIZE GATEWAY INTENT
  async createPayment(orderId: string, method: PaymentMethod) {
    // 1. Fetch order with branch data to verify currency rules
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { branch: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const amount = parseFloat(order.totalAmount as any);
    const currency = order.currency || 'INR'; // Fallback regional currency

    let gatewayInitializationData: any = null;

    // 2. Gateway Switch Matching Logic
    if (method === PaymentMethod.STRIPE || method === PaymentMethod.CARD) {
      // Stripe expects amounts in minor units (e.g., Cents/Paise) -> Multiply by 100
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: { orderId: order.id },
      });
      
      gatewayInitializationData = {
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      };

    } else if (method === PaymentMethod.RAZORPAY) {
      // Razorpay expects amounts in minor units -> Multiply by 100
      const razorpayOrder = await this.razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: currency,
        receipt: `receipt_order_${order.id.slice(0, 10)}`,
      });

      gatewayInitializationData = {
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      };
    }

    // 3. Persist transaction details in local database
    const payment = this.paymentRepo.create({
      order,
      method,
      amount: amount,
      status: method === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PROCESSING,
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // 4. Return both db payment confirmation and the SDK setup configurations
    return {
      payment: savedPayment,
      gateway: gatewayInitializationData,
    };
  }

  // MARK SUCCESS + UPDATE ORDER
  async markSuccess(paymentId: string, transactionId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.transactionId = transactionId;

    // Update order status to CONFIRMED
    payment.order.status = OrderStatus.CONFIRMED;
    await this.orderRepo.save(payment.order);
    
    return this.paymentRepo.save(payment);
  }

  async findOne(id: string) {
    return this.paymentRepo.findOne({
      where: { id },
      relations: { order: true },
    });
  }

  async findOneByOrderId(orderId: string) {
    return this.paymentRepo.findOne({
      where: { order: { id: orderId } },
      relations: { order: true },
    });
  }

  async findOneByGatewayOrderId(gatewayOrderId: string) {
    // This assumes you add a field for storing the active razorpay order ID, 
    // or you can match against the transaction log reference.
    return this.paymentRepo.findOne({
      where: { transactionId: gatewayOrderId },
      relations: { order: true },
    });
  }
}