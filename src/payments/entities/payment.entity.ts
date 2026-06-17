import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';

export enum PaymentMethod {
  COD = 'cod',
  CARD = 'card',
  STRIPE = 'stripe', 
  RAZORPAY = 'razorpay', 
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  //  RELATION: Configured eager loading to seamlessly join parent order contexts automatically
  @OneToOne(() => Order, { eager: true })
  @JoinColumn()
  order!: Order;

  @Column({ type: 'enum', enum: PaymentMethod })
  method!: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  // TRANSFORMER: Keeps decimals safely stored while handling data string casts back to JavaScript floats
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount!: number;

  @Column({ nullable: true })
  transactionId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}