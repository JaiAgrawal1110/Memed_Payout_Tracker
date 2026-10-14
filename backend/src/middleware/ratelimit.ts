import { rateLimit } from "express-rate-limit";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

/** Brute-force protection for login/signup: 20 attempts per 15 minutes per IP. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  handler: (_req, _res, next) => next(new AppError(429, "RATE_LIMITED", "Too many attempts, try again later")),
});