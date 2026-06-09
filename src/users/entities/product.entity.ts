import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column({
    nullable: true,
  })
  imageUrl!: string;

  @Column({
    default: true,
  })
  isAvailable!: boolean;

  @ManyToOne(
    () => Category,
    (category) => category.products,
    {
      eager: true,
    },
  )
  category!: Category;
}