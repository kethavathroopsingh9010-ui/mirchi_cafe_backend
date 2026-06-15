import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { CreateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column({  type: 'text',nullable: true })
  description?: string | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
    eager: true,
  })
  category?: Category;

  @CreateDateColumn()
createdAt!: Date;
}