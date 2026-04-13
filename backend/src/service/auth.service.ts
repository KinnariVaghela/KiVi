import bcrypt           from 'bcrypt';
import jwt              from 'jsonwebtoken';
import { randomUUID }   from 'crypto';
import { AppDataSource }     from '../data-source';
import { User, UserRole }    from '../entity/User';
import { PasswordResetCode } from '../entity/PasswordResetCode';
import { sessionStore }      from '../store/sessionStore';
import { JWT_SECRET, COOKIE_NAME } from '../passport';
import { AppError }          from '../errors';

/**
 * Validates email format using a standard RFC 5322 regex.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Enforces minimum password complexity.
 * Current requirement: Minimum 6 characters.
 */
export function isStrongPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validates international and local phone number formats.
 */
export function isValidPhone(phone: string): boolean {
  return /^[+\d\s\-()]{7,20}$/.test(phone.trim());
}

export class AuthService {

  /**
   * Hashes the password and creates a new Customer account.
   * @throws {AppError} 409 if the email is already in use.
   */
  async register(
    name:     string,
    email:    string,
    password: string,
    phone:    string,
    address:  string,
  ): Promise<User> {
    const repo = AppDataSource.getRepository(User);

    const existing = await repo.findOneBy({ email });
    if (existing) throw new AppError('Email already registered', 409);

    const user = repo.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      phone:   phone.trim()   || null,
      address: address.trim() || null,
      role:    UserRole.CUSTOMER,
    });

    return repo.save(user);
  }

  /**
   * Verifies credentials and generates a stateful JWT.
   * Injects a unique 'jti' into the token and tracks it in sessionStore 
   * to support session revocation.
   * @throws {AppError} 401 for bad credentials, 403 if account is locked.
   */
  async login(
    email:     string,
    password:  string,
    userAgent: string,
    ip:        string,
  ): Promise<{ token: string; cookieName: string; role: string; name: string }> {
    const user = await AppDataSource.getRepository(User).findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Invalid credentials', 401);
    }
    if (user.isLocked) {
      throw new AppError('Account is locked. Contact support.', 403);
    }

    const jti   = randomUUID();
    const token = jwt.sign(
      { sub: user.id, jti, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    sessionStore.create(jti, {
      userId:    user.id,
      role:      user.role,
      createdAt: new Date(),
      userAgent,
      ip,
    });

    return { token, cookieName: COOKIE_NAME, role: user.role, name: user.name };
  }

  logout(jti: string): void {
    sessionStore.delete(jti);
  }

  /**
   * Generates a 6-digit numeric recovery code valid for 10 minutes.
   * Deletes any previous codes for this email before creating a new one.
   * @returns {string|null} The code, or null if user does not exist.
   */
  async generateResetCode(email: string): Promise<string | null> {
    const user = await AppDataSource.getRepository(User).findOneBy({ email });
    if (!user) return null;

    const code      = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

    const repo = AppDataSource.getRepository(PasswordResetCode);
    await repo.delete({ email: user.email }); 
    await repo.save(repo.create({ email: user.email, code, expiresAt }));

    return code;
  }

  /**
   * Resets user password and invalidates ALL active sessions for that user.
   * @throws {AppError} 400 for expired/used codes.
   */
  async resetPassword(
    email:       string,
    code:        string,
    newPassword: string,
  ): Promise<void> {
    const codeRepo = AppDataSource.getRepository(PasswordResetCode);
    const entry = await codeRepo.findOneBy({ email, code });

    if (!entry || entry.used) {
      throw new AppError('Invalid or expired code', 400);
    }
    if (new Date() > entry.expiresAt) {
      throw new AppError('Code has expired. Please request a new one.', 400);
    }

    const userRepo = AppDataSource.getRepository(User);
    const user     = await userRepo.findOneBy({ email: entry.email });
    if (!user) throw new AppError('User not found', 404);

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepo.save(user);

    entry.used = true;
    await codeRepo.save(entry);

    sessionStore.deleteAllForUser(user.id);
  }

  /**
   * Changes password for a logged-in user.
   * Invalidates all other sessions except the current one.
   */
  async changePassword(
    userId:          number,
    currentJti:      string,
    currentPassword: string,
    newPassword:     string,
  ): Promise<void> {
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ id: userId });

    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await repo.save(user);

    for (const session of sessionStore.getForUser(userId)) {
      if (session.jti !== currentJti) sessionStore.delete(session.jti);
    }
  }
}

export const authService = new AuthService();