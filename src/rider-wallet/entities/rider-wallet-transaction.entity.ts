import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { RiderWallet } from './rider-wallet.entity';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity()
export class RiderWalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => RiderWallet, wallet => wallet.transactions)
wallet!: RiderWallet;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}