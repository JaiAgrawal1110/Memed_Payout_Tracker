import { z } from "zod";

export const updateViewsSchema = z.object({
  views: z
    .number("views must be a number")
    .int("views must be a whole number")
    .min(0, "views cannot be negative")
    .max(1_000_000_000_000, "views is unrealistically large"),
});

export type UpdateViewsInput = z.output<typeof updateViewsSchema>;
