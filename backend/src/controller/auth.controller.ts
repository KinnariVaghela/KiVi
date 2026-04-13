import { Request, Response }  from 'express';
import { COOKIE_NAME }        from '../passport';
import { AuthUser }           from '../middleware/auth';
import { AppError }           from '../errors';
import {
  authService,
  isValidEmail,
  isStrongPassword,
  isValidPhone,
} from '../service/auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000,
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
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, phone, address } = req.body as Record<string, unknown>;

  if (
    typeof name     !== 'string' ||
    typeof email    !== 'string' ||
    typeof password !== 'string' ||
    typeof phone    !== 'string' ||
    typeof address  !== 'string'
  ) {
    res.status(400).json({ error: 'Name, email, password, phone, and address are required' });
    return;
  }

  const trimmedName    = name.trim();
  const trimmedEmail   = email.trim().toLowerCase();
  const trimmedPhone   = phone.trim();
  const trimmedAddress = address.trim();

  if (!trimmedName) {
    res.status(400).json({ error: 'Name cannot be empty' }); return;
  }
  if (!isValidEmail(trimmedEmail)) {
    res.status(400).json({ error: 'Invalid email address' }); return;
  }
  if (!isStrongPassword(password)) {
    res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
  }
  if (!trimmedPhone || !isValidPhone(trimmedPhone)) {
    res.status(400).json({ error: 'A valid phone number is required' }); return;
  }
  if (!trimmedAddress) {
    res.status(400).json({ error: 'Address cannot be empty' }); return;
  }

  try {
    await authService.register(trimmedName, trimmedEmail, password, trimmedPhone, trimmedAddress);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Authenticates a user and sets a secure HTTP-only cookie.
 * Captures User-Agent and IP for session tracking.
 * @route POST /auth/login
 * @body {string} email
 * @body {string} password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as Record<string, unknown>;

  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required' }); return;
  }

  try {
    const result = await authService.login(
      email.trim().toLowerCase(), password,
      req.headers['user-agent'] || 'Unknown',
      req.ip || 'Unknown',
    );
    res.cookie(result.cookieName, result.token, COOKIE_OPTIONS);
    res.json({ message: 'Logged in', role: result.role, name: result.name });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Invalidates the current session and clears the auth cookie.
 * @route POST /auth/logout
 * @authentication Required
 */
export const logout = (req: Request, res: Response): void => {
  authService.logout((req.user as AuthUser).jti);
  res.clearCookie(COOKIE_NAME);
  res.json({ message: 'Logged out' });
};

/**
 * Returns the currently authenticated user's profile information.
 * @route GET /auth/me
 * @authentication Required
 */
export const getMe = (req: Request, res: Response): void => {
  const user = req.user as AuthUser;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
};

/**
 * Initiates the password recovery process.
 * Generates a reset code if the email exists.
 * @route POST /auth/forgot-password
 * @body {string} email
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as Record<string, unknown>;
  if (typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' }); return;
  }
  const code = await authService.generateResetCode(email.trim().toLowerCase());
  res.json({ message: 'If that email is registered, a reset code has been generated.', code });
};

/**
 * Resets the password using a recovery code.
 * Clears existing sessions for security after a successful reset.
 * @route POST /auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, code, newPassword } = req.body as Record<string, unknown>;
  if (typeof email !== 'string' || typeof code !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'Email, code, and new password are required' }); return;
  }
  if (!isStrongPassword(newPassword)) {
    res.status(400).json({ error: 'Password must be at least 6 characters' }); return;
  }
  try {
    await authService.resetPassword(email.trim().toLowerCase(), code.trim(), newPassword);
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Changes the password for a logged-in user.
 * Requires the current password to verify ownership.
 * @route POST /auth/change-password
 * @authentication Required
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as AuthUser;
  const { currentPassword, newPassword } = req.body as Record<string, unknown>;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'Current password and new password are required' }); return;
  }
  if (!isStrongPassword(newPassword)) {
    res.status(400).json({ error: 'New password must be at least 6 characters' }); return;
  }
  try {
    await authService.changePassword(user.id, user.jti, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    if (err instanceof AppError) res.status(err.status).json({ error: err.message });
    else res.status(500).json({ error: 'Internal server error' });
  }
};