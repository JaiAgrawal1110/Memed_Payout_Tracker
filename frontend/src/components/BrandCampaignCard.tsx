import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { BrandCampaign } from "@/lib/types";
import { BudgetBar } from "./BudgetBar";
import { LadderList } from "./LadderList";
import { PlatformBadge } from "./PlatformBadge";

export function BrandCampaignCard({ campaign }: { campaign: BrandCampaign }) {
  return (
    <Card className="card rise md:min-w-0 gap-4 pb-5">
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-xl font-bold text-neutral-900">{campaign.name}</CardTitle>
          <p className="mt-1 text-xs text-neutral-600">
            {campaign.submissionCount} submission{campaign.submissionCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <PlatformBadge platform={campaign.platform} />
          <Badge color={campaign.status === "live" ? "success" : "warning"} size="sm" className="capitalize">
            {campaign.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <BudgetBar spent={campaign.budgetSpent} total={campaign.totalBudget} />
        <LadderList ladder={campaign.ladder} />
      </CardContent>
    </Card>
  );
}
