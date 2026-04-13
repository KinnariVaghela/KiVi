import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Category } from './Category';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  name!: string;

  @OneToMany(() => Category, (c) => c.productType)
  categories!: Category[];
}
