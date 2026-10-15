"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrandCampaignCard } from "@/components/BrandCampaignCard";
import { CreateCampaignForm } from "@/components/CreateCampaignForm";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ChartIcon, DocumentIcon, MegaphoneIcon, WalletIcon } from "@/components/icons";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/tailgrids/core/button";
import { Spinner } from "@/components/tailgrids/core/spinner";
import { TwoToneHeading } from "@/components/TwoToneHeading";
import { api } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import type { BrandCampaign } from "@/lib/types";

export default function BrandPage() {
  const { user, ready } = useRequireRole("brand");
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

  const totals = useMemo(
    () => ({
      live: campaigns.filter((c) => c.status === "live").length,
      budget: campaigns.reduce((sum, c) => sum + c.totalBudget, 0),
      spent: campaigns.reduce((sum, c) => sum + c.budgetSpent, 0),
      submissions: campaigns.reduce((sum, c) => sum + c.submissionCount, 0),
    }),
    [campaigns],
  );

  if (!ready) {
    return (
      <div className="flex justify-center py-24 text-neutral-500">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-600">Brand dashboard</p>
          <TwoToneHeading strong={`Hey ${user?.name.split(" ")[0]},`} soft="here's your budget" />
        </div>
        <Button size="sm" appearance="outline" onPress={reload}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live campaigns" value={totals.live} hint={`${campaigns.length} total`} icon={<MegaphoneIcon />} />
        <StatCard label="Total budget" value={formatINR(totals.budget)} hint="across all campaigns" icon={<WalletIcon />} />
        <StatCard
          label="Paid out"
          value={formatINR(totals.spent)}
          hint={`${formatINR(Math.max(0, totals.budget - totals.spent))} remaining`}
          icon={<ChartIcon />}
        />
        <StatCard label="Submissions" value={totals.submissions} hint="posts from creators" icon={<DocumentIcon />} />
      </div>

      <ErrorBanner error={error} />

      <div className="grid items-start gap-6 lg:grid-cols-5 xl:grid-cols-[minmax(0,460px)_1fr]">
        <div className="lg:col-span-2 xl:col-span-1">
          <CreateCampaignForm onCreated={reload} />
        </div>

        <section className="flex flex-col gap-4 lg:col-span-3 xl:col-span-1">
          <h2 className="text-lg font-bold text-neutral-900">Budget overview</h2>
          {loading ? (
            <div className="flex justify-center py-16 text-neutral-500">
              <Spinner />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="panel p-10 text-center text-sm text-neutral-600">
              No campaigns yet. Create your first one to start receiving submissions.
            </div>
          ) : (
            <div className="grid gap-4 2xl:grid-cols-2">
              {campaigns.map((c) => (
                <BrandCampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
