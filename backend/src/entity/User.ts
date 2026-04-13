import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from 'typeorm';
import { CartItem } from './CartItem';
import { Order }    from './Order';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN    = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  passwordHash!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', default: UserRole.CUSTOMER })
  role!: UserRole;

  @Column({ type: 'boolean', default: false })
  isLocked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => CartItem, (c) => c.user)
  cartItems!: CartItem[];

  @OneToMany(() => Order, (o) => o.user)
  orders!: Order[];
}