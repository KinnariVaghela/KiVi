import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Order }   from './Order';
import { Product } from './Product';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  orderId!: number;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column({ type: 'int', nullable: true, default: null })
  productId!: number | null;

  @ManyToOne(() => Product, (p) => p.orderItems, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product!: Product | null;

  @Column({ type: 'varchar' })
  productName!: string; 

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase!: number; 

  @Column({ type: 'int' })
  quantity!: number;
}
