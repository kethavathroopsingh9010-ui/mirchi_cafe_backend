import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CouponType {
  PERCENTAGE = 'percentage', // 🌟 FIX: Corrected spelling to prevent type mismatch issues
  FIXED = 'fixed',
}

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  // 🌟 Type matching your routing schema requirements
  @Column({ type: 'enum', enum: CouponType, default: CouponType.PERCENTAGE })
  type!: CouponType;

  @Column('decimal', { 
    precision: 10, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  discount!: number; // percentage OR flat amount

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate!: Date | null;

  @Column({ default: 0 })
  usageLimit!: number;

  @Column({ default: 0 })
  usedCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}