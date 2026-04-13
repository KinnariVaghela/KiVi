import { Request, Response, NextFunction } from 'express';
import passport                            from '../passport';
import { UserRole }                        from '../entity/User';

/**
 * Defines the structure of a successfully authenticated user.
 * This object is injected into 'req.user' by the authentication middleware.
 */
export type AuthUser = {
  id:        number;
  name:      string;
  email:     string;
  role:      UserRole;
  isLocked:  boolean;
  createdAt: Date;
  jti:       string; 
};

/**
 * Middleware that requires a valid JWT to access the route.
 * Verifies the token and attaches the user payload to 'req.user'.
 * @throws 401 Unauthorized if the token is missing, expired, or invalid.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: AuthUser | false) => {
    if (err) return next(err);
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware that restricts access to users with the 'ADMIN' role.
 * First validates the JWT, then checks the user's role property.
 * @throws 401 Unauthorized if not logged in.
 * @throws 403 Forbidden if the user is not an administrator.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: AuthUser | false) => {
    if (err) return next(err);
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Forbidden: admin access required' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Middleware that restricts access to users with the 'CUSTOMER' role.
 * Useful for ensuring admins or guests don't accidentally perform customer-only actions (like placing an order).
 * @throws 401 Unauthorized if not logged in.
 * @throws 403 Forbidden if the user is not a customer.
 */
export const requireCustomer = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: AuthUser | false) => {
    if (err) return next(err);
    if (!user) { res.status(401).json({ error: 'Unauthorized' }); return; }
    if (user.role !== UserRole.CUSTOMER) {
      res.status(403).json({ error: 'Forbidden: customer access required' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};