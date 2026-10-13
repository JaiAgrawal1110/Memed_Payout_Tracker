import { Schema, model, type Types } from "mongoose";
import { PLATFORMS, type MilestoneStep, type Platform } from "../types";

export interface ICampaign {
  brand: Types.ObjectId;
  name: string;
  platform: Platform;
  /** Whole rupees. */
  totalBudget: number;
  /** Whole rupees paid out so far. Only ever changed by an atomic $inc (see payout service). */
  budgetSpent: number;
  ladder: MilestoneStep[];
  createdAt: Date;
  updatedAt: Date;
}

const wholeNumber = {
  validator: Number.isInteger,
  message: "{PATH} must be a whole number",
};

const milestoneSchema = new Schema<MilestoneStep>(
  {
    views: { type: Number, required: true, min: 1, validate: wholeNumber },
    payout: { type: Number, required: true, min: 1, validate: wholeNumber },
  },
  { _id: false },
);

const campaignSchema = new Schema<ICampaign>(
  {
    brand: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    platform: { type: String, enum: PLATFORMS, required: true },
    totalBudget: { type: Number, required: true, min: 1, validate: wholeNumber },
    budgetSpent: { type: Number, default: 0, min: 0, validate: wholeNumber },
    ladder: {
      type: [milestoneSchema],
      validate: { validator: (v: unknown[]) => v.length >= 1, message: "ladder needs at least one milestone" },
    },
  },
  { timestamps: true },
);

campaignSchema.index({ brand: 1, createdAt: -1 });

export const Campaign = model<ICampaign>("Campaign", campaignSchema);
