"use client";

import { useMemo, useState } from "react";

interface Field {
  key: string;
  label: string;
  hint: string;
  step?: number;
  prefix?: string;
}

const FIELDS: Field[] = [
  { key: "tasks", label: "Tasks per month", hint: "How many times is the task done?", step: 1 },
  { key: "minutes", label: "Minutes per task today", hint: "Measure it, do not guess.", step: 1 },
  { key: "share", label: "Share the automation handles (%)", hint: "Be realistic. 60 to 80 is common, not 100.", step: 5 },
  { key: "rate", label: "Loaded hourly cost", hint: "Salary plus benefits and overhead, per hour.", step: 1, prefix: "$" },
  { key: "errors", label: "Monthly cost of errors avoided", hint: "Rework, credits, penalties. Enter 0 if unsure.", step: 10, prefix: "$" },
  { key: "tool", label: "Tool or platform cost per month", hint: "Subscription, usage fees, API costs.", step: 1, prefix: "$" },
  { key: "maint", label: "Maintenance hours per month", hint: "Monitoring, fixes and updates.", step: 0.5 },
  { key: "build", label: "One-time build cost", hint: "Build hours × hourly cost, plus setup fees.", step: 50, prefix: "$" },
];

const DEFAULTS: Record<string, number> = {
  tasks: 400,
  minutes: 12,
  share: 70,
  rate: 45,
  errors: 150,
  tool: 60,
  maint: 3,
  build: 2400,
};

const usd = (n: number) =>
  (n < 0 ? "-" : "") + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");

export default function RoiCalculator() {
  const [v, setV] = useState<Record<string, number>>(DEFAULTS);

  const r = useMemo(() => {
    const hours = (v.tasks * v.minutes * (v.share / 100)) / 60;
    const benefit = hours * v.rate + v.errors;
    const running = v.tool + v.maint * v.rate;
    const net = benefit - running;
    const payback = net > 0 ? v.build / net : Infinity;
    const year1 = net * 12 - v.build;
    const roi = v.build > 0 ? (year1 / v.build) * 100 : null;
    return { hours, benefit, running, net, payback, year1, roi };
  }, [v]);

  const set = (k: string, raw: string) => {
    const n = raw === "" ? 0 : Number(raw);
    setV((p) => ({ ...p, [k]: Number.isFinite(n) && n >= 0 ? n : 0 }));
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="card grid gap-5 p-6 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-semibold text-ink-900">{f.label}</span>
            <div className="mt-1.5 flex items-center rounded-lg border border-cream-300 bg-white focus-within:border-gold-500">
              {f.prefix && <span className="pl-3 text-ink-500">{f.prefix}</span>}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={f.step}
                value={v[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full rounded-lg bg-transparent px-3 py-2.5 text-ink-900 outline-none"
              />
            </div>
            <span className="mt-1 block text-xs text-ink-500">{f.hint}</span>
          </label>
        ))}
      </div>

      <aside className="rounded-2xl bg-night-950 p-6 text-white" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Estimate</p>
        <dl className="mt-4 space-y-4">
          <Row label="Hours saved per month" value={r.hours.toFixed(1)} />
          <Row label="Monthly benefit" value={usd(r.benefit)} />
          <Row label="Monthly running cost" value={usd(r.running)} />
          <Row label="Net monthly benefit" value={usd(r.net)} strong />
          <Row label="Payback period" value={Number.isFinite(r.payback) ? `${r.payback.toFixed(1)} months` : "No payback"} strong />
          <Row label="First-year net" value={usd(r.year1)} />
          <Row label="First-year ROI" value={r.roi === null ? "n/a" : `${Math.round(r.roi)}%`} />
        </dl>
        {r.net <= 0 && (
          <p className="mt-5 rounded-lg bg-white/10 p-3 text-sm text-slate-300">
            Running costs are at or above the benefit. Re-check your inputs or choose a task with more volume.
          </p>
        )}
        <button
          type="button"
          onClick={() => setV(DEFAULTS)}
          className="mt-6 text-sm font-semibold text-gold-300 underline underline-offset-2"
        >
          Reset to example numbers
        </button>
      </aside>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3 last:border-0">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className={strong ? "text-xl font-extrabold text-white" : "font-semibold text-slate-200"}>{value}</dd>
    </div>
  );
}
