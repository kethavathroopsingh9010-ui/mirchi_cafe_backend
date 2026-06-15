import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { BranchWallet } from './branch-wallet.entity';

export enum BranchTransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

@Entity()
export class BranchWalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(
    () => BranchWallet,
    wallet => wallet.transactions,
  )
  wallet!: BranchWallet;

  @Column({
    type: 'enum',
    enum: BranchTransactionType,
  })
  type!: BranchTransactionType;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  amount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}