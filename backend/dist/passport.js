"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COOKIE_NAME = exports.JWT_SECRET = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const sessionStore_1 = require("./store/sessionStore");
/** * Secret key used to sign and verify JWTs.
 * Defaults to a hardcoded string if process.env.JWT_SECRET is missing.
 */
exports.JWT_SECRET = process.env.JWT_SECRET || 'kinnari_secret_key';
exports.COOKIE_NAME = 'token';
/**
 * Extracts the JWT from the 'token' cookie.
 * @param req - The incoming Express request object.
 * @returns The JWT string if found, otherwise null.
 */
const cookieExtractor = (req) => req?.cookies?.[exports.COOKIE_NAME] ?? null;
/**
 * Passport configuration for JSON Web Token (JWT) authentication.
 * * This strategy is 'stateful' because it validates the 'jti' (JWT ID)
 * against a server-side session store before granting access.
 */
passport_1.default.use(new passport_jwt_1.Strategy({ jwtFromRequest: cookieExtractor, secretOrKey: exports.JWT_SECRET }, async (payload, done) => {
    try {
        const session = sessionStore_1.sessionStore.get(payload.jti);
        if (!session)
            return done(null, false);
        const user = await data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ id: payload.sub });
        if (!user)
            return done(null, false);
        if (user.isLocked) {
            sessionStore_1.sessionStore.delete(payload.jti);
            return done(null, false);
        }
        return done(null, { ...user, jti: payload.jti });
    }
    catch (err) {
        return done(err, false);
    }
}));
exports.default = passport_1.default;
