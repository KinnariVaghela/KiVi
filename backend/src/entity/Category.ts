import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { ProductType } from './ProductType';
import { SubCategory } from './SubCategory';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'int' })
  productTypeId!: number;

  @ManyToOne(() => ProductType, (t) => t.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productTypeId' })
  productType!: ProductType;

  @OneToMany(() => SubCategory, (s) => s.category)
  subCategories!: SubCategory[];
}
