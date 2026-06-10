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

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
  })
  @ManyToOne(() => Rider, { nullable: true, eager: true })
 rider!: Rider;
  items!: OrderItem[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
acceptedAt!: Date;

@Column({ nullable: true })
pickedUpAt!: Date;

@Column({ nullable: true })
deliveredAt!: Date;
}