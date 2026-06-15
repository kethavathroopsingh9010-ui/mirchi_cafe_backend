import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BranchWallet } from './entities/branch-wallet.entity';

import {
  BranchWalletTransaction,
  BranchTransactionType,
} from './entities/branch-wallet-transaction.entity';

import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class BranchWalletService {
  constructor(
    @InjectRepository(BranchWallet)
    private walletRepo: Repository<BranchWallet>,

    @InjectRepository(BranchWalletTransaction)
    private transactionRepo: Repository<BranchWalletTransaction>,

    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
  ) {}

  async createWallet(branchId: string) {
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const wallet = this.walletRepo.create({
      branch,
      balance: '0.00',
    });

    return this.walletRepo.save(wallet);
  }

  async credit(branchId: string, amount: number) {
    const wallet = await this.walletRepo.findOne({
      where: {
        branch: {
          id: branchId,
        },
      },
      relations: {
        branch: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    wallet.balance = (
      Number(wallet.balance) + amount
    ).toFixed(2);

    await this.walletRepo.save(wallet);

    const transaction =
      this.transactionRepo.create({
        wallet,
        amount,
        type: BranchTransactionType.CREDIT,
      });

    await this.transactionRepo.save(transaction);

    return wallet;
  }

  async debit(branchId: string, amount: number) {
    const wallet = await this.walletRepo.findOne({
      where: {
        branch: {
          id: branchId,
        },
      },
      relations: {
        branch: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (amount <= 0) {
      throw new BadRequestException(
        'Amount must be greater than 0',
      );
    }

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException(
        'Insufficient balance',
      );
    }

    wallet.balance = (
      Number(wallet.balance) - amount
    ).toFixed(2);

    await this.walletRepo.save(wallet);

    const transaction =
      this.transactionRepo.create({
        wallet,
        amount,
        type: BranchTransactionType.DEBIT,
      });

    await this.transactionRepo.save(transaction);

    return wallet;
  }

  async getWallet(branchId: string) {
    return this.walletRepo.findOne({
      where: {
        branch: {
          id: branchId,
        },
      },
      relations: {
        branch: true,
      },
    });
  }

  async getHistory(branchId: string) {
    const wallet = await this.walletRepo.findOne({
      where: {
        branch: {
          id: branchId,
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException(
        'Wallet not found',
      );
    }

    return this.transactionRepo.find({
      where: {
        wallet: {
          id: wallet.id,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}