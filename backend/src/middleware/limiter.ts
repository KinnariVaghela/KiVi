import rateLimit from 'express-rate-limit';

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
export const authLimiter = rateLimit({
  windowMs:       15 * 60 * 1000, 
  max:            10,             
  standardHeaders: true,
  legacyHeaders:  false,
  message: { error: 'Too many requests, please try again later.' },
});