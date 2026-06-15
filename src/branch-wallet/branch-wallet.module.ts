import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BranchWalletService } from './branch-wallet.service';
import { BranchWalletController } from './branch-wallet.controller';

import { BranchWallet } from './entities/branch-wallet.entity';
import { BranchWalletTransaction } from './entities/branch-wallet-transaction.entity';

import { Branch } from '../branch/entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BranchWallet,
      BranchWalletTransaction,
      Branch,
    ]),
  ],
  controllers: [BranchWalletController],
  providers: [BranchWalletService],
  exports: [BranchWalletService],
})
export class BranchWalletModule {}