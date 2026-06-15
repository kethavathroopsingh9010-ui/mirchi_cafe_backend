import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { OrderItem } from '../../orders/entities/orderItem.entity';
import { OrderStatus } from '../order-status.enum';
import { Rider } from '../../riders/entities/rider.entity';
import { Branch } from '../../branch/entities/branch.entity'; 

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  items!: OrderItem[];

  @ManyToOne(() => Rider, { nullable: true, eager: true })
  rider!: Rider;

  //  ADDED: Multinational Branch Relation
  @ManyToOne(() => Branch, { eager: true })
  branch!: Branch;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  //  ADDED: Multinational regional tracking attributes
  @Column({ default: 'PKR' })
  currency!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  taxAmount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  // Commission fields 
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  riderEarning!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  platformCommission!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  branchEarning!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  acceptedAt!: Date;

  @Column({ nullable: true })
  pickedUpAt!: Date;

  @Column({ nullable: true })
  deliveredAt!: Date;
}