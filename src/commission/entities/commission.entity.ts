import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';

@Entity()
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order)
  order!: Order;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  orderAmount!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  platformCommission!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  riderEarning!: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  branchEarning!: number;

  @CreateDateColumn()
  createdAt!: Date;
}