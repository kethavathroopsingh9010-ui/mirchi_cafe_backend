import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { RealtimeModule } from './realtime/realtime.module';
import { RidersModule } from './riders/riders.module';
import { PaymentsModule } from './payments/payments.module';
import { BranchModule } from './branch/branch.module';
import { CommissionModule } from './commission/commission.module';
import { RiderWalletModule } from './rider-wallet/rider-wallet.module';
import { CategoriesModule } from './categories/categories.module';
import { BranchWalletModule } from './branch-wallet/branch-wallet.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CouponsModule } from './coupons/coupons.module';
import { DeliveryModule } from './delivery/delivery.module';
import { NotificationModule } from './notifications/notification.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    
    }),

    TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  schema: 'public',

  autoLoadEntities: true,
synchronize: true ,
}),

    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    RealtimeModule,
    RidersModule,
    PaymentsModule,
    BranchModule,
    CommissionModule,
    RiderWalletModule,
    CategoriesModule,
    BranchWalletModule,
    AnalyticsModule,
    CouponsModule,
    DeliveryModule, 
    NotificationModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}