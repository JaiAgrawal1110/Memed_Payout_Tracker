"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { Progress } from "@/components/tailgrids/core/progress";
import { TableCell, TableRow } from "@/components/tailgrids/core/table";
import { api } from "@/lib/api";
import { formatINR, formatViews } from "@/lib/format";
import { nextMilestone } from "@/lib/milestones";
import type { MilestoneStep, Submission } from "@/lib/types";
import { ErrorBanner } from "./ErrorBanner";
import { PlatformBadge } from "./PlatformBadge";

interface Props {
  submission: Submission;
  /** Ladder of the post's campaign, when the campaign is still live (used for the progress hint). */
  ladder?: MilestoneStep[];
  onUpdated: () => void;
}

/** One of the creator's posts, with a demo control that simulates the platform reporting a new view count. */
export function SubmissionRow({ submission, ladder, onUpdated }: Props) {
  const [views, setViews] = useState(String(submission.views));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [note, setNote] = useState<string | null>(null);

  const next = ladder ? nextMilestone(submission.views, ladder) : null;
  const pct = next ? Math.min(100, Math.floor((submission.views / next.views) * 100)) : 100;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const result = await api.updateViews(submission.id, Number(views));
      const { paidNow, cappedByBudget } = result.payout;
      setNote(
        paidNow > 0
          ? `Paid ${formatINR(paidNow)}${cappedByBudget ? " (partial: budget ran out)" : ""}`
          : cappedByBudget
            ? "Budget exhausted: nothing more can be paid."
            : "No new payout at this view count.",
      );
      onUpdated();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <TableRow className="align-top">
      <TableCell className="min-w-56">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-neutral-900">{submission.campaignName}</span>
          <PlatformBadge platform={submission.platform} />
        </div>
        <a
          href={submission.postLink}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-1 block max-w-72 truncate text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
        >
          {submission.postLink}
        </a>
      </TableCell>

      <TableCell className="min-w-44">
        <div className="font-medium text-neutral-900">{formatViews(submission.views)}</div>
        {ladder &&
          (next ? (
            <div className="mt-2 flex flex-col gap-1">
              <Progress progress={pct} className="max-w-40" trackColor="#e3ded1" barColor="#2f6db5" />
              <span className="text-xs text-neutral-500">
                Next: {formatViews(next.views)} views → {formatINR(next.payout)}
              </span>
            </div>
          ) : (
            <span className="mt-1 block text-xs font-medium text-emerald-700">Top milestone reached</span>
          ))}
      </TableCell>

      <TableCell className="min-w-28">
        <span className="font-semibold text-neutral-900">{formatINR(submission.amountPaid)}</span>
        {submission.flagged && (
          <Badge color="warning" size="sm" className="ml-2">
            flagged
          </Badge>
        )}
      </TableCell>

      <TableCell className="min-w-64">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            type="number"
            min={0}
            step={1}
            value={views}
            onChange={(e) => setViews(e.target.value)}
            aria-label="Simulated view count"
            required
            className="w-28 min-w-0"
          />
          <Button type="submit" variant="success" appearance="outline" pending={busy}>
            {busy ? "…" : "Update views"}
          </Button>
        </form>
        {note && <p className="mt-1.5 text-xs text-neutral-600">{note}</p>}
        {error ? (
          <div className="mt-2">
            <ErrorBanner error={error} />
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
