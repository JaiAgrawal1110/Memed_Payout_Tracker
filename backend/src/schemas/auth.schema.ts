import { z } from "zod";
import { ROLES } from "../types";

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email,
  // bcrypt ignores everything after 72 bytes, so cap it instead of silently truncating.
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(ROLES),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;