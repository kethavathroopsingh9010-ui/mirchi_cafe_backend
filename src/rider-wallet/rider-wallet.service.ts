import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManager } from 'typeorm';

import { RiderWallet } from './entities/rider-wallet.entity';
import {
  RiderWalletTransaction,
  TransactionType,
} from './entities/rider-wallet-transaction.entity';

import { Rider } from '../riders/entities/rider.entity';

@Injectable()
export class RiderWalletService {
  constructor(
    @InjectRepository(RiderWallet)
    private walletRepo: Repository<RiderWallet>,

    @InjectRepository(RiderWalletTransaction)
    private transactionRepo: Repository<RiderWalletTransaction>,

    @InjectRepository(Rider)
    private riderRepo: Repository<Rider>,
  ) {}

  async createWallet(riderId: string) {
    const rider = await this.riderRepo.findOne({
      where: { id: riderId },
    });

    if (!rider) {
      throw new NotFoundException('Rider not found');
    }

    const wallet = this.walletRepo.create({
      rider,
      balance: '0.00',
    });

    return this.walletRepo.save(wallet);
  }

  async credit(riderId: string, amount: number, manager?: EntityManager) {
  // Use the passed transaction manager if it exists, otherwise fall back to standard repo
  const repo = manager ? manager.getRepository(RiderWallet) : this.walletRepo;
  const txRepo = manager ? manager.getRepository(RiderWalletTransaction) : this.transactionRepo;

  const wallet = await repo.findOne({
    where: { rider: { id: riderId } },
    relations: { rider: true },
  });

  if (!wallet) {
    throw new NotFoundException('Wallet not found');
  }

  wallet.balance = (Number(wallet.balance) + amount).toFixed(2);
  await repo.save(wallet);

  const transaction = txRepo.create({
    wallet,
    amount,
    type: TransactionType.CREDIT,
  });

  await txRepo.save(transaction);

  //  Keep your test trap here for the verification run!
  //throw new Error('Simulated Database Wallet Crash!');

  return wallet;
}

  async debit(riderId: string, amount: number) {
    const wallet = await this.walletRepo.findOne({
      where: {
        rider: { id: riderId },
      },
      relations: {
        rider: true,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient balance for withdrawal');
    }

    wallet.balance = (Number(wallet.balance) - amount).toFixed(2);
    await this.walletRepo.save(wallet);

    const transaction = this.transactionRepo.create({
      wallet,
      amount,
      type: TransactionType.DEBIT, // Fixed: Using Enum instead of raw string
    });

    await this.transactionRepo.save(transaction);

    return wallet;
  }

  async getWallet(riderId: string) {
    return this.walletRepo.findOne({
      where: {
        rider: { id: riderId },
      },
      relations: {
        rider: true,
      },
    });
  }

  async getHistory(riderId: string) {
    const wallet = await this.walletRepo.findOne({
      where: {
        rider: { id: riderId },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return this.transactionRepo.find({
      where: {
        wallet: { id: wallet.id },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}