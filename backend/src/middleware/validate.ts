import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

/**
 * Validates (and replaces) part of the request with the parsed Zod output.
 * Failures are forwarded to the central error handler as a ZodError.
 */
export const validate =
  (schema: ZodType, source: Source = "body"): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);

    if (source === "query") {
      // Express 5 exposes req.query as a getter, so it has to be redefined.
      Object.defineProperty(req, "query", { value: result.data, writable: true, configurable: true, enumerable: true });
    } else {
      (req as unknown as Record<Source, unknown>)[source] = result.data;
    }
    next();
  };
