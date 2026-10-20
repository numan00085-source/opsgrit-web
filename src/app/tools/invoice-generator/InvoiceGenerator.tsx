"use client";

import { useMemo, useState } from "react";

interface Item {
  id: number;
  desc: string;
  qty: string;
  price: string;
}

interface Form {
  fromName: string;
  fromDetails: string;
  toName: string;
  toDetails: string;
  number: string;
  issue: string;
  terms: string;
  dueCustom: string;
  currency: string;
  taxLabel: string;
  taxRate: string;
  discountType: "none" | "percent" | "amount";
  discount: string;
  notes: string;
  payment: string;
}

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "NZD", "CHF", "JPY", "INR", "BDT", "SGD", "AED"];
const TERMS: { value: string; label: string; days: number | null }[] = [
  { value: "receipt", label: "Due on receipt", days: 0 },
  { value: "net7", label: "Net 7 days", days: 7 },
  { value: "net15", label: "Net 15 days", days: 15 },
  { value: "net30", label: "Net 30 days", days: 30 },
  { value: "net45", label: "Net 45 days", days: 45 },
  { value: "net60", label: "Net 60 days", days: 60 },
  { value: "custom", label: "Custom date", days: null },
];

const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const today = () => localIso(new Date());

const EXAMPLE_FORM: Form = {
  fromName: "Northwind Studio LLC",
  fromDetails: "120 Example Street\nDetroit, MI 48201\nbilling@example.com",
  toName: "Acme Operations Inc.",
  toDetails: "Attn: Accounts Payable\n500 Sample Avenue\nChicago, IL 60601",
  number: "INV-0001",
  issue: today(),
  terms: "net30",
  dueCustom: "",
  currency: "USD",
  taxLabel: "Sales tax",
  taxRate: "6",
  discountType: "none",
  discount: "",
  notes: "Thank you for your business.",
  payment: "Bank transfer\nAccount name: Northwind Studio LLC\nReference: INV-0001",
};

const EXAMPLE_ITEMS: Item[] = [
  { id: 1, desc: "Process audit and documentation", qty: "12", price: "95" },
  { id: 2, desc: "Workflow setup and testing", qty: "8", price: "110" },
];

const EMPTY_FORM: Form = {
  ...EXAMPLE_FORM,
  fromName: "",
  fromDetails: "",
  toName: "",
  toDetails: "",
  number: "INV-0001",
  notes: "",
  payment: "",
  taxRate: "",
  taxLabel: "Tax",
};

const num = (s: string) => {
  const n = Number.parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const cents = (n: number) => Math.round(n * 100);

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(d);
}

const inputCls =
  "mt-1.5 w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-gold-500";

export default function InvoiceGenerator() {
  const [f, setF] = useState<Form>(EXAMPLE_FORM);
  const [items, setItems] = useState<Item[]>(EXAMPLE_ITEMS);
  const [logo, setLogo] = useState<string>("");
  const [logoError, setLogoError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const money = useMemo(() => {
    try {
      const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: f.currency });
      return (c: number) => fmt.format(c / 100);
    } catch {
      return (c: number) => (c / 100).toFixed(2);
    }
  }, [f.currency]);

  const calc = useMemo(() => {
    const lines = items.map((it) => {
      const unit = cents(num(it.price));
      const total = Math.round(num(it.qty) * unit);
      return { ...it, unit, total };
    });
    const subtotal = lines.reduce((a, l) => a + l.total, 0);
    let discount = 0;
    if (f.discountType === "percent") discount = Math.round((subtotal * Math.min(num(f.discount), 100)) / 100);
    if (f.discountType === "amount") discount = Math.min(cents(num(f.discount)), subtotal);
    const taxable = subtotal - discount;
    const tax = Math.round((taxable * Math.min(num(f.taxRate), 100)) / 100);
    return { lines, subtotal, discount, tax, total: taxable + tax };
  }, [items, f.discount, f.discountType, f.taxRate]);

  const termDays = TERMS.find((t) => t.value === f.terms)?.days;
  const dueDate = termDays === null || termDays === undefined ? f.dueCustom : addDays(f.issue, termDays);
  const termLabel = TERMS.find((t) => t.value === f.terms)?.label ?? "";

  const updateItem = (id: number, patch: Partial<Item>) => setItems((p) => p.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const addItem = () => setItems((p) => [...p, { id: Math.max(0, ...p.map((i) => i.id)) + 1, desc: "", qty: "1", price: "" }]);
  const removeItem = (id: number) => setItems((p) => (p.length > 1 ? p.filter((i) => i.id !== id) : p));

  const onLogo = (file: File | undefined) => {
    setLogoError("");
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp|svg\+xml)$/.test(file.type)) {
      setLogoError("Use a PNG, JPG, WebP or SVG image.");
      return;
    }
    if (file.size > 1_000_000) {
      setLogoError("Image is larger than 1 MB. Use a smaller file.");
      return;
    }
    const r = new FileReader();
    r.onload = () => setLogo(typeof r.result === "string" ? r.result : "");
    r.readAsDataURL(file);
  };

  const plain = useMemo(() => {
    const rows = calc.lines
      .filter((l) => l.desc || l.total)
      .map((l) => `${l.desc || "Item"} | ${l.qty || "0"} x ${money(l.unit)} | ${money(l.total)}`)
      .join("\n");
    return `INVOICE ${f.number}
Date: ${fmtDate(f.issue)}   Due: ${fmtDate(dueDate) || termLabel}

From: ${f.fromName}
${f.fromDetails}

Bill to: ${f.toName}
${f.toDetails}

${rows}

Subtotal: ${money(calc.subtotal)}${calc.discount ? `\nDiscount: -${money(calc.discount)}` : ""}${calc.tax ? `\n${f.taxLabel || "Tax"} (${f.taxRate}%): ${money(calc.tax)}` : ""}
Total due: ${money(calc.total)}
${f.payment ? `\nPayment details:\n${f.payment}\n` : ""}${f.notes ? `\n${f.notes}\n` : ""}`;
  }, [calc, f, dueDate, money, termLabel]);

  const csv = () => {
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const head = "Description,Quantity,Unit price,Line total";
    const body = calc.lines.map((l) => [q(l.desc), l.qty || "0", (l.unit / 100).toFixed(2), (l.total / 100).toFixed(2)].join(",")).join("\n");
    const blob = new Blob([`${head}\n${body}\n`], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(f.number || "invoice").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  };

  const lineEls = (s: string) => s.split("\n").map((l, i) => <div key={i}>{l || " "}</div>);

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #invoice-print, #invoice-print * { visibility: visible !important; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; border: 0 !important; }
          @page { margin: 14mm; }
        }
      `}</style>

      <div className="card space-y-5 p-6 print:hidden">
        <div className="flex gap-3 text-sm">
          <button type="button" className="font-semibold text-gold-700 underline underline-offset-2" onClick={() => { setF({ ...EXAMPLE_FORM, issue: today() }); setItems(EXAMPLE_ITEMS); }}>Load example</button>
          <button type="button" className="font-semibold text-ink-500 underline underline-offset-2" onClick={() => { setF({ ...EMPTY_FORM, issue: today() }); setItems([{ id: 1, desc: "", qty: "1", price: "" }]); }}>Clear</button>
        </div>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Your business</legend>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-ink-900">Business name</span>
            <input value={f.fromName} onChange={(e) => set("fromName", e.target.value)} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-ink-900">Address and contact (one per line)</span>
            <textarea rows={3} value={f.fromDetails} onChange={(e) => set("fromDetails", e.target.value)} className={inputCls} />
          </label>
          <div className="sm:col-span-2">
            <span className="text-sm font-semibold text-ink-900">Logo (optional)</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => onLogo(e.target.files?.[0])}
                className="text-sm text-ink-700 file:mr-3 file:rounded-lg file:border file:border-cream-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold"
                aria-label="Upload logo"
              />
              {logo && (
                <button type="button" className="text-sm font-semibold text-ink-500 underline underline-offset-2" onClick={() => setLogo("")}>Remove logo</button>
              )}
            </div>
            {logoError && <p className="mt-1 text-xs text-red-700">{logoError}</p>}
            <p className="mt-1 text-xs text-ink-500">The image stays in your browser. It is never uploaded.</p>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Client</legend>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-ink-900">Client name</span>
            <input value={f.toName} onChange={(e) => set("toName", e.target.value)} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-ink-900">Client address and contact (one per line)</span>
            <textarea rows={3} value={f.toDetails} onChange={(e) => set("toDetails", e.target.value)} className={inputCls} />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Invoice details</legend>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Invoice number</span>
            <input value={f.number} onChange={(e) => set("number", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Currency</span>
            <select value={f.currency} onChange={(e) => set("currency", e.target.value)} className={inputCls}>
              {CURRENCIES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Issue date</span>
            <input type="date" value={f.issue} onChange={(e) => set("issue", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Payment terms</span>
            <select value={f.terms} onChange={(e) => set("terms", e.target.value)} className={inputCls}>
              {TERMS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </label>
          {f.terms === "custom" && (
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Due date</span>
              <input type="date" value={f.dueCustom} onChange={(e) => set("dueCustom", e.target.value)} className={inputCls} />
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Line items</legend>
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={it.id} className="grid grid-cols-[1fr_4.5rem_6rem_auto] items-end gap-2">
                <label className="block">
                  <span className={`text-xs font-semibold text-ink-600 ${i > 0 ? "sr-only" : ""}`}>Description</span>
                  <input value={it.desc} onChange={(e) => updateItem(it.id, { desc: e.target.value })} className={inputCls.replace("mt-1.5", "mt-1")} aria-label={`Item ${i + 1} description`} />
                </label>
                <label className="block">
                  <span className={`text-xs font-semibold text-ink-600 ${i > 0 ? "sr-only" : ""}`}>Qty</span>
                  <input inputMode="decimal" value={it.qty} onChange={(e) => updateItem(it.id, { qty: e.target.value })} className={inputCls.replace("mt-1.5", "mt-1")} aria-label={`Item ${i + 1} quantity`} />
                </label>
                <label className="block">
                  <span className={`text-xs font-semibold text-ink-600 ${i > 0 ? "sr-only" : ""}`}>Unit price</span>
                  <input inputMode="decimal" value={it.price} onChange={(e) => updateItem(it.id, { price: e.target.value })} className={inputCls.replace("mt-1.5", "mt-1")} aria-label={`Item ${i + 1} unit price`} />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  disabled={items.length === 1}
                  className="mb-1 rounded-lg px-2 py-2 text-lg leading-none text-ink-500 hover:text-red-700 disabled:opacity-30"
                  aria-label={`Remove item ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-3 text-sm font-semibold text-gold-700 underline underline-offset-2">+ Add line item</button>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Tax and discount</legend>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Tax name</span>
            <input value={f.taxLabel} onChange={(e) => set("taxLabel", e.target.value)} className={inputCls} placeholder="VAT, GST, Sales tax" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Tax rate (%)</span>
            <input inputMode="decimal" value={f.taxRate} onChange={(e) => set("taxRate", e.target.value)} className={inputCls} placeholder="0" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Discount</span>
            <select value={f.discountType} onChange={(e) => set("discountType", e.target.value as Form["discountType"])} className={inputCls}>
              <option value="none">None</option>
              <option value="percent">Percent</option>
              <option value="amount">Fixed amount</option>
            </select>
          </label>
          {f.discountType !== "none" && (
            <label className="block">
              <span className="text-sm font-semibold text-ink-900">{f.discountType === "percent" ? "Discount (%)" : "Discount amount"}</span>
              <input inputMode="decimal" value={f.discount} onChange={(e) => set("discount", e.target.value)} className={inputCls} />
            </label>
          )}
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Payment and notes</legend>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">How to pay (one per line)</span>
            <textarea rows={3} value={f.payment} onChange={(e) => set("payment", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Notes</span>
            <textarea rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} className={inputCls} />
          </label>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex flex-wrap gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary">Print or save as PDF</button>
          <button type="button" onClick={copy} className="btn-ghost">{copied ? "Copied" : "Copy as text"}</button>
          <button type="button" onClick={csv} className="btn-ghost">Download CSV</button>
        </div>

        <div id="invoice-print" className="overflow-hidden rounded-2xl border border-cream-300 bg-white p-6 text-[13px] leading-relaxed text-slate-800 shadow-[0_10px_30px_-18px_rgba(122,91,16,0.35)] sm:p-9">
          <div className="flex items-start justify-between gap-6">
            <div>
              {logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={logo} alt="" className="mb-3 max-h-16 max-w-[180px] object-contain" />}
              <div className="text-base font-bold text-slate-900">{f.fromName || "Your business"}</div>
              <div className="mt-1 text-slate-600">{lineEls(f.fromDetails)}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">INVOICE</div>
              <div className="mt-1 text-slate-600">{f.number}</div>
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Bill to</div>
              <div className="mt-1 font-semibold text-slate-900">{f.toName || "Client name"}</div>
              <div className="text-slate-600">{lineEls(f.toDetails)}</div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 sm:justify-self-end">
              <dt className="text-slate-500">Issued</dt>
              <dd className="text-right font-medium text-slate-900">{fmtDate(f.issue) || "-"}</dd>
              <dt className="text-slate-500">Due</dt>
              <dd className="text-right font-medium text-slate-900">{fmtDate(dueDate) || "-"}</dd>
              <dt className="text-slate-500">Terms</dt>
              <dd className="text-right text-slate-900">{termLabel}</dd>
            </dl>
          </div>

          <table className="mt-7 w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-slate-800 text-[11px] uppercase tracking-[0.1em] text-slate-500">
                <th className="py-2 pr-2 font-bold">Description</th>
                <th className="w-14 py-2 pr-2 text-right font-bold">Qty</th>
                <th className="w-24 py-2 pr-2 text-right font-bold">Price</th>
                <th className="w-28 py-2 text-right font-bold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {calc.lines.map((l) => (
                <tr key={l.id} className="border-b border-slate-200 align-top">
                  <td className="py-2 pr-2">{l.desc || <span className="text-slate-400">Item description</span>}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{l.qty}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{money(l.unit)}</td>
                  <td className="py-2 text-right tabular-nums">{money(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 ml-auto w-full max-w-[17rem] space-y-1">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="tabular-nums">{money(calc.subtotal)}</span></div>
            {calc.discount > 0 && (
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="tabular-nums">-{money(calc.discount)}</span></div>
            )}
            {calc.tax > 0 && (
              <div className="flex justify-between"><span className="text-slate-500">{f.taxLabel || "Tax"} ({f.taxRate}%)</span><span className="tabular-nums">{money(calc.tax)}</span></div>
            )}
            <div className="flex justify-between border-t-2 border-slate-800 pt-2 text-base font-extrabold text-slate-900">
              <span>Total due</span>
              <span className="tabular-nums">{money(calc.total)}</span>
            </div>
          </div>

          {(f.payment || f.notes) && (
            <div className="mt-8 grid gap-5 border-t border-slate-200 pt-5 sm:grid-cols-2">
              {f.payment && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">How to pay</div>
                  <div className="mt-1 text-slate-700">{lineEls(f.payment)}</div>
                </div>
              )}
              {f.notes && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Notes</div>
                  <div className="mt-1 text-slate-700">{lineEls(f.notes)}</div>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-500 print:hidden">
          In the print window choose &quot;Save as PDF&quot; as the destination to get a file. Everything you type stays in
          your browser and is never sent to a server.
        </p>
      </div>
    </div>
  );
}
