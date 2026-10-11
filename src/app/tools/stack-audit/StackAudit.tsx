"use client";

import { useMemo, useState } from "react";

type Decision = "Keep" | "Review" | "Merge" | "Retire";

interface Row {
  id: number;
  tool: string;
  purpose: string;
  owner: string;
  cost: number; // per month
  seats: number;
  active: number;
  decision: Decision;
}

const DECISIONS: Decision[] = ["Keep", "Review", "Merge", "Retire"];

const START: Row[] = [
  { id: 1, tool: "Example CRM", purpose: "Customer records and pipeline", owner: "Sales Ops", cost: 900, seats: 30, active: 24, decision: "Keep" },
  { id: 2, tool: "Example form tool", purpose: "Intake forms", owner: "", cost: 120, seats: 5, active: 1, decision: "Review" },
];

const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export default function StackAudit() {
  const [rows, setRows] = useState<Row[]>(START);
  const next = useMemo(() => Math.max(0, ...rows.map((r) => r.id)) + 1, [rows]);

  const upd = (id: number, patch: Partial<Row>) => setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const t = useMemo(() => {
    const monthly = rows.reduce((a, r) => a + r.cost, 0);
    const unused = rows.reduce((a, r) => a + (r.seats > 0 ? r.cost * (1 - Math.min(r.active, r.seats) / r.seats) : 0), 0);
    const noOwner = rows.filter((r) => r.tool && !r.owner.trim()).length;
    const savings = rows.filter((r) => r.decision === "Retire" || r.decision === "Merge").reduce((a, r) => a + r.cost, 0);
    return { monthly, annual: monthly * 12, unused, noOwner, savings };
  }, [rows]);

  const csv = () => {
    const esc = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
    const head = ["Tool", "Purpose", "Owner", "Monthly cost", "Seats paid", "Active users", "Decision"];
    const body = rows.map((r) => [r.tool, r.purpose, r.owner, r.cost, r.seats, r.active, r.decision].map(esc).join(","));
    const blob = new Blob([[head.map(esc).join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tech-stack-audit.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cell = "w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-ink-900 outline-none focus:border-gold-500";

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Monthly cost" value={usd(t.monthly)} sub={`${usd(t.annual)} per year`} />
        <Stat label="Paid but unused (estimate)" value={usd(t.unused)} sub="per month, from seats vs active users" />
        <Stat label="Tools without an owner" value={String(t.noOwner)} sub="every tool needs a named owner" />
        <Stat label="Potential monthly saving" value={usd(t.savings)} sub="tools marked Merge or Retire" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cream-300 bg-white">
        <table className="w-full min-w-[860px] text-left">
          <thead className="bg-cream-100 text-xs uppercase tracking-wider text-ink-500">
            <tr>
              {["Tool", "Purpose", "Owner", "$ / month", "Seats paid", "Active users", "Decision", ""].map((h) => (
                <th key={h} className="px-3 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2"><input aria-label="Tool" className={cell} value={r.tool} onChange={(e) => upd(r.id, { tool: e.target.value })} /></td>
                <td className="px-3 py-2"><input aria-label="Purpose" className={cell} value={r.purpose} onChange={(e) => upd(r.id, { purpose: e.target.value })} /></td>
                <td className="px-3 py-2"><input aria-label="Owner" className={cell} value={r.owner} onChange={(e) => upd(r.id, { owner: e.target.value })} /></td>
                <td className="px-3 py-2"><input aria-label="Monthly cost" type="number" min={0} className={cell} value={r.cost} onChange={(e) => upd(r.id, { cost: num(e.target.value) })} /></td>
                <td className="px-3 py-2"><input aria-label="Seats paid" type="number" min={0} className={cell} value={r.seats} onChange={(e) => upd(r.id, { seats: num(e.target.value) })} /></td>
                <td className="px-3 py-2"><input aria-label="Active users" type="number" min={0} className={cell} value={r.active} onChange={(e) => upd(r.id, { active: num(e.target.value) })} /></td>
                <td className="px-3 py-2">
                  <select aria-label="Decision" className={cell} value={r.decision} onChange={(e) => upd(r.id, { decision: e.target.value as Decision })}>
                    {DECISIONS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button type="button" aria-label="Remove row" className="text-ink-400 hover:text-red-600" onClick={() => setRows((p) => p.filter((x) => x.id !== r.id))}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn-primary" onClick={() => setRows((p) => [...p, { id: next, tool: "", purpose: "", owner: "", cost: 0, seats: 0, active: 0, decision: "Review" }])}>Add a tool</button>
        <button type="button" className="btn-ghost" onClick={csv}>Download CSV</button>
        <button type="button" className="btn-ghost" onClick={() => setRows([])}>Clear all</button>
      </div>
      <p className="mt-4 max-w-3xl text-sm text-ink-500">
        Nothing is saved or sent anywhere. Download the CSV before you leave the page. &ldquo;Paid but unused&rdquo; is a
        rough estimate (cost × share of seats with no active user), so confirm it in the vendor&rsquo;s admin console
        before you cancel anything.
      </p>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-500">{sub}</p>
    </div>
  );
}
