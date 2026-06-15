import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RiderWalletService } from './rider-wallet.service';
import { RiderWalletController } from './rider-wallet.controller';

import { RiderWallet } from './entities/rider-wallet.entity';
import { RiderWalletTransaction } from './entities/rider-wallet-transaction.entity';
import { Rider } from '../riders/entities/rider.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RiderWallet,
      RiderWalletTransaction,
      WalletTransaction,
      Rider,
    ]),
  ],
  controllers: [RiderWalletController],
  providers: [RiderWalletService],
   exports: [RiderWalletService],
})
export class RiderWalletModule {}