import { Router }      from 'express';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/limiter';
import {
  register, login, logout, getMe,
  forgotPassword, resetPassword, changePassword,
} from '../controller/auth.controller';

const router = Router();

router.post('/register',        authLimiter, register);
router.post('/login',           authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);

router.post('/reset-password', resetPassword);

router.post('/logout',          requireAuth, logout);
router.get('/me',               requireAuth, getMe);
router.post('/change-password', requireAuth, changePassword);

export default router;
