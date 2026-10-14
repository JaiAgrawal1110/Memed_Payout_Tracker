export const ROLES = ["brand", "creator"] as const;
export type Role = (typeof ROLES)[number];

export const PLATFORMS = ["instagram", "youtube"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** One rung of the milestone ladder: crossing `views` earns a total payout of `payout` (INR). */
export interface MilestoneStep {
  views: number;
  payout: number;
}
/** Identity extracted from a verified JWT and attached to the request. */
export interface AuthUser {
  id: string;
  role: Role;
}