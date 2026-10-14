"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { LiveCampaign } from "@/lib/types";
import { BudgetBar } from "./BudgetBar";
import { ErrorBanner } from "./ErrorBanner";
import { LadderList } from "./LadderList";

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
    <article className="card">
      <div className="card-head">
        <h3>{campaign.name}</h3>
        <span className="chip">{campaign.platform}</span>
      </div>
      <p className="muted small">by {campaign.brand.name}</p>
      <BudgetBar spent={campaign.budgetSpent} total={campaign.totalBudget} />
      <LadderList ladder={campaign.ladder} />

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="url"
          value={postLink}
          onChange={(e) => setPostLink(e.target.value)}
          placeholder={`Paste your ${campaign.platform} post link`}
          aria-label={`Post link for ${campaign.name}`}
          required
        />
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit post"}
        </button>
      </form>
      <ErrorBanner error={error} />
      {done && <p className="banner banner-ok">Post submitted. Update its views below to see earnings.</p>}
    </article>
  );
}
