import type { ReactNode } from "react";
import { BoltIcon, ChartIcon, ShieldIcon } from "./icons";
import { TwoToneHeading } from "./TwoToneHeading";

const FEATURES = [
  { icon: <ChartIcon />, title: "Milestone payouts", text: "Creators earn the highest milestone their post crosses: simple, transparent, no stacking." },
  { icon: <ShieldIcon />, title: "Budget-safe by design", text: "A campaign can never pay out more than its remaining budget, even under heavy concurrency." },
  { icon: <BoltIcon />, title: "Live earnings", text: "View updates turn into payouts instantly, with no double-pay on repeated updates." },
];

const SAMPLE = [
  { views: "10K", pay: "₹500", pct: 100 },
  { views: "50K", pay: "₹2,000", pct: 64 },
  { views: "100K", pay: "₹5,000", pct: 18 },
];

/** Two-column layout for /login and /signup: pitch on the left (desktop), form on the right. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid items-center gap-12 py-4 lg:min-h-[calc(100dvh-10rem)] lg:grid-cols-[1.15fr_1fr] lg:gap-20">
      <section className="rise hidden flex-col gap-8 lg:flex">
        <span className="self-start rounded-full border border-neutral-900 bg-white px-3 py-1 text-xs font-medium text-neutral-800">
          Creator marketplace
        </span>
        <TwoToneHeading
          className="text-5xl leading-[1.08] xl:text-6xl"
          strong="Pay creators for"
          soft="the views that matter."
        />
        <p className="max-w-lg text-lg text-neutral-600">
          Brands set a budget and a milestone ladder. Creators post, hit milestones and get paid automatically, and never
          over budget.
        </p>

        <ul className="flex flex-col gap-5">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-900 bg-white text-neutral-900">
                {f.icon}
              </span>
              <div>
                <p className="font-semibold text-neutral-900">{f.title}</p>
                <p className="text-sm text-neutral-600">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="card flex max-w-lg flex-col gap-3 p-5">
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Example ladder</p>
          {SAMPLE.map((s) => (
            <div key={s.views} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-neutral-600">{s.views}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#3b4453]">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-violet-300" style={{ width: `${s.pct}%` }} />
              </div>
              <span className="w-14 text-right font-semibold text-neutral-900">{s.pay}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-md lg:max-w-lg">{children}</div>
    </div>
  );
}
