import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/ratelimit";
import { validate } from "../middleware/validate";
import { loginSchema, signupSchema } from "../schemas/auth.schema";

export const authRouter = Router();

authRouter.post("/signup", authRateLimiter, validate(signupSchema), authController.signup);
authRouter.post("/login", authRateLimiter, validate(loginSchema), authController.login);
authRouter.get("/me", authenticate, authController.me);