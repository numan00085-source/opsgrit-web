"use client";

import { useEffect, useMemo, useState } from "react";

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

function calc(v: Record<string, number>) {
  const hours = (v.tasks * v.minutes * (v.share / 100)) / 60;
  const benefit = hours * v.rate + v.errors;
  const running = v.tool + v.maint * v.rate;
  const net = benefit - running;
  const payback = net > 0 ? v.build / net : Infinity;
  const year1 = net * 12 - v.build;
  const roi = v.build > 0 ? (year1 / v.build) * 100 : null;
  return { hours, benefit, running, net, payback, year1, roi };
}

const KEYS = Object.keys(DEFAULTS);

export default function RoiCalculator() {
  const [v, setV] = useState<Record<string, number>>(DEFAULTS);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);

  // Load numbers from a shared link, e.g. ?tasks=400&minutes=12
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const next = { ...DEFAULTS };
      let any = false;
      for (const k of KEYS) {
        const raw = q.get(k);
        const n = raw === null ? NaN : Number(raw);
        if (Number.isFinite(n) && n >= 0 && n <= 1e9) {
          next[k] = k === "share" ? Math.min(100, n) : n;
          any = true;
        }
      }
      if (any) setV(next);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  // Keep the address bar in step with the inputs so the link can be shared.
  useEffect(() => {
    if (!ready) return;
    try {
      const q = new URLSearchParams();
      const changed = KEYS.some((k) => v[k] !== DEFAULTS[k]);
      if (changed) for (const k of KEYS) q.set(k, String(v[k]));
      window.history.replaceState(null, "", window.location.pathname + (changed ? `?${q}` : ""));
    } catch {
      /* ignore */
    }
  }, [v, ready]);

  const r = useMemo(() => calc(v), [v]);

  const scenarios = useMemo(
    () =>
      [
        { name: "Cautious", note: "Automation handles 20 points less", share: Math.max(0, v.share - 20) },
        { name: "As entered", note: "Your inputs", share: v.share },
        { name: "Better", note: "Automation handles 10 points more", share: Math.min(100, v.share + 10) },
      ].map((x) => ({ ...x, r: calc({ ...v, share: x.share }) })),
    [v],
  );

  const months = useMemo(() => Array.from({ length: 13 }, (_, m) => r.net * m - v.build), [r.net, v.build]);

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote(msg);
    } catch {
      setNote("Copy is blocked in this browser.");
    }
    setTimeout(() => setNote(""), 2200);
  };
  const summary = () =>
    `Automation ROI estimate (OpsGrit calculator)\n` +
    `Hours saved per month: ${r.hours.toFixed(1)}\n` +
    `Net monthly benefit: ${usd(r.net)}\n` +
    `Payback: ${Number.isFinite(r.payback) ? `${r.payback.toFixed(1)} months` : "no payback"}\n` +
    `First-year net: ${usd(r.year1)}\n` +
    `Try your own numbers: ${window.location.href}`;

  const set = (k: string, raw: string) => {
    const n = raw === "" ? 0 : Number(raw);
    setV((p) => ({ ...p, [k]: Number.isFinite(n) && n >= 0 ? n : 0 }));
  };

  return (
    <>
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

    <div className="mt-8 flex flex-wrap items-center gap-3">
      <button type="button" className="btn-primary" onClick={() => copy(window.location.href, "Link copied. It opens with your numbers.")}>Copy link with my numbers</button>
      <button type="button" className="btn-ghost" onClick={() => copy(summary(), "Summary copied.")}>Copy summary</button>
      <span className="text-sm text-ink-500" role="status" aria-live="polite">{note}</span>
    </div>

    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="card p-6">
        <h2 className="text-lg font-extrabold text-ink-900">Cumulative net over 12 months</h2>
        <p className="mt-1 text-sm text-ink-600">Starts at the build cost. The line crosses zero at payback.</p>
        <Chart points={months} />
      </div>
      <div className="card overflow-x-auto p-6">
        <h2 className="text-lg font-extrabold text-ink-900">How sensitive is it?</h2>
        <p className="mt-1 text-sm text-ink-600">Same inputs, but a different share of the work automated.</p>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-ink-500">
              <th className="py-2 pr-3 font-semibold">Case</th>
              <th className="py-2 pr-3 font-semibold">Share</th>
              <th className="py-2 pr-3 font-semibold">Net / month</th>
              <th className="py-2 font-semibold">Payback</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((x) => (
              <tr key={x.name} className="border-b border-cream-200 last:border-0">
                <td className="py-2.5 pr-3 font-semibold text-ink-900">{x.name}<span className="block text-xs font-normal text-ink-500">{x.note}</span></td>
                <td className="py-2.5 pr-3 text-ink-700">{Math.round(x.share)}%</td>
                <td className="py-2.5 pr-3 text-ink-700">{usd(x.r.net)}</td>
                <td className="py-2.5 text-ink-700">{Number.isFinite(x.r.payback) ? `${x.r.payback.toFixed(1)} mo` : "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-ink-500">If the cautious case still pays back, the case is strong. If only the better case does, treat it as a gamble.</p>
      </div>
    </div>
    </>
  );
}

function Chart({ points }: { points: number[] }) {
  const W = 420, H = 190, PL = 8, PR = 8, PT = 14, PB = 24;
  const min = Math.min(0, ...points), max = Math.max(0, ...points);
  const span = max - min || 1;
  const x = (i: number) => PL + (i * (W - PL - PR)) / (points.length - 1);
  const y = (val: number) => PT + ((max - val) / span) * (H - PT - PB);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const cross = points.findIndex((p) => p >= 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={`Cumulative net starts at ${usd(points[0])} and ends at ${usd(points[points.length - 1])} after 12 months`}>
      <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} stroke="#cbbfa0" strokeDasharray="4 4" />
      <path d={d} fill="none" stroke="#9c7618" strokeWidth="2.5" strokeLinejoin="round" />
      {cross > 0 && <circle cx={x(cross)} cy={y(points[cross])} r="4.5" fill="#9c7618" />}
      <text x={PL} y={H - 6} fontSize="11" fill="#6b6454">Month 0</text>
      <text x={W - PR} y={H - 6} fontSize="11" fill="#6b6454" textAnchor="end">Month 12</text>
      <text x={PL} y={y(0) - 5} fontSize="11" fill="#6b6454">$0</text>
      <text x={W - PR} y={y(points[points.length - 1]) - 7} fontSize="11" fontWeight="700" fill="#2b2417" textAnchor="end">{usd(points[points.length - 1])}</text>
    </svg>
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
