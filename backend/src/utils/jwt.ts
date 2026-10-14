import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ROLES, type AuthUser } from "../types";
import { AppError } from "./AppError";

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

/** Verifies a token and returns the identity inside it. Any failure becomes a 401. */
export function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
    if (typeof decoded === "object" && typeof decoded.sub === "string" && ROLES.includes(decoded.role)) {
      return { id: decoded.sub, role: decoded.role };
    }
  } catch {
    // fall through to the generic error below
  }
  throw AppError.unauthorized("Invalid or expired token");
}