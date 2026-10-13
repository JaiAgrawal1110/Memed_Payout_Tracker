import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

const hasCode = (err: unknown, code: number): boolean =>
  typeof err === "object" && err !== null && (err as { code?: unknown }).code === code;

const isBodyParseError = (err: unknown): boolean =>
  typeof err === "object" && err !== null && (err as { type?: unknown }).type === "entity.parse.failed";

function toErrorBody(err: unknown): { status: number; body: ErrorBody } {
  if (err instanceof AppError) {
    return { status: err.statusCode, body: { code: err.code, message: err.message, details: err.details } };
  }
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ path: i.path.map(String).join("."), message: i.message }));
    return { status: 400, body: { code: "VALIDATION_ERROR", message: "Invalid request data", details } };
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
    return { status: 400, body: { code: "VALIDATION_ERROR", message: "Invalid data", details } };
  }
  if (err instanceof mongoose.Error.CastError) {
    return { status: 400, body: { code: "INVALID_ID", message: `Invalid value for ${err.path}` } };
  }
  if (hasCode(err, 11000)) {
    return { status: 409, body: { code: "DUPLICATE", message: "A record with these details already exists" } };
  }
  if (isBodyParseError(err)) {
    return { status: 400, body: { code: "INVALID_JSON", message: "Request body is not valid JSON" } };
  }
  return { status: 500, body: { code: "INTERNAL_ERROR", message: "Something went wrong" } };
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Express recognises error middleware by its 4-argument signature.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const { status, body } = toErrorBody(err);
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, error: body });
};
