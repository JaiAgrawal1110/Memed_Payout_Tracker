"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { NativeSelect, NativeSelectOption } from "@/components/tailgrids/core/native-select";
import { api } from "@/lib/api";
import type { Campaign, Platform } from "@/lib/types";
import { ErrorBanner } from "./ErrorBanner";
import { Field } from "./Field";
import { LadderBuilder, type LadderRow } from "./LadderBuilder";
import { Notice } from "./Notice";

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
  const [created, setCreated] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);

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
      setCreated(campaign.name);
      setName("");
      setLadder(EXAMPLE_LADDER);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="card md:min-w-0 gap-4 pb-5">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neutral-900">Create a campaign</CardTitle>
        <CardDescription className="mt-1 text-sm text-neutral-600">Set a budget and the milestones creators are paid for.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <ErrorBanner error={error} />
          {created && <Notice status="success" title={`“${created}” is live`} />}

          <Field label="Campaign name" htmlFor="campaign-name">
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer Drop"
              required
              minLength={2}
              className="w-full"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform" htmlFor="campaign-platform">
              <NativeSelect
                id="campaign-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
              >
                <NativeSelectOption value="instagram">Instagram</NativeSelectOption>
                <NativeSelectOption value="youtube">YouTube</NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field label="Total budget (₹)" htmlFor="campaign-budget">
              <Input
                id="campaign-budget"
                type="number"
                min={1}
                step={1}
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                required
                className="w-full"
              />
            </Field>
          </div>

          <LadderBuilder rows={ladder} onChange={setLadder} />

          <Button type="submit" size="lg" pending={submitting} className="w-full">
            {submitting ? "Creating…" : "Create campaign"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
