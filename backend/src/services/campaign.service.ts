import type { HydratedDocument, Types } from "mongoose";
import { cacheDel, cacheGet, cacheSet, LIVE_CAMPAIGNS_KEY } from "../config/redis";
import { Campaign, type ICampaign } from "../models/Campaign";
import { Submission } from "../models/Submission";
import { User } from "../models/User";
import type { CreateCampaignInput } from "../schemas/campaign.schema";
import type { MilestoneStep, Platform } from "../types";
import { getRemainingBudget, isCampaignLive } from "./payout.service";

export type CampaignStatus = "live" | "exhausted";

export interface CampaignDto {
  id: string;
  name: string;
  platform: Platform;
  totalBudget: number;
  budgetSpent: number;
  remainingBudget: number;
  status: CampaignStatus;
  ladder: MilestoneStep[];
  createdAt: Date;
}

export interface BrandCampaignDto extends CampaignDto {
  submissionCount: number;
}

export interface LiveCampaignDto extends CampaignDto {
  brand: { id: string; name: string };
}

/** Mongo-side equivalent of `isCampaignLive`: a campaign is live while budget remains. */
export const LIVE_CAMPAIGN_FILTER = { $expr: { $lt: ["$budgetSpent", "$totalBudget"] } };

/** Upper bound on list responses (no pagination yet; see the scaling note). */
const MAX_LIST = 100;

/** Short TTL: a safety net in case an invalidation is missed (e.g. a reservation that is later released). */
const LIVE_CACHE_TTL_SECONDS = 30;

export function toCampaignDto(c: HydratedDocument<ICampaign>): CampaignDto {
  return {
    id: String(c._id),
    name: c.name,
    platform: c.platform,
    totalBudget: c.totalBudget,
    budgetSpent: c.budgetSpent,
    remainingBudget: getRemainingBudget(c),
    status: isCampaignLive(c) ? "live" : "exhausted",
    ladder: c.ladder.map(({ views, payout }) => ({ views, payout })),
    createdAt: c.createdAt,
  };
}

export async function createCampaign(brandId: string, input: CreateCampaignInput): Promise<CampaignDto> {
  const campaign = await Campaign.create({ brand: brandId, ...input });
  await cacheDel(LIVE_CAMPAIGNS_KEY); // a new live campaign must show up immediately
  return toCampaignDto(campaign);
}

/** A brand's own campaigns, newest first, with budget spent vs remaining and a submission count. */
export async function listBrandCampaigns(brandId: string): Promise<BrandCampaignDto[]> {
  const campaigns = await Campaign.find({ brand: brandId }).sort({ createdAt: -1 }).limit(MAX_LIST);

  const counts = await Submission.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { campaign: { $in: campaigns.map((c) => c._id) } } },
    { $group: { _id: "$campaign", count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((row) => [String(row._id), row.count]));

  return campaigns.map((c) => ({ ...toCampaignDto(c), submissionCount: countById.get(String(c._id)) ?? 0 }));
}

/**
 * Campaigns creators can submit to: only those with budget left, newest first.
 * Cached in Redis (shared by all creators). Falls back to Mongo if Redis is unset or down.
 */
export async function listLiveCampaigns(): Promise<LiveCampaignDto[]> {
  const cached = await cacheGet<LiveCampaignDto[]>(LIVE_CAMPAIGNS_KEY);
  if (cached) return cached;

  const campaigns = await Campaign.find(LIVE_CAMPAIGN_FILTER).sort({ createdAt: -1 }).limit(MAX_LIST);

  const brandIds = [...new Set(campaigns.map((c) => String(c.brand)))];
  const brands = await User.find({ _id: { $in: brandIds } }).select("name");
  const brandName = new Map(brands.map((b) => [String(b._id), b.name]));

  const result = campaigns.map((c) => ({
    ...toCampaignDto(c),
    brand: { id: String(c.brand), name: brandName.get(String(c.brand)) ?? "Unknown brand" },
  }));

  await cacheSet(LIVE_CAMPAIGNS_KEY, result, LIVE_CACHE_TTL_SECONDS);
  return result;
}
