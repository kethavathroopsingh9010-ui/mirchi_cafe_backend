import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: 'PK' }) // e.g., 'PK', 'IN', 'AE'
  countryCode!: string;

  @Column({ default: 'PKR' }) // e.g., 'PKR', 'INR', 'AED'
  currency!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 }) 
  taxPercentage!: number; // Every country/state has different tax rates

  @Column({  }) // For accurate daily revenue analytics
  timezone!: string;

  @Column('simple-array', { nullable: true })
  supportedPaymentGateways!: string[];

  @Column()
  address!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}