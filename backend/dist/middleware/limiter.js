"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Rate limiter middleware for authentication-related routes (login, register, reset-password).
 * * Limits each IP address to 10 requests per 15-minute window.
 * This prevents automated brute-force attempts while allowing legitimate users
 * enough attempts to recover from typos.
 * * @settings
 * - windowMs: 15 minutes
 * - max: 10 requests per window
 * - headers: Includes 'RateLimit-*' headers in the response
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
