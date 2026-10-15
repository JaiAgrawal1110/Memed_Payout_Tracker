import { Router } from "express";
import { authRouter } from "./auth.routes";
import { campaignRouter } from "./campaign.routes";
import { creatorRouter } from "./creator.routes";
import { submissionRouter } from "./submission.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/campaigns", campaignRouter);
apiRouter.use("/creators", creatorRouter);
apiRouter.use("/submissions", submissionRouter);

apiRouter.get("/", (_req, res) => {
  res.json({
    name: "Meme'd Payout Tracker API",
    endpoints: [
      "POST /api/auth/signup",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "POST /api/campaigns (brand)",
      "GET /api/campaigns/mine (brand)",
      "GET /api/campaigns (creator)",
      "POST /api/campaigns/:id/submissions (creator)",
      "GET /api/creators/me/earnings (creator)",
      "PATCH /api/submissions/:id/views",
    ],
  });
});
