"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const win32_1 = __importDefault(require("path/win32"));
dotenv_1.default.config();
/**
 * TypeORM Data Source Configuration.
 * This object manages the connection pool and entity-to-table mapping.
 */
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'better-sqlite3',
    database: process.env.DB_NAME || 'ecommerce-db',
    // synchronize: process.env.DB_SYNCHRONIZE === 'true', 
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
    // entities: [
    //   User, ProductType, Category, SubCategory,
    //   Product, CartItem, Order, OrderItem, PasswordResetCode,
    // ],
    // migrations: ['src/migration/*.ts'],
    entities: [win32_1.default.join(__dirname, 'entity/**/*.{js,ts}')],
    migrations: [win32_1.default.join(__dirname, 'migration/**/*.{js,ts}')],
});
