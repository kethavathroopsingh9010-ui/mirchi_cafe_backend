import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { CartItem } from '../cart/entities/cart.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Rider } from '../riders/entities/rider.entity';
import { Branch } from '../branch/entities/branch.entity';
import { RiderWalletService } from '../rider-wallet/rider-wallet.service';
import { CommissionService } from '../commission/commission.service';
import { OrderStatus } from './order-status.enum';
import { BranchWalletService } from '../branch-wallet/branch-wallet.service';
import { OrderGateway } from '../realtime/order.gateway';
import { InjectQueue } from '@nestjs/bullmq'; 
import { Queue } from 'bullmq';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    
    private readonly orderGateway: OrderGateway,

    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(Rider)
    private riderRepo: Repository<Rider>,

    private riderWalletService: RiderWalletService,
    private branchWalletService: BranchWalletService,
    private commissionService: CommissionService,
    
    // Inject DataSource to handle manual ACID Transactions
    private dataSource: DataSource,

    // Inject the background tasks queue to offload asynchronous notifications
    @InjectQueue('background-tasks') 
    private readonly notificationQueue: Queue,
  ) {}

  // CREATE MULTINATIONAL ORDER (UPDATED WITH ACID TRANSACTION WRAPPER)
  async createOrder(dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Fetch branch data using the transaction runner manager
      const branch = await queryRunner.manager.findOne(Branch, { where: { id: dto.branchId } });
      if (!branch) {
        throw new NotFoundException('Branch not found');
      }

      // 2. Fetch active customer cart selections using the transaction runner manager
      const cartItems = await queryRunner.manager.find(CartItem, {
        where: { user: { id: dto.userId } },
        relations: { product: true, user: true },
      });

      if (!cartItems.length) {
        throw new BadRequestException('Cart is empty');
      }

      // 3. Process subtotaling and prepare order items
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      for (const item of cartItems) {
        const itemTotal = Number(item.product.price) * item.quantity;
        subtotal += itemTotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
        });
        orderItems.push(orderItem);
      }

      // 4. Calculate regional tax metrics and platform commissions
      const taxAmount = subtotal * (Number(branch.taxPercentage) / 100);
      const totalAmountWithTax = subtotal + taxAmount;
      const commissionResult = this.commissionService.calculate(subtotal);

      // 5. Instantiation of parent Order context mapping block
      const order = queryRunner.manager.create(Order, {
        user: cartItems[0].user,
        items: orderItems,
        branch: branch,
        currency: branch.currency,
        taxAmount: taxAmount,
        totalAmount: totalAmountWithTax,
        riderEarning: commissionResult.riderEarning,
        platformCommission: commissionResult.platformCommission,
        branchEarning: commissionResult.branchEarning,
        status: OrderStatus.PENDING,
      });

      // Save complete order layout tree atomically
      const savedOrder = await queryRunner.manager.save(Order, order);

      // 6. Evict items out of database cart memory session now that the order is secured
      await queryRunner.manager.delete(CartItem, { user: { id: dto.userId } });

      // If all operations succeed, commit the structural dataset safely to the disk
      await queryRunner.commitTransaction();

      // 7. ASYNC TASK: Push notification offloaded to background message broker thread safely
      try {
        await this.notificationQueue.add('send-fcm-notification', {
          userId: dto.userId,
          title: '🛍️ Order Placed Successfully',
          message: `Thank you for ordering! Your order has been registered at the ${branch.name} branch.`,
          type: 'order',
        });
      } catch (queueError) {
        console.error('Failed to queue order creation notification:', queueError);
      }

      return savedOrder;
    } catch (error) {
      // Abort entire dataset changes instantly if any entity processing failure happens
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Close database thread pipeline safely
      await queryRunner.release();
    }
  }

  async findOne(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { user: true, items: { product: true }, rider: true, branch: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findUserOrders(userId: string) {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: { user: true, items: { product: true }, rider: true, branch: true },
    });
  }

  // STATE MACHINE & ORDER WORKFLOW ENGINE WITH TRANSACTION WRAPPER
  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string = 'SYSTEM') {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: { user: true, rider: true, branch: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.DELIVERED && status === OrderStatus.DELIVERED) {
        await queryRunner.release();
        return order;
      }

      order.status = status;

      if (status === OrderStatus.CONFIRMED) order.acceptedAt = new Date();
      if (status === OrderStatus.PICKED_UP) order.pickedUpAt = new Date();
      if (status === OrderStatus.DELIVERED) order.deliveredAt = new Date();

      await queryRunner.manager.save(order);

      if (status === OrderStatus.DELIVERED) {
        if (!order.rider) {
          throw new BadRequestException('Rider not assigned');
        }

        const riderId = order.rider.id;
        const riderAmount = Number(order.riderEarning);
        await this.riderWalletService.credit(riderId, riderAmount, queryRunner.manager);

        const branchId = order.branch.id;
        const branchAmount = Number(order.branchEarning);
        await this.branchWalletService.credit(branchId, branchAmount);
      }

      await queryRunner.commitTransaction();

      // Trigger Real-time Event
      this.orderGateway.emitStatusUpdate(orderId, status, userId);

      // ASYNC TASK: Map descriptive status headings and text dynamically for the push payload
      let notificationTitle = '📋 Order Update';
      let notificationMessage = `Your order status has changed to: ${status}`;

      if (status === OrderStatus.CONFIRMED) {
        notificationTitle = '🍳 Order Accepted';
        notificationMessage = 'Mirchi Cafe kitchen has accepted and started preparing your order!';
      } else if (status === OrderStatus.PICKED_UP) {
        notificationTitle = '🛵 Out for Delivery';
        notificationMessage = 'Your rider has picked up your meal and is heading your way!';
      } else if (status === OrderStatus.DELIVERED) {
        notificationTitle = '🎉 Order Delivered';
        notificationMessage = 'Enjoy your food! Thank you for ordering from Mirchi Cafe.';
      }

      if (order.user && order.user.id) {
        await this.notificationQueue.add('send-fcm-notification', {
          userId: order.user.id,
          title: notificationTitle,
          message: notificationMessage,
          type: 'order',
        });
      }

      return order;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Close database thread pipeline safely
      await queryRunner.release();
    }
  }

  async assignRider(orderId: string, riderId: string) {
    const order = await this.orderRepo.findOne({ 
      where: { id: orderId }, 
      relations: { user: true }
    });
    const rider = await this.riderRepo.findOne({ where: { id: riderId } });

    if (!order || !rider) {
      throw new NotFoundException('Order or Rider not found');
    }

    if (order.rider) {
      throw new BadRequestException('Order already assigned');
    }

    order.rider = rider;
    order.status = OrderStatus.ASSIGNED_TO_RIDER;

    const savedOrder = await this.orderRepo.save(order);

    // ASYNC TASK: Queue background push notice confirming delivery partner dispatch
    if (order.user && order.user.id) {
      try {
        await this.notificationQueue.add('send-fcm-notification', {
          userId: order.user.id,
          title: '🚴 Rider Assigned',
          message: `${rider.user} has been assigned to deliver your order.`,
          type: 'order',
        });
      } catch (queueError) {
        console.error('Failed to queue rider assignment notification:', queueError);
      }
    }

    return savedOrder;
  }
}