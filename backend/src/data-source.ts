import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Dotenv from 'dotenv';

import { User }               from './entity/User';
import { ProductType }        from './entity/ProductType';
import { Category }           from './entity/Category';
import { SubCategory }        from './entity/SubCategory';
import { Product }            from './entity/Product';
import { CartItem }           from './entity/CartItem';
import { Order }              from './entity/Order';
import { OrderItem }          from './entity/OrderItem';
import { PasswordResetCode }  from './entity/PasswordResetCode';

Dotenv.config();

/**
 * TypeORM Data Source Configuration.
 * This object manages the connection pool and entity-to-table mapping.
 */
export const AppDataSource = new DataSource({
  type:        'better-sqlite3',
  database:    process.env.DB_NAME || 'ecommerce-db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true', 
  logging:     process.env.DB_LOGGING === 'true',
  entities: [
    User, ProductType, Category, SubCategory,
    Product, CartItem, Order, OrderItem, PasswordResetCode,
  ],
  migrations: ['src/migration/*.ts'],
});