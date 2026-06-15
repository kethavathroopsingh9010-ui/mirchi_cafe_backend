import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Branch } from '../../branch/entities/branch.entity';
import { BranchWalletTransaction } from './branch-wallet-transaction.entity';

@Entity()
export class BranchWallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Branch, {
    eager: true,
  })
  @JoinColumn()
  branch!: Branch;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  balance!: string;

  @OneToMany(
    () => BranchWalletTransaction,
    transaction => transaction.wallet,
  )
  transactions!: BranchWalletTransaction[];
}