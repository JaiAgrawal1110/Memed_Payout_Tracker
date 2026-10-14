import { Router } from "express";
import { authRouter } from "./auth.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
// Campaign, submission and creator routers are mounted here in later phases.