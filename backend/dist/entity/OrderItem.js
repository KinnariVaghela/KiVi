"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("./Order");
const Product_1 = require("./Product");
let OrderItem = class OrderItem {
};
exports.OrderItem = OrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], OrderItem.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Order_1.Order, (o) => o.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'orderId' }),
    __metadata("design:type", Order_1.Order)
], OrderItem.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, default: null }),
    __metadata("design:type", Object)
], OrderItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, (p) => p.orderItems, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", Object)
], OrderItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], OrderItem.prototype, "productName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], OrderItem.prototype, "priceAtPurchase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], OrderItem.prototype, "quantity", void 0);
exports.OrderItem = OrderItem = __decorate([
    (0, typeorm_1.Entity)()
], OrderItem);
