import { z } from "zod";
import { PLATFORMS } from "../types";
import { findLadderProblems, sortLadder } from "../utils/ladder";

export const objectIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id"),
});

const milestoneSchema = z.object({
  views: z.number().int("views must be a whole number").positive("views must be greater than 0"),
  payout: z.number().int("payout must be a whole number").positive("payout must be greater than 0"),
});

export const createCampaignSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
    platform: z.enum(PLATFORMS),
    totalBudget: z.number().int("totalBudget must be a whole number").positive("totalBudget must be greater than 0"),
    ladder: z.array(milestoneSchema).min(1, "Add at least one milestone").max(20, "At most 20 milestones"),
  })
  .superRefine((data, ctx) => {
    for (const message of findLadderProblems(data.ladder, data.totalBudget)) {
      ctx.addIssue({ code: "custom", message, path: ["ladder"] });
    }
  })
  // Accept the ladder in any order; store it ascending by views.
  .transform((data) => ({ ...data, ladder: sortLadder(data.ladder) }));

export const createSubmissionSchema = z.object({
  postLink: z.string().trim().min(1, "postLink is required").max(500),
});

export type CreateCampaignInput = z.output<typeof createCampaignSchema>;
export type CreateSubmissionInput = z.output<typeof createSubmissionSchema>;
