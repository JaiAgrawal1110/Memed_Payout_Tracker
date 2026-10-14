import { Router } from "express";
import { authRouter } from "./auth.routes";
import { campaignRouter } from "./campaign.routes";
import { creatorRouter } from "./creator.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/campaigns", campaignRouter);
apiRouter.use("/creators", creatorRouter);
// PATCH /api/submissions/:id/views is mounted here in Phase 5.
