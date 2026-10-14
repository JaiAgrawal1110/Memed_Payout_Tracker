"use client";

import { useCallback, useEffect, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LiveCampaignCard } from "@/components/LiveCampaignCard";
import { SubmissionRow } from "@/components/SubmissionRow";
import { api } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import type { Earnings, LiveCampaign } from "@/lib/types";

export default function CreatorPage() {
  const { ready } = useRequireRole("creator");
  const [campaigns, setCampaigns] = useState<LiveCampaign[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // Bumping this re-runs the fetch effect (used by Refresh, after submitting a post, after a views update).
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    Promise.all([api.liveCampaigns(), api.earnings()])
      .then(([live, mine]) => {
        if (cancelled) return;
        setCampaigns(live.campaigns);
        setEarnings(mine);
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
      <div className="section-head">
        <h1>Creator dashboard</h1>
        <button className="btn btn-secondary" onClick={reload}>
          Refresh
        </button>
      </div>
      <ErrorBanner error={error} />

      <section className="card earnings">
        <p className="muted small">Total earnings</p>
        <p className="big">{formatINR(earnings?.totalEarnings ?? 0)}</p>
        <p className="muted small">across {earnings?.submissionCount ?? 0} post(s)</p>
      </section>

      <h2>Live campaigns</h2>
      {loading ? (
        <p className="muted">Loading campaigns…</p>
      ) : campaigns.length === 0 ? (
        <p className="muted">No live campaigns right now. Check back soon.</p>
      ) : (
        <div className="grid">
          {campaigns.map((c) => (
            <LiveCampaignCard key={c.id} campaign={c} onSubmitted={reload} />
          ))}
        </div>
      )}

      <h2>My posts</h2>
      {!earnings || earnings.submissions.length === 0 ? (
        <p className="muted">You haven&apos;t submitted any posts yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Views</th>
                <th>Earned</th>
                <th>Simulate platform views (demo)</th>
              </tr>
            </thead>
            <tbody>
              {earnings.submissions.map((s) => (
                <SubmissionRow key={s.id} submission={s} onUpdated={reload} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
