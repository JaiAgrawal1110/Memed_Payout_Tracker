import { Router } from "express";
import * as campaignController from "../controllers/campaign.controller";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCampaignSchema, createSubmissionSchema, objectIdParamSchema } from "../schemas/campaign.schema";

export const campaignRouter = Router();

campaignRouter.use(authenticate);

// Brand
campaignRouter.post("/", requireRole("brand"), validate(createCampaignSchema), campaignController.createCampaign);
campaignRouter.get("/mine", requireRole("brand"), campaignController.listMyCampaigns);

// Creator
campaignRouter.get("/", requireRole("creator"), campaignController.listLiveCampaigns);
campaignRouter.post(
  "/:id/submissions",
  requireRole("creator"),
  validate(objectIdParamSchema, "params"),
  validate(createSubmissionSchema),
  campaignController.submitPost,
);
