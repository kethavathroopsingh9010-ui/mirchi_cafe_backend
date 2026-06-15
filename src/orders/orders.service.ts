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
  ) {}

  // CREATE MULTINATIONAL ORDER
  async createOrder(dto: CreateOrderDto) {
    const branch = await this.branchRepo.findOne({ where: { id: dto.branchId } });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const cartItems = await this.cartRepo.find({
      where: { user: { id: dto.userId } },
      relations: { product: true, user: true },
    });

    if (!cartItems.length) {
      throw new BadRequestException('Cart is empty');
    }

    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const itemTotal = Number(item.product.price) * item.quantity;
      subtotal += itemTotal;
      return this.orderItemRepo.create({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      });
    });

    const taxAmount = subtotal * (Number(branch.taxPercentage) / 100);
    const totalAmountWithTax = subtotal + taxAmount;
    const commissionResult = this.commissionService.calculate(subtotal);

    const order = this.orderRepo.create({
      user: cartItems[0].user,
      items: orderItems,
      branch: branch,
      currency: branch.currency,
      taxAmount: taxAmount,
      totalAmount: totalAmountWithTax,
      riderEarning: commissionResult.riderEarning,
      platformCommission: commissionResult.platformCommission,
      branchEarning: commissionResult.branchEarning,
    });

    const savedOrder = await this.orderRepo.save(order);
    await this.cartRepo.delete({ user: { id: dto.userId } });

    return savedOrder;
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
    // Open a completely isolated query runner context
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Fetch the order inside the running transaction to lock it down
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: { rider: true, branch: true },
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

      // Save using transactional manager
      await queryRunner.manager.save(order);

      if (status === OrderStatus.DELIVERED) {
        if (!order.rider) {
          throw new BadRequestException('Rider not assigned');
        }

        const riderId = order.rider.id;
        const riderAmount = Number(order.riderEarning);
        // Pass queryRunner.manager if your services accept a custom EntityManager instance,
        // otherwise, we run them sequentially inside the try block so failures trigger the catch rollback.
        await this.riderWalletService.credit(riderId, riderAmount, queryRunner.manager);

        const branchId = order.branch.id;
        const branchAmount = Number(order.branchEarning);
        await this.branchWalletService.credit(branchId, branchAmount);
      }

      // If everything passes smoothly, commit to database permanently
      await queryRunner.commitTransaction();

      // Trigger Real-time Event (Outside the DB block so it doesn't hold up locks)
      this.orderGateway.emitStatusUpdate(orderId, status, userId);

      return order;
    } catch (error) {
      // An error occurred! Roll back all database mutations completely
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release the connection runner back to the global pool
      await queryRunner.release();
    }
  }

  async assignRider(orderId: string, riderId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    const rider = await this.riderRepo.findOne({ where: { id: riderId } });

    if (!order || !rider) {
      throw new NotFoundException('Order or Rider not found');
    }

    if (order.rider) {
      throw new BadRequestException('Order already assigned');
    }

    order.rider = rider;
    order.status = OrderStatus.ASSIGNED_TO_RIDER;

    return this.orderRepo.save(order);
  }
}