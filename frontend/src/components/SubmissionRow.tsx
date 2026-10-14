"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { formatINR, formatViews } from "@/lib/format";
import type { Submission } from "@/lib/types";
import { ErrorBanner } from "./ErrorBanner";

/** One of the creator's posts, with a demo control that simulates the platform reporting a new view count. */
export function SubmissionRow({ submission, onUpdated }: { submission: Submission; onUpdated: () => void }) {
  const [views, setViews] = useState(String(submission.views));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [note, setNote] = useState<string | null>(null);

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
          ? `Paid ${formatINR(paidNow)}${cappedByBudget ? " (partial: campaign budget ran out)" : ""}`
          : cappedByBudget
            ? "Campaign budget is exhausted: nothing more can be paid."
            : "No new payout for this view count.",
      );
      onUpdated();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr>
      <td>
        <strong>{submission.campaignName}</strong>
        <br />
        <a href={submission.postLink} target="_blank" rel="noreferrer noopener" className="small">
          {submission.postLink}
        </a>
      </td>
      <td>{formatViews(submission.views)}</td>
      <td>
        <strong>{formatINR(submission.amountPaid)}</strong>
        {submission.flagged && <span className="chip chip-warn"> flagged</span>}
      </td>
      <td>
        <form className="inline-form" onSubmit={handleSubmit}>
          <input
            type="number"
            min={0}
            step={1}
            value={views}
            onChange={(e) => setViews(e.target.value)}
            aria-label="Simulated view count"
            required
          />
          <button className="btn btn-secondary" type="submit" disabled={busy}>
            {busy ? "…" : "Update views"}
          </button>
        </form>
        {note && <p className="small muted">{note}</p>}
        <ErrorBanner error={error} />
      </td>
    </tr>
  );
}
