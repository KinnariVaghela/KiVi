"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
/**
 * Custom operational error class for the application.
 * Allows services to throw errors with specific HTTP status codes.
 */
class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
