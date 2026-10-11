"use client";

import { useMemo, useState } from "react";

interface Form {
  title: string;
  id: string;
  owner: string;
  purpose: string;
  appliesTo: string;
  excludes: string;
  roles: string;
  before: string;
  steps: string;
  exceptions: string;
  check: string;
  records: string;
  review: string;
}

const EXAMPLE: Form = {
  title: "Process a supplier payment",
  id: "FIN-014",
  owner: "Accounts Payable Manager",
  purpose: "Make sure supplier invoices are paid correctly, on time and only once.",
  appliesTo: "All supplier invoices above $0 paid by bank transfer.",
  excludes: "Employee expenses and payroll.",
  roles: "AP Clerk: matches and prepares payment\nAP Manager: approves payment runs",
  before: "Approved purchase order or contract\nInvoice received in the AP inbox\nAccess to the payment system",
  steps:
    "Open the invoice and confirm the supplier name and invoice number.\nMatch the invoice to the purchase order and goods receipt.\nCheck the bank details against the supplier record. If they differ, stop and call the supplier on a known number.\nEnter the invoice in the payment system.\nSubmit it for approval.",
  exceptions: "If the amounts do not match, send it back to the buyer and note the reason.\nIf you are unsure, ask the AP Manager.",
  check: "The payment run report matches the approved invoices.",
  records: "Save the invoice and approval in the AP folder for the retention period set by Finance.",
  review: "12 months",
};

const EMPTY: Form = Object.fromEntries(Object.keys(EXAMPLE).map((k) => [k, ""])) as unknown as Form;

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
const bullets = (s: string) => lines(s).map((l) => `- ${l}`).join("\n") || "- ";
const numbered = (s: string) => lines(s).map((l, i) => `${i + 1}. ${l.replace(/^\d+[.)]\s*/, "")}`).join("\n") || "1. ";

function build(f: Form): string {
  const today = new Date().toISOString().slice(0, 10);
  return `# ${f.title || "[SOP title]"}

SOP ID: ${f.id || "[ID]"}   Version: 1.0   Status: Draft
Owner: ${f.owner || "[Role and name]"}
Last reviewed: ${today}   Next review: in ${f.review || "12 months"}

## 1. Purpose
${f.purpose || "[Why this procedure exists and what a good outcome looks like.]"}

## 2. Scope
Applies to: ${f.appliesTo || "[Who and which situations]"}
Does not apply to: ${f.excludes || "[Exclusions]"}

## 3. Roles
${bullets(f.roles)}

## 4. Before you start
${bullets(f.before)}

## 5. Steps
${numbered(f.steps)}

## 6. Exceptions and escalation
${bullets(f.exceptions)}

## 7. Quality check
${f.check || "[How to confirm the task was done correctly.]"}

## 8. Records
${f.records || "[What to save, where and for how long.]"}

## 9. Change log
Version | Date | Author | Summary of change
1.0 | ${today} | ${f.owner || "[Name]"} | First version
`;
}

const FIELDS: { key: keyof Form; label: string; multi?: boolean; rows?: number; hint?: string }[] = [
  { key: "title", label: "SOP title", hint: "Action-oriented: verb plus object." },
  { key: "id", label: "SOP ID" },
  { key: "owner", label: "Owner (role and name)" },
  { key: "purpose", label: "Purpose", multi: true, rows: 2 },
  { key: "appliesTo", label: "Applies to" },
  { key: "excludes", label: "Does not apply to" },
  { key: "roles", label: "Roles (one per line)", multi: true, rows: 3 },
  { key: "before", label: "Before you start (one per line)", multi: true, rows: 3 },
  { key: "steps", label: "Steps (one action per line)", multi: true, rows: 7, hint: "Start each with a verb. Say what the reader should see when it worked." },
  { key: "exceptions", label: "Exceptions and escalation (one per line)", multi: true, rows: 3 },
  { key: "check", label: "Quality check" },
  { key: "records", label: "Records to keep" },
  { key: "review", label: "Review every" },
];

export default function SopBuilder() {
  const [f, setF] = useState<Form>(EXAMPLE);
  const [copied, setCopied] = useState(false);
  const out = useMemo(() => build(f), [f]);

  const download = () => {
    const blob = new Blob([out], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(f.id || "sop").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="card space-y-4 p-6">
        <div className="flex gap-3 text-sm">
          <button type="button" className="font-semibold text-gold-700 underline underline-offset-2" onClick={() => setF(EXAMPLE)}>Load example</button>
          <button type="button" className="font-semibold text-ink-500 underline underline-offset-2" onClick={() => setF(EMPTY)}>Clear</button>
        </div>
        {FIELDS.map((x) => (
          <label key={x.key} className="block">
            <span className="text-sm font-semibold text-ink-900">{x.label}</span>
            {x.multi ? (
              <textarea
                rows={x.rows}
                value={f[x.key]}
                onChange={(e) => setF({ ...f, [x.key]: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-gold-500"
              />
            ) : (
              <input
                value={f[x.key]}
                onChange={(e) => setF({ ...f, [x.key]: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-gold-500"
              />
            )}
            {x.hint && <span className="mt-1 block text-xs text-ink-500">{x.hint}</span>}
          </label>
        ))}
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex gap-3">
          <button type="button" onClick={copy} className="btn-primary">{copied ? "Copied" : "Copy"}</button>
          <button type="button" onClick={download} className="btn-ghost">Download .md</button>
        </div>
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-night-950 p-5 text-xs leading-relaxed text-slate-200">{out}</pre>
        <p className="mt-3 text-xs text-ink-500">
          Markdown opens in any text editor and pastes cleanly into Notion, Confluence and Google Docs.
        </p>
      </div>
    </div>
  );
}
