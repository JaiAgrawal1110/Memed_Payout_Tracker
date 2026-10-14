import { Router } from "express";
import * as submissionController from "../controllers/submission.controller";
import { validate } from "../middleware/validate";
import { objectIdParamSchema } from "../schemas/campaign.schema";
import { updateViewsSchema } from "../schemas/submission.schema";

export const submissionRouter = Router();

// Simulates the platform pushing fresh view counts, so it is intentionally unauthenticated (see README).
submissionRouter.patch(
  "/:id/views",
  validate(objectIdParamSchema, "params"),
  validate(updateViewsSchema),
  submissionController.updateViews,
);
