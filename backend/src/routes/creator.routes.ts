import { Router } from "express";
import * as creatorController from "../controllers/creator.controller";
import { authenticate, requireRole } from "../middleware/auth";

export const creatorRouter = Router();

creatorRouter.get("/me/earnings", authenticate, requireRole("creator"), creatorController.getMyEarnings);
