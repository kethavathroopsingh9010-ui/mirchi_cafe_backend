import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Product } from '../../users/entities/product.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Product)
  product!: Product;

  @Column({
    default: 1,
  })
  quantity!: number;
}