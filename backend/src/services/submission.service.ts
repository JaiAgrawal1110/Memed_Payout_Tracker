import { Types, type HydratedDocument } from "mongoose";
import { Campaign, type ICampaign } from "../models/Campaign";
import { Submission, type ISubmission } from "../models/Submission";
import type { Platform } from "../types";
import { AppError } from "../utils/AppError";
import { isDuplicateKeyError } from "../utils/mongoErrors";
import { normalizePostLink } from "../utils/postLink";
import { isCampaignLive } from "./payout.service";

export interface SubmissionDto {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: Platform;
  postLink: string;
  views: number;
  amountPaid: number;
  flagged: boolean;
  createdAt: Date;
}

export interface EarningsDto {
  totalEarnings: number;
  submissionCount: number;
  submissions: SubmissionDto[];
}

const MAX_LIST = 200;

function toSubmissionDto(
  s: HydratedDocument<ISubmission>,
  campaign: Pick<ICampaign, "name" | "platform">,
): SubmissionDto {
  return {
    id: String(s._id),
    campaignId: String(s.campaign),
    campaignName: campaign.name,
    platform: campaign.platform,
    postLink: s.postLink,
    views: s.views,
    amountPaid: s.amountPaid,
    flagged: s.flagged,
    createdAt: s.createdAt,
  };
}

export async function createSubmission(
  creatorId: string,
  campaignId: string,
  rawPostLink: string,
): Promise<SubmissionDto> {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw AppError.notFound("Campaign not found");
  if (!isCampaignLive(campaign)) {
    throw AppError.conflict("This campaign has no budget left and is closed to new submissions");
  }

  const postLink = normalizePostLink(campaign.platform, rawPostLink);

  try {
    const submission = await Submission.create({ campaign: campaign._id, creator: creatorId, postLink });
    return toSubmissionDto(submission, campaign);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw AppError.conflict("This post link has already been submitted to this campaign");
    }
    throw err;
  }
}

/** Total earnings across all of a creator's posts, plus each post's views and payout. */
export async function getCreatorEarnings(creatorId: string): Promise<EarningsDto> {
  const [totals] = await Submission.aggregate<{ total: number; count: number }>([
    { $match: { creator: new Types.ObjectId(creatorId) } },
    { $group: { _id: null, total: { $sum: "$amountPaid" }, count: { $sum: 1 } } },
  ]);

  const submissions = await Submission.find({ creator: creatorId }).sort({ createdAt: -1 }).limit(MAX_LIST);
  const campaigns = await Campaign.find({ _id: { $in: submissions.map((s) => s.campaign) } }).select("name platform");
  const campaignById = new Map(campaigns.map((c) => [String(c._id), c]));

  return {
    totalEarnings: totals?.total ?? 0,
    submissionCount: totals?.count ?? 0,
    submissions: submissions.map((s) =>
      toSubmissionDto(s, campaignById.get(String(s.campaign)) ?? { name: "Deleted campaign", platform: "instagram" }),
    ),
  };
}
