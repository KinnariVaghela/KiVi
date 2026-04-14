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
exports.Order = exports.PaymentMethod = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const OrderItem_1 = require("./OrderItem");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "Credit Card";
    PaymentMethod["DEBIT_CARD"] = "Debit Card";
    PaymentMethod["CASH_ON_DELIVERY"] = "Cash on Delivery";
    PaymentMethod["BANK_TRANSFER"] = "Bank Transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Order.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (u) => u.orders),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], Order.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Order.prototype, "placedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => OrderItem_1.OrderItem, (i) => i.order, { cascade: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)()
], Order);
