export type Role = "brand" | "creator";
export type Platform = "instagram" | "youtube";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface MilestoneStep {
  views: number;
  payout: number;
}

export interface Campaign {
  id: string;
  name: string;
  platform: Platform;
  totalBudget: number;
  budgetSpent: number;
  remainingBudget: number;
  status: "live" | "exhausted";
  ladder: MilestoneStep[];
  createdAt: string;
}

export interface BrandCampaign extends Campaign {
  submissionCount: number;
}

export interface LiveCampaign extends Campaign {
  brand: { id: string; name: string };
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: Platform;
  postLink: string;
  views: number;
  amountPaid: number;
  flagged: boolean;
  createdAt: string;
}

export interface Earnings {
  totalEarnings: number;
  submissionCount: number;
  submissions: Submission[];
}

export interface ViewsUpdateResult {
  submission: { id: string; campaignId: string; views: number; amountPaid: number };
  payout: { paidNow: number; cappedByBudget: boolean; entitled: number; milestone: MilestoneStep | null };
  campaign: { id: string; totalBudget: number; budgetSpent: number; remainingBudget: number };
}

export interface CreateCampaignInput {
  name: string;
  platform: Platform;
  totalBudget: number;
  ladder: MilestoneStep[];
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}
