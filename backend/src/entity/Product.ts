import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { SubCategory } from './SubCategory';
import { CartItem }    from './CartItem';
import { OrderItem }   from './OrderItem';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'varchar', nullable: true })
  imagePath!: string | null;

  @Column({ type: 'int' })
  subCategoryId!: number;

  @ManyToOne(() => SubCategory, (s) => s.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory!: SubCategory;

  @OneToMany(() => CartItem, (c) => c.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (o) => o.product)
  orderItems!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}
