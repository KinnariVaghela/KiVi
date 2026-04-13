import passport                      from 'passport';
import { Strategy as JwtStrategy }  from 'passport-jwt';
import { Request }                   from 'express';
import { AppDataSource }             from './data-source';
import { User }                      from './entity/User';
import { sessionStore }              from './store/sessionStore';

/** * Secret key used to sign and verify JWTs. 
 * Defaults to a hardcoded string if process.env.JWT_SECRET is missing.
 */
export const JWT_SECRET  = process.env.JWT_SECRET || 'kinnari_secret_key';
export const COOKIE_NAME = 'token';

/**
 * Extracts the JWT from the 'token' cookie.
 * @param req - The incoming Express request object.
 * @returns The JWT string if found, otherwise null.
 */
const cookieExtractor = (req: Request): string | null =>
  req?.cookies?.[COOKIE_NAME] ?? null;

/**
 * Passport configuration for JSON Web Token (JWT) authentication.
 * * This strategy is 'stateful' because it validates the 'jti' (JWT ID) 
 * against a server-side session store before granting access.
 */
passport.use(
  new JwtStrategy(
    { jwtFromRequest: cookieExtractor, secretOrKey: JWT_SECRET },
    async (payload: { sub: number; jti: string }, done) => {
      try {
        const session = sessionStore.get(payload.jti);
        if (!session) return done(null, false);

        const user = await AppDataSource.getRepository(User).findOneBy({ id: payload.sub });
        if (!user) return done(null, false);

        if (user.isLocked) {
          sessionStore.delete(payload.jti); 
          return done(null, false);
        }

        return done(null, { ...user, jti: payload.jti });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;