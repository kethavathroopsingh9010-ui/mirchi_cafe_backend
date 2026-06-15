import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Order } from '../../orders/entities/order.entity';
import { Rider } from '../../riders/entities/rider.entity';

export enum DeliveryStatus {
  ASSIGNED = 'assigned',
  PICKED = 'picked',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, { eager: true })
  order!: Order;

  @ManyToOne(() => Rider, { eager: true })
  rider!: Rider;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.ASSIGNED,
  })
  status!: DeliveryStatus;

  @Column({ nullable: true })
  pickupTime?: Date;

  @Column({ nullable: true })
  deliveredTime?: Date;

  @Column({ nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}