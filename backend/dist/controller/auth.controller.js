"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const passport_1 = require("../passport");
const errors_1 = require("../errors");
const auth_service_1 = require("../service/auth.service");
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
/**
 * Registers a new user account.
 * Performs validation for email format, password strength, and phone validity.
 * @route POST /auth/register
 * @body {string} name - User's full name
 * @body {string} email - Unique email address
 * @body {string} password - Minimum 6 characters
 * @body {string} phone - Valid phone number string
 * @body {string} address - Physical shipping/billing address
 */
const register = async (req, res) => {
    const { name, email, password, phone, address } = req.body;
    if (typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof phone !== 'string' ||
        typeof address !== 'string') {
        res.status(400).json({ error: 'Name, email, password, phone, and address are required' });
        return;
    }
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    if (!trimmedName) {
        res.status(400).json({ error: 'Name cannot be empty' });
        return;
    }
    if (!(0, auth_service_1.isValidEmail)(trimmedEmail)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
    }
    if (!(0, auth_service_1.isStrongPassword)(password)) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }
    if (!trimmedPhone || !(0, auth_service_1.isValidPhone)(trimmedPhone)) {
        res.status(400).json({ error: 'A valid phone number is required' });
        return;
    }
    if (!trimmedAddress) {
        res.status(400).json({ error: 'Address cannot be empty' });
        return;
    }
    try {
        await auth_service_1.authService.register(trimmedName, trimmedEmail, password, trimmedPhone, trimmedAddress);
        res.status(201).json({ message: 'Registered successfully' });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
/**
 * Authenticates a user and sets a secure HTTP-only cookie.
 * Captures User-Agent and IP for session tracking.
 * @route POST /auth/login
 * @body {string} email
 * @body {string} password
 */
const login = async (req, res) => {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const result = await auth_service_1.authService.login(email.trim().toLowerCase(), password, req.headers['user-agent'] || 'Unknown', req.ip || 'Unknown');
        res.cookie(result.cookieName, result.token, COOKIE_OPTIONS);
        res.json({ message: 'Logged in', role: result.role, name: result.name });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
/**
 * Invalidates the current session and clears the auth cookie.
 * @route POST /auth/logout
 * @authentication Required
 */
const logout = (req, res) => {
    auth_service_1.authService.logout(req.user.jti);
    res.clearCookie(passport_1.COOKIE_NAME);
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
/**
 * Returns the currently authenticated user's profile information.
 * @route GET /auth/me
 * @authentication Required
 */
const getMe = (req, res) => {
    const user = req.user;
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};
exports.getMe = getMe;
/**
 * Initiates the password recovery process.
 * Generates a reset code if the email exists.
 * @route POST /auth/forgot-password
 * @body {string} email
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (typeof email !== 'string') {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    const code = await auth_service_1.authService.generateResetCode(email.trim().toLowerCase());
    res.json({ message: 'If that email is registered, a reset code has been generated.', code });
};
exports.forgotPassword = forgotPassword;
/**
 * Resets the password using a recovery code.
 * Clears existing sessions for security after a successful reset.
 * @route POST /auth/reset-password
 */
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
        res.status(400).json({ error: 'Email, code, and new password are required' });
        return;
    }
    if (!(0, auth_service_1.isStrongPassword)(newPassword)) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }
    try {
        await auth_service_1.authService.resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
        res.clearCookie(passport_1.COOKIE_NAME);
        res.json({ message: 'Password reset successful. Please log in.' });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
/**
 * Changes the password for a logged-in user.
 * Requires the current password to verify ownership.
 * @route POST /auth/change-password
 * @authentication Required
 */
const changePassword = async (req, res) => {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
    }
    if (!(0, auth_service_1.isStrongPassword)(newPassword)) {
        res.status(400).json({ error: 'New password must be at least 6 characters' });
        return;
    }
    try {
        await auth_service_1.authService.changePassword(user.id, user.jti, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            res.status(err.status).json({ error: err.message });
        else
            res.status(500).json({ error: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
