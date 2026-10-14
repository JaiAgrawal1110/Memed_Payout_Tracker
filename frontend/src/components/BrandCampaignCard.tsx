import type { BrandCampaign } from "@/lib/types";
import { BudgetBar } from "./BudgetBar";
import { LadderList } from "./LadderList";

export function BrandCampaignCard({ campaign }: { campaign: BrandCampaign }) {
  return (
    <article className="card">
      <div className="card-head">
        <h3>{campaign.name}</h3>
        <div>
          <span className="chip">{campaign.platform}</span>{" "}
          <span className={`chip ${campaign.status === "live" ? "chip-ok" : "chip-warn"}`}>{campaign.status}</span>
        </div>
      </div>
      <BudgetBar spent={campaign.budgetSpent} total={campaign.totalBudget} />
      <p className="muted small">
        {campaign.submissionCount} submission{campaign.submissionCount === 1 ? "" : "s"}
      </p>
      <LadderList ladder={campaign.ladder} />
    </article>
  );
}