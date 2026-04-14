"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
exports.isValidEmail = isValidEmail;
exports.isStrongPassword = isStrongPassword;
exports.isValidPhone = isValidPhone;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const PasswordResetCode_1 = require("../entity/PasswordResetCode");
const sessionStore_1 = require("../store/sessionStore");
const passport_1 = require("../passport");
const errors_1 = require("../errors");
/**
 * Validates email format using a standard RFC 5322 regex.
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
/**
 * Enforces minimum password complexity.
 * Current requirement: Minimum 6 characters.
 */
function isStrongPassword(password) {
    return password.length >= 6;
}
/**
 * Validates international and local phone number formats.
 */
function isValidPhone(phone) {
    return /^[+\d\s\-()]{7,20}$/.test(phone.trim());
}
class AuthService {
    /**
     * Hashes the password and creates a new Customer account.
     * @throws {AppError} 409 if the email is already in use.
     */
    async register(name, email, password, phone, address) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const existing = await repo.findOneBy({ email });
        if (existing)
            throw new errors_1.AppError('Email already registered', 409);
        const user = repo.create({
            name,
            email,
            passwordHash: await bcrypt_1.default.hash(password, 12),
            phone: phone.trim() || null,
            address: address.trim() || null,
            role: User_1.UserRole.CUSTOMER,
        });
        return repo.save(user);
    }
    /**
     * Verifies credentials and generates a stateful JWT.
     * Injects a unique 'jti' into the token and tracks it in sessionStore
     * to support session revocation.
     * @throws {AppError} 401 for bad credentials, 403 if account is locked.
     */
    async login(email, password, userAgent, ip) {
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ email });
        if (!user || !(await bcrypt_1.default.compare(password, user.passwordHash))) {
            throw new errors_1.AppError('Invalid credentials', 401);
        }
        if (user.isLocked) {
            throw new errors_1.AppError('Account is locked. Contact support.', 403);
        }
        const jti = (0, crypto_1.randomUUID)();
        const token = jsonwebtoken_1.default.sign({ sub: user.id, jti, role: user.role }, passport_1.JWT_SECRET, { expiresIn: '7d' });
        sessionStore_1.sessionStore.create(jti, {
            userId: user.id,
            role: user.role,
            createdAt: new Date(),
            userAgent,
            ip,
        });
        return { token, cookieName: passport_1.COOKIE_NAME, role: user.role, name: user.name };
    }
    logout(jti) {
        sessionStore_1.sessionStore.delete(jti);
    }
    /**
     * Generates a 6-digit numeric recovery code valid for 10 minutes.
     * Deletes any previous codes for this email before creating a new one.
     * @returns {string|null} The code, or null if user does not exist.
     */
    async generateResetCode(email) {
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ email });
        if (!user)
            return null;
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const repo = data_source_1.AppDataSource.getRepository(PasswordResetCode_1.PasswordResetCode);
        await repo.delete({ email: user.email });
        await repo.save(repo.create({ email: user.email, code, expiresAt }));
        return code;
    }
    /**
     * Resets user password and invalidates ALL active sessions for that user.
     * @throws {AppError} 400 for expired/used codes.
     */
    async resetPassword(email, code, newPassword) {
        const codeRepo = data_source_1.AppDataSource.getRepository(PasswordResetCode_1.PasswordResetCode);
        const entry = await codeRepo.findOneBy({ email, code });
        if (!entry || entry.used) {
            throw new errors_1.AppError('Invalid or expired code', 400);
        }
        if (new Date() > entry.expiresAt) {
            throw new errors_1.AppError('Code has expired. Please request a new one.', 400);
        }
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOneBy({ email: entry.email });
        if (!user)
            throw new errors_1.AppError('User not found', 404);
        user.passwordHash = await bcrypt_1.default.hash(newPassword, 12);
        await userRepo.save(user);
        entry.used = true;
        await codeRepo.save(entry);
        sessionStore_1.sessionStore.deleteAllForUser(user.id);
    }
    /**
     * Changes password for a logged-in user.
     * Invalidates all other sessions except the current one.
     */
    async changePassword(userId, currentJti, currentPassword, newPassword) {
        const repo = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = await repo.findOneBy({ id: userId });
        if (!user || !(await bcrypt_1.default.compare(currentPassword, user.passwordHash))) {
            throw new errors_1.AppError('Current password is incorrect', 401);
        }
        user.passwordHash = await bcrypt_1.default.hash(newPassword, 12);
        await repo.save(user);
        for (const session of sessionStore_1.sessionStore.getForUser(userId)) {
            if (session.jti !== currentJti)
                sessionStore_1.sessionStore.delete(session.jti);
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
