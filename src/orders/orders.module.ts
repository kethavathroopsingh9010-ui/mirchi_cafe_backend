import { Module ,forwardRef} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq'; // 🌟 FIX: Added missing import statement for BullMQ integration

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { Product } from '../users/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CartItem } from '../cart/entities/cart.entity';
import { Rider } from '../riders/entities/rider.entity';
import { Branch } from '../branch/entities/branch.entity';

import { CommissionModule } from '../commission/commission.module';
import { RiderWalletModule } from '../rider-wallet/rider-wallet.module';
import { BranchWalletModule } from '../branch-wallet/branch-wallet.module'; 
import { RealtimeModule } from '../realtime/realtime.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    // 1. Database Entities go here:
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Product,
      User,
      CartItem,
      Rider,
      Branch,
    ]),
    
    // 2. External Modules belong down here together:
    CommissionModule,     
    RiderWalletModule, 
    BranchWalletModule, 
    RealtimeModule,
    forwardRef(() => PaymentsModule),
    
    BullModule.registerQueue({
      name: 'background-tasks',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}