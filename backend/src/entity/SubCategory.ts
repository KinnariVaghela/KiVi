import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Category } from './Category';
import { Product }  from './Product';

@Entity()
export class SubCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'int' })
  categoryId!: number;

  @ManyToOne(() => Category, (c) => c.subCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @OneToMany(() => Product, (p) => p.subCategory)
  products!: Product[];
}
