import type { Request, RequestHandler } from "express";
import type { AuthUser, Role } from "../types";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** Requires a valid `Authorization: Bearer <jwt>` header and attaches `req.user`. Stateless: no DB lookup. */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Missing or malformed Authorization header"));
  }

  try {
    req.user = verifyToken(header.slice("Bearer ".length).trim());
    next();
  } catch (err) {
    next(err);
  }
};

/** Use after `authenticate`. Allows only the listed roles. */
export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`This action is only available to: ${roles.join(", ")}`));
    }
    next();
  };

/** Returns the authenticated user or throws 401. Lets controllers avoid non-null assertions. */
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}