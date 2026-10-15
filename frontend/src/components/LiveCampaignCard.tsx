"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { api } from "@/lib/api";
import type { LiveCampaign } from "@/lib/types";
import { BudgetBar } from "./BudgetBar";
import { ErrorBanner } from "./ErrorBanner";
import { LadderList } from "./LadderList";
import { Notice } from "./Notice";
import { PlatformBadge } from "./PlatformBadge";

export function LiveCampaignCard({ campaign, onSubmitted }: { campaign: LiveCampaign; onSubmitted: () => void }) {
  const [postLink, setPostLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(false);
    setSubmitting(true);
    try {
      await api.submitPost(campaign.id, postLink);
      setPostLink("");
      setDone(true);
      onSubmitted();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="card rise md:min-w-0 gap-4 pb-5">
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-xl font-bold text-neutral-900">{campaign.name}</CardTitle>
          <p className="mt-1 text-xs text-neutral-600">by {campaign.brand.name}</p>
        </div>
        <PlatformBadge platform={campaign.platform} />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <BudgetBar spent={campaign.budgetSpent} total={campaign.totalBudget} />
        <LadderList ladder={campaign.ladder} />

        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            type="url"
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            placeholder={`Paste your ${campaign.platform} post link`}
            aria-label={`Post link for ${campaign.name}`}
            required
            className="w-full min-w-0"
          />
          <Button type="submit" pending={submitting} className="shrink-0">
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </form>
        <ErrorBanner error={error} />
        {done && <Notice status="success" title="Post submitted" />}
      </CardContent>
    </Card>
  );
}
