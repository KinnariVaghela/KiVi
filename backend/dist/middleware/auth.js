"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCustomer = exports.requireAdmin = exports.requireAuth = void 0;
const passport_1 = __importDefault(require("../passport"));
const User_1 = require("../entity/User");
/**
 * Middleware that requires a valid JWT to access the route.
 * Verifies the token and attaches the user payload to 'req.user'.
 * @throws 401 Unauthorized if the token is missing, expired, or invalid.
 */
const requireAuth = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err)
            return next(err);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.requireAuth = requireAuth;
/**
 * Middleware that restricts access to users with the 'ADMIN' role.
 * First validates the JWT, then checks the user's role property.
 * @throws 401 Unauthorized if not logged in.
 * @throws 403 Forbidden if the user is not an administrator.
 */
const requireAdmin = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err)
            return next(err);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (user.role !== User_1.UserRole.ADMIN) {
            res.status(403).json({ error: 'Forbidden: admin access required' });
            return;
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware that restricts access to users with the 'CUSTOMER' role.
 * Useful for ensuring admins or guests don't accidentally perform customer-only actions (like placing an order).
 * @throws 401 Unauthorized if not logged in.
 * @throws 403 Forbidden if the user is not a customer.
 */
const requireCustomer = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user) => {
        if (err)
            return next(err);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (user.role !== User_1.UserRole.CUSTOMER) {
            res.status(403).json({ error: 'Forbidden: customer access required' });
            return;
        }
        req.user = user;
        next();
    })(req, res, next);
};
exports.requireCustomer = requireCustomer;
