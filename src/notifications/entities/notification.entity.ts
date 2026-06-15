import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  ORDER = 'order',
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  COUPON = 'coupon',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Removed eager: true to prevent recursive relationship loops during fetch operations
  @ManyToOne(() => User)
  user!: User;

  @Column()
  title!: string;

  @Column()
  message!: string;

  // Stored as a string column to avoid strict database-level Enum sync lockups
  @Column()
  type!: string;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}