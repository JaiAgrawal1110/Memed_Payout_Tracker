"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import type { Campaign, Platform } from "@/lib/types";
import { ErrorBanner } from "./ErrorBanner";
import { LadderBuilder, type LadderRow } from "./LadderBuilder";

const EXAMPLE_LADDER: LadderRow[] = [
  { views: "10000", payout: "500" },
  { views: "50000", payout: "2000" },
  { views: "100000", payout: "5000" },
];

export function CreateCampaignForm({ onCreated }: { onCreated: (campaign: Campaign) => void }) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [totalBudget, setTotalBudget] = useState("50000");
  const [ladder, setLadder] = useState<LadderRow[]>(EXAMPLE_LADDER);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const numericLadder = ladder.map((row) => ({ views: Number(row.views), payout: Number(row.payout) }));
    const incomplete = ladder.some((row) => row.views.trim() === "" || row.payout.trim() === "");
    if (incomplete || numericLadder.some((s) => !Number.isFinite(s.views) || !Number.isFinite(s.payout))) {
      setError(new Error("Fill in both views and payout for every milestone, or remove the empty rows."));
      return;
    }

    setSubmitting(true);
    try {
      const { campaign } = await api.createCampaign({
        name: name.trim(),
        platform,
        totalBudget: Number(totalBudget),
        ladder: numericLadder,
      });
      onCreated(campaign);
      setName("");
      setLadder(EXAMPLE_LADDER);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Create a campaign</h2>
      <ErrorBanner error={error} />

      <label>
        Campaign name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Drop" required minLength={2} />
      </label>

      <div className="row">
        <label>
          Platform
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>
        </label>
        <label>
          Total budget (₹)
          <input
            type="number"
            min={1}
            step={1}
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            required
          />
        </label>
      </div>

      <LadderBuilder rows={ladder} onChange={setLadder} />

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Creating…" : "Create campaign"}
      </button>
    </form>
  );
}
