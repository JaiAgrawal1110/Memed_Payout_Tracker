"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ChartIcon, DocumentIcon, MegaphoneIcon } from "@/components/icons";
import { LiveCampaignCard } from "@/components/LiveCampaignCard";
import { MiniBars } from "@/components/MiniBars";
import { SortHeader, type SortDir } from "@/components/SortHeader";
import { StatCard } from "@/components/StatCard";
import { SubmissionRow } from "@/components/SubmissionRow";
import { Button } from "@/components/tailgrids/core/button";
import { Spinner } from "@/components/tailgrids/core/spinner";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@/components/tailgrids/core/table";
import { TwoToneHeading } from "@/components/TwoToneHeading";
import { api } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import { formatINR, formatViews } from "@/lib/format";
import type { Earnings, LiveCampaign, Submission } from "@/lib/types";

type SortKey = "post" | "views" | "earned";

const compareBy: Record<SortKey, (a: Submission, b: Submission) => number> = {
  post: (a, b) => a.campaignName.localeCompare(b.campaignName),
  views: (a, b) => a.views - b.views,
  earned: (a, b) => a.amountPaid - b.amountPaid,
};

export default function CreatorPage() {
  const { user, ready } = useRequireRole("creator");
  const [campaigns, setCampaigns] = useState<LiveCampaign[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);

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

  const ladderByCampaign = useMemo(() => new Map(campaigns.map((c) => [c.id, c.ladder])), [campaigns]);
  const submissions = useMemo(() => earnings?.submissions ?? [], [earnings]);

  const sorted = useMemo(() => {
    if (!sort) return submissions;
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...submissions].sort((a, b) => compareBy[sort.key](a, b) * direction);
  }, [submissions, sort]);

  // Earnings per post for the 7 most recent posts, oldest first (the API returns newest first).
  const recentEarnings = useMemo(() => {
    const values = submissions.slice(0, 7).map((s) => s.amountPaid).reverse();
    return [...Array<number>(Math.max(0, 7 - values.length)).fill(0), ...values];
  }, [submissions]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) => (prev?.key !== key ? { key, dir: "asc" } : prev.dir === "asc" ? { key, dir: "desc" } : null));

  if (!ready) {
    return (
      <div className="flex justify-center py-24 text-neutral-500">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalViews = submissions.reduce((sum, s) => sum + s.views, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="rise flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-600">Creator dashboard</p>
          <TwoToneHeading strong={`Hey ${user?.name.split(" ")[0]},`} soft="here's your payout" />
        </div>
        <Button size="sm" appearance="outline" onPress={reload}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total earnings"
          value={formatINR(earnings?.totalEarnings ?? 0)}
          hint="paid out so far"
          icon={<ChartIcon />}
          aside={<MiniBars values={recentEarnings} label="Recent posts" />}
        />
        <StatCard label="Posts submitted" value={earnings?.submissionCount ?? 0} hint="across all campaigns" icon={<DocumentIcon />} />
        <StatCard label="Live campaigns" value={campaigns.length} hint="open for submissions" icon={<MegaphoneIcon />} />
      </div>

      <ErrorBanner error={error} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-neutral-900">Live campaigns</h2>
        {loading ? (
          <div className="flex justify-center py-16 text-neutral-500">
            <Spinner />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-neutral-600">No live campaigns right now. Check back soon.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((c) => (
              <LiveCampaignCard key={c.id} campaign={c} onSubmitted={reload} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-neutral-900">My posts</h2>
        {submissions.length === 0 ? (
          <div className="panel p-10 text-center text-sm text-neutral-600">
            You haven&apos;t submitted any posts yet. Pick a campaign above and paste your link.
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <TableRoot
              fullBleed
              className="border-y-0 [&_td]:border-t [&_td]:border-[#e6dfcf] [&_td]:px-5 [&_td]:py-4 [&_th]:px-5 [&_th]:py-3.5"
            >
              <TableHeader>
                <TableRow>
                  <SortHeader label="Post" active={sort?.key === "post"} dir={sort?.dir ?? "asc"} onClick={() => toggleSort("post")} />
                  <SortHeader label="Views" active={sort?.key === "views"} dir={sort?.dir ?? "asc"} onClick={() => toggleSort("views")} />
                  <SortHeader label="Earned" active={sort?.key === "earned"} dir={sort?.dir ?? "asc"} onClick={() => toggleSort("earned")} />
                  <TableHead>
                    <span className="text-[13px] font-medium text-neutral-500">Simulate platform views (demo)</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((s) => (
                  <SubmissionRow key={s.id} submission={s} ladder={ladderByCampaign.get(s.campaignId)} onUpdated={reload} />
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-neutral-500">
                    {totalViews === 0
                      ? "No new views yet."
                      : `${submissions.length} post${submissions.length === 1 ? "" : "s"} · ${formatViews(totalViews)} total views`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </TableRoot>
          </div>
        )}
      </section>
    </div>
  );
}
