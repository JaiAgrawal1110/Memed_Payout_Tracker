"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandCampaignCard } from "@/components/BrandCampaignCard";
import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { ErrorBanner } from "@/components/ErrorBanner";
import { api } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import type { BrandCampaign } from "@/lib/types";

export default function BrandPage() {
  const { ready } = useRequireRole("brand");
  const [campaigns, setCampaigns] = useState<BrandCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // Bumping this re-runs the fetch effect (used by Refresh and after creating a campaign).
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    api
      .myCampaigns()
      .then((data) => {
        if (cancelled) return;
        setCampaigns(data.campaigns);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, reloadKey]);

  if (!ready) return <p className="muted">Loading…</p>;

  return (
    <div className="stack">
      <h1>Your campaigns</h1>
      <CreateCampaignForm onCreated={reload} />

      <div className="section-head">
        <h2>Budget overview</h2>
        <button className="btn btn-secondary" onClick={() => reload()}>
          Refresh
        </button>
      </div>
      <ErrorBanner error={error} />
      {loading ? (
        <p className="muted">Loading campaigns…</p>
      ) : campaigns.length === 0 ? (
        <p className="muted">No campaigns yet. Create your first one above.</p>
      ) : (
        <div className="grid">
          {campaigns.map((c) => (
            <BrandCampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
