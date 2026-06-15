import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  discount!: number; // percentage OR flat

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  expiryDate!: Date;

  @Column({ default: 0 })
  usageLimit!: number;

  @Column({ default: 0 })
  usedCount!: number;

  @CreateDateColumn()
  createdAt!: Date;
}