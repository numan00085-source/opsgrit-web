"use client";

import { useMemo, useState } from "react";

type Code = "" | "R" | "A" | "AR" | "C" | "I";
interface Role { id: number; name: string }
interface Task { id: number; name: string; cells: Record<number, Code> }

const MAX_ROLES = 8;
const MAX_TASKS = 25;

const CODES: { value: Code; label: string }[] = [
  { value: "", label: "-" },
  { value: "R", label: "R" },
  { value: "A", label: "A" },
  { value: "AR", label: "A/R" },
  { value: "C", label: "C" },
  { value: "I", label: "I" },
];

const EXAMPLE_ROLES: Role[] = [
  { id: 1, name: "Hiring manager" },
  { id: 2, name: "HR" },
  { id: 3, name: "IT" },
  { id: 4, name: "Finance" },
  { id: 5, name: "New hire" },
];
const EXAMPLE_TASKS: Task[] = [
  { id: 1, name: "Send offer and collect paperwork", cells: { 1: "C", 2: "AR", 3: "", 4: "I", 5: "C" } },
  { id: 2, name: "Order laptop and equipment", cells: { 1: "C", 2: "I", 3: "AR", 4: "C", 5: "" } },
  { id: 3, name: "Create accounts and access", cells: { 1: "A", 2: "I", 3: "R", 4: "", 5: "I" } },
  { id: 4, name: "Set up payroll", cells: { 1: "", 2: "R", 3: "", 4: "A", 5: "C" } },
  { id: 5, name: "Plan the first week", cells: { 1: "AR", 2: "C", 3: "I", 4: "", 5: "I" } },
];

const hasA = (c: Code) => c === "A" || c === "AR";
const hasR = (c: Code) => c === "R" || c === "AR";

const cellStyle: Record<Code, string> = {
  "": "text-ink-500",
  R: "bg-gold-100 text-gold-700 font-bold",
  A: "bg-ink-900 text-white font-bold",
  AR: "bg-ink-900 text-gold-300 font-bold",
  C: "bg-sky-50 text-sky-800 font-semibold",
  I: "bg-cream-200 text-ink-700 font-semibold",
};

export default function RaciGenerator() {
  const [title, setTitle] = useState("New hire onboarding");
  const [roles, setRoles] = useState<Role[]>(EXAMPLE_ROLES);
  const [tasks, setTasks] = useState<Task[]>(EXAMPLE_TASKS);
  const [copied, setCopied] = useState("");

  const checks = useMemo(() => {
    const rows = tasks.map((t) => {
      const codes = roles.map((r) => t.cells[r.id] ?? "");
      const a = codes.filter(hasA).length;
      const r = codes.filter(hasR).length;
      const issues: string[] = [];
      if (a === 0) issues.push("No one is accountable (needs exactly one A)");
      if (a > 1) issues.push("More than one A (only one person should be accountable)");
      if (r === 0) issues.push("No one is doing the work (needs at least one R)");
      return { id: t.id, issues };
    });
    const load = roles.map((role) => {
      let a = 0;
      let r = 0;
      for (const t of tasks) {
        const c = t.cells[role.id] ?? "";
        if (hasA(c)) a++;
        if (hasR(c)) r++;
      }
      return { id: role.id, a, r };
    });
    const problems = rows.filter((x) => x.issues.length).length;
    return { rows, load, problems };
  }, [roles, tasks]);

  const setCell = (taskId: number, roleId: number, code: Code) =>
    setTasks((p) => p.map((t) => (t.id === taskId ? { ...t, cells: { ...t.cells, [roleId]: code } } : t)));
  const renameTask = (id: number, name: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, name } : t)));
  const renameRole = (id: number, name: string) => setRoles((p) => p.map((r) => (r.id === id ? { ...r, name } : r)));
  const addTask = () => setTasks((p) => (p.length >= MAX_TASKS ? p : [...p, { id: Math.max(0, ...p.map((t) => t.id)) + 1, name: "", cells: {} }]));
  const removeTask = (id: number) => setTasks((p) => (p.length > 1 ? p.filter((t) => t.id !== id) : p));
  const addRole = () => setRoles((p) => (p.length >= MAX_ROLES ? p : [...p, { id: Math.max(0, ...p.map((r) => r.id)) + 1, name: "" }]));
  const removeRole = (id: number) => setRoles((p) => (p.length > 2 ? p.filter((r) => r.id !== id) : p));

  const label = (c: Code) => (c === "AR" ? "A/R" : c);
  const roleName = (r: Role, i: number) => r.name.trim() || `Role ${i + 1}`;

  const markdown = useMemo(() => {
    const head = `| Task | ${roles.map(roleName).join(" | ")} |`;
    const sep = `|---|${roles.map(() => ":-:").join("|")}|`;
    const rows = tasks.map((t, i) => `| ${t.name.trim() || `Task ${i + 1}`} | ${roles.map((r) => label(t.cells[r.id] ?? "")).join(" | ")} |`);
    return `${title ? `## RACI: ${title}\n\n` : ""}${[head, sep, ...rows].join("\n")}\n\nR = Responsible (does the work), A = Accountable (one owner, signs off), C = Consulted (two-way input), I = Informed (one-way update)\n`;
  }, [roles, tasks, title]);

  const csv = () => {
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      ["Task", ...roles.map(roleName)].map(q).join(","),
      ...tasks.map((t, i) => [t.name.trim() || `Task ${i + 1}`, ...roles.map((r) => label(t.cells[r.id] ?? ""))].map(q).join(",")),
    ];
    const blob = new Blob([lines.join("\n") + "\n"], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `raci-${(title || "matrix").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copy = async (what: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  };

  const inputCls = "w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-ink-900 outline-none focus:border-gold-500";

  return (
    <div className="mt-8">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #raci-print, #raci-print * { visibility: visible !important; }
          #raci-print { position: absolute; left: 0; top: 0; width: 100%; }
          .raci-noprint { display: none !important; }
          @page { margin: 14mm; size: landscape; }
        }
      `}</style>

      <div className="raci-noprint mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <button type="button" className="font-semibold text-gold-700 underline underline-offset-2" onClick={() => { setTitle("New hire onboarding"); setRoles(EXAMPLE_ROLES); setTasks(EXAMPLE_TASKS); }}>Load example</button>
        <button type="button" className="font-semibold text-ink-500 underline underline-offset-2" onClick={() => { setTitle(""); setRoles([{ id: 1, name: "" }, { id: 2, name: "" }, { id: 3, name: "" }]); setTasks([{ id: 1, name: "", cells: {} }, { id: 2, name: "", cells: {} }, { id: 3, name: "", cells: {} }]); }}>Start blank</button>
        <label className="ml-auto flex items-center gap-2">
          <span className="font-semibold text-ink-900">Process or project</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputCls} w-56`} />
        </label>
      </div>

      <div id="raci-print" className="card overflow-x-auto p-4 sm:p-6">
        <h2 className="mb-3 hidden text-lg font-bold text-ink-900 print:block">RACI: {title}</h2>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-64 pb-2 pr-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-ink-500">Task</th>
              {roles.map((r, i) => (
                <th key={r.id} className="px-1 pb-2 align-bottom">
                  <input
                    value={r.name}
                    onChange={(e) => renameRole(r.id, e.target.value)}
                    placeholder={`Role ${i + 1}`}
                    aria-label={`Role ${i + 1} name`}
                    className={`${inputCls} text-center font-semibold`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRole(r.id)}
                    disabled={roles.length <= 2}
                    className="raci-noprint mt-1 text-[11px] font-semibold text-ink-500 hover:text-red-700 disabled:opacity-30"
                    aria-label={`Remove ${roleName(r, i)}`}
                  >
                    remove
                  </button>
                </th>
              ))}
              <th className="raci-noprint w-8" />
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, ti) => {
              const issues = checks.rows[ti]?.issues ?? [];
              return (
                <tr key={t.id} className="border-t border-cream-300 align-top">
                  <td className="py-2 pr-3">
                    <input
                      value={t.name}
                      onChange={(e) => renameTask(t.id, e.target.value)}
                      placeholder={`Task ${ti + 1}`}
                      aria-label={`Task ${ti + 1} name`}
                      className={inputCls}
                    />
                    {issues.length > 0 && (
                      <ul className="raci-noprint mt-1 space-y-0.5 text-xs text-red-700" data-testid={`issues-${ti}`}>
                        {issues.map((x) => (<li key={x}>{x}</li>))}
                      </ul>
                    )}
                  </td>
                  {roles.map((r, ri) => {
                    const c = t.cells[r.id] ?? "";
                    return (
                      <td key={r.id} className="px-1 py-2 text-center">
                        <select
                          value={c}
                          onChange={(e) => setCell(t.id, r.id, e.target.value as Code)}
                          aria-label={`${t.name.trim() || `Task ${ti + 1}`}, ${roleName(r, ri)}`}
                          className={`w-full min-w-[3.25rem] cursor-pointer rounded-md border border-cream-300 px-1 py-1.5 text-center text-sm outline-none focus:border-gold-500 print:appearance-none ${cellStyle[c]}`}
                        >
                          {CODES.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </select>
                      </td>
                    );
                  })}
                  <td className="raci-noprint py-2 pl-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeTask(t.id)}
                      disabled={tasks.length === 1}
                      className="text-lg leading-none text-ink-500 hover:text-red-700 disabled:opacity-30"
                      aria-label={`Remove task ${ti + 1}`}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="raci-noprint">
            <tr className="border-t-2 border-cream-300 text-xs text-ink-600">
              <td className="pt-3 pr-3 font-semibold">Workload (A and R count)</td>
              {checks.load.map((l) => (
                <td key={l.id} className="px-1 pt-3 text-center tabular-nums">{l.a} A, {l.r} R</td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>

        <div className="raci-noprint mt-4 flex flex-wrap gap-4">
          <button type="button" onClick={addTask} disabled={tasks.length >= MAX_TASKS} className="text-sm font-semibold text-gold-700 underline underline-offset-2 disabled:opacity-40">+ Add task</button>
          <button type="button" onClick={addRole} disabled={roles.length >= MAX_ROLES} className="text-sm font-semibold text-gold-700 underline underline-offset-2 disabled:opacity-40">+ Add role</button>
        </div>

        <p className="mt-4 text-xs text-ink-600 hidden print:block">
          R = Responsible (does the work), A = Accountable (one owner, signs off), C = Consulted (two-way input), I = Informed (one-way update).
        </p>
      </div>

      <div className="raci-noprint mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${checks.problems ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
          role="status"
          data-testid="raci-status"
        >
          {checks.problems === 0
            ? "Every task has exactly one accountable owner and at least one person doing the work."
            : `${checks.problems} ${checks.problems === 1 ? "task needs" : "tasks need"} attention. Each task needs exactly one A and at least one R.`}
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => window.print()} className="btn-primary">Print or save as PDF</button>
          <button type="button" onClick={() => copy("md", markdown)} className="btn-ghost">{copied === "md" ? "Copied" : "Copy as table"}</button>
          <button type="button" onClick={csv} className="btn-ghost">Download CSV</button>
        </div>
      </div>

      <dl className="raci-noprint mt-6 grid gap-3 text-sm text-ink-700 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4"><dt className="font-bold text-ink-900">R, Responsible</dt><dd className="mt-1">Does the work. There can be several.</dd></div>
        <div className="card p-4"><dt className="font-bold text-ink-900">A, Accountable</dt><dd className="mt-1">Owns the outcome and signs off. Exactly one per task.</dd></div>
        <div className="card p-4"><dt className="font-bold text-ink-900">C, Consulted</dt><dd className="mt-1">Gives input before the work is done. Two-way.</dd></div>
        <div className="card p-4"><dt className="font-bold text-ink-900">I, Informed</dt><dd className="mt-1">Told the result. One-way.</dd></div>
      </dl>
      <p className="raci-noprint mt-3 text-xs text-ink-500">
        Use A/R when the same person does the work and owns it. The checks run as you type. Nothing you enter leaves your browser.
      </p>
    </div>
  );
}
