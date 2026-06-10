import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum RiderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Entity()
export class Rider {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user!: User;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({
    type: 'enum',
    enum: RiderStatus,
    default: RiderStatus.ACTIVE,
  })
  status!: RiderStatus;

  @Column({ type: 'float', default: 0 })
  earnings!: number;

  @Column({ nullable: true })
  currentLat!: number;

  @Column({ nullable: true })
  currentLng!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  
}