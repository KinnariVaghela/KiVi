import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User }      from './User';
import { OrderItem } from './OrderItem';

export enum PaymentMethod {
  CREDIT_CARD      = 'Credit Card',
  DEBIT_CARD       = 'Debit Card',
  CASH_ON_DELIVERY = 'Cash on Delivery',
  BANK_TRANSFER    = 'Bank Transfer',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User, (u) => u.orders)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'varchar' })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number; 

  @CreateDateColumn()
  placedAt!: Date; 

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true })
  items!: OrderItem[];
}