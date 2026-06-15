import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Rider } from '../../riders/entities/rider.entity';
import { RiderWalletTransaction } from './rider-wallet-transaction.entity';



@Entity()
export class RiderWallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Rider, {
    eager: true,
  })
  @JoinColumn()
  rider!: Rider;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  balance!: string;

  @OneToMany(
    () => RiderWalletTransaction,
    transaction => transaction.wallet,
  )
  transactions!: RiderWalletTransaction[];
}