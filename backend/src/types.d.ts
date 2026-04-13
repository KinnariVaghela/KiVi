import { AuthUser } from './middleware/auth';

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}
