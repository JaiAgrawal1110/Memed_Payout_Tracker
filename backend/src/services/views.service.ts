/**
 * Applying a view-count update and paying the creator, safely under concurrency.
 *
 * Money moves between two documents (campaign.budgetSpent and submission.amountPaid), and MongoDB only
 * guarantees atomicity per document. Instead of a multi-document transaction (which needs a replica set,
 * so it would not work on a plain local mongod or a simple docker-compose), each step is made safe on its own:
 *
 *   1. RESERVE budget:  one atomic conditional update on the campaign,
 *                       "budgetSpent + payout <= totalBudget, then $inc". It cannot overspend, however many
 *                       requests race. If the guard fails, the budget changed under us: re-read and recompute.
 *   2. CREDIT creator:  one atomic conditional update on the submission,
 *                       "amountPaid is still the value I calculated from". If another request already paid this
 *                       submission the guard fails, so the same update can never be paid twice.
 *                       On that definite miss the reservation is handed back, then we re-read and retry.
 *
 * Invariants:
 *   - campaign.budgetSpent <= campaign.totalBudget                (step 1's guard)
 *   - sum(submission.amountPaid) <= campaign.budgetSpent          (credit only ever follows a reservation)
 *
 * Failure mode: if the process dies, or the credit call errors with an UNKNOWN outcome, between steps 1 and 2,
 * the reservation is deliberately NOT released (we cannot know whether the credit landed). The campaign then
 * shows slightly less remaining budget than reality: it can under-spend but never overspend. It is reconcilable
 * by comparing budgetSpent with the sum of amountPaid.
 */
import type { Types } from "mongoose";
import { Campaign } from "../models/Campaign";
import { Submission } from "../models/Submission";
import type { MilestoneStep } from "../types";
import { AppError } from "../utils/AppError";
import { calculatePayout, getRemainingBudget, type PayoutResult } from "./payout.service";

/** Each failed attempt means another request made progress, so this only runs out under extreme contention. */
export const MAX_ATTEMPTS = 10;

export interface ViewsUpdateResult {
  submission: { id: string; campaignId: string; views: number; amountPaid: number };
  payout: { paidNow: number; cappedByBudget: boolean; entitled: number; milestone: MilestoneStep | null };
  campaign: { id: string; totalBudget: number; budgetSpent: number; remainingBudget: number };
}

interface SubmissionLike {
  _id: Types.ObjectId;
  campaign: Types.ObjectId;
  views: number;
  amountPaid: number;
}

interface CampaignLike {
  _id: Types.ObjectId;
  totalBudget: number;
  budgetSpent: number;
}

/** Mongo filter that only matches while `amount` still fits inside the campaign's budget. */
export function budgetGuard(campaignId: Types.ObjectId, amount: number) {
  return { _id: campaignId, $expr: { $lte: [{ $add: ["$budgetSpent", amount] }, "$totalBudget"] } };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const backoffMs = (attempt: number) => Math.floor(Math.random() * 15 * attempt);

function buildResult(submission: SubmissionLike, campaign: CampaignLike, calc: PayoutResult): ViewsUpdateResult {
  return {
    submission: {
      id: String(submission._id),
      campaignId: String(submission.campaign),
      views: submission.views,
      amountPaid: submission.amountPaid,
    },
    payout: {
      paidNow: calc.payout,
      cappedByBudget: calc.cappedByBudget,
      entitled: calc.entitled,
      milestone: calc.milestone,
    },
    campaign: {
      id: String(campaign._id),
      totalBudget: campaign.totalBudget,
      budgetSpent: campaign.budgetSpent,
      remainingBudget: getRemainingBudget(campaign),
    },
  };
}

/** Hands a reservation back after a *definite* credit miss. Failure here only leaves budget over-reserved (safe). */
async function releaseReservation(campaignId: Types.ObjectId, amount: number): Promise<void> {
  try {
    await Campaign.updateOne({ _id: campaignId }, { $inc: { budgetSpent: -amount } });
  } catch (err) {
    console.error(`[payout] could not release reserved ₹${amount} on campaign ${campaignId}; reconcile budgetSpent`, err);
  }
}

export async function updateSubmissionViews(submissionId: string, views: number): Promise<ViewsUpdateResult> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw AppError.notFound("Submission not found");

    const campaign = await Campaign.findById(submission.campaign);
    if (!campaign) throw AppError.notFound("The campaign for this submission no longer exists");

    const calc = calculatePayout(views, campaign.ladder, submission.amountPaid, getRemainingBudget(campaign));
    const now = new Date();

    // Nothing to pay (below the first milestone, already paid, views fell, or budget exhausted): just record views.
    if (calc.payout === 0) {
      const updated = await Submission.findByIdAndUpdate(
        submissionId,
        { $set: { views, lastViewsUpdatedAt: now } },
        { new: true },
      );
      if (!updated) throw AppError.notFound("Submission not found");
      return buildResult(updated, campaign, calc);
    }

    // Step 1: reserve budget atomically. A miss means the budget changed under us.
    const reserved = await Campaign.findOneAndUpdate(
      budgetGuard(campaign._id, calc.payout),
      { $inc: { budgetSpent: calc.payout } },
      { new: true },
    );
    if (!reserved) {
      if (attempt < MAX_ATTEMPTS) await sleep(backoffMs(attempt));
      continue;
    }

    // Step 2: credit the creator, but only if nobody paid this submission since we read it.
    // If this call THROWS we don't know whether it landed, so we must not release the reservation.
    const credited = await Submission.findOneAndUpdate(
      { _id: submission._id, amountPaid: submission.amountPaid },
      { $set: { views, amountPaid: calc.newTotalPaid, lastViewsUpdatedAt: now } },
      { new: true },
    );
    if (!credited) {
      await releaseReservation(campaign._id, calc.payout);
      if (attempt < MAX_ATTEMPTS) await sleep(backoffMs(attempt));
      continue;
    }

    return buildResult(credited, reserved, calc);
  }

  throw new AppError(409, "CONCURRENT_UPDATE", "This submission is being updated by too many requests at once; please retry");
}
