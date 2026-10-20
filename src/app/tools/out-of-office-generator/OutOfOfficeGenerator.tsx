"use client";

import { useMemo, useState } from "react";

type Tone = "professional" | "friendly" | "brief";
type Reason = "away" | "vacation" | "travel" | "holiday" | "leave" | "limited";

interface Form {
  name: string;
  title: string;
  company: string;
  reason: Reason;
  tone: Tone;
  start: string;
  end: string;
  showDates: boolean;
  checkEmail: "no" | "limited";
  responseTime: string;
  urgentName: string;
  urgentContact: string;
  generalName: string;
  generalContact: string;
}

const REASONS: { value: Reason; label: string }[] = [
  { value: "away", label: "Out of office" },
  { value: "vacation", label: "Vacation" },
  { value: "travel", label: "Business travel or conference" },
  { value: "holiday", label: "Public holiday or office closure" },
  { value: "leave", label: "Extended leave" },
  { value: "limited", label: "Limited email access" },
];

const iso = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const EXAMPLE: Form = {
  name: "Jordan Lee",
  title: "Operations Manager",
  company: "Acme Operations",
  reason: "vacation",
  tone: "professional",
  start: iso(7),
  end: iso(14),
  showDates: true,
  checkEmail: "no",
  responseTime: "two business days",
  urgentName: "Sam Rivera",
  urgentContact: "sam@example.com",
  generalName: "the Operations team",
  generalContact: "ops@example.com",
};

const EMPTY: Form = {
  ...EXAMPLE,
  name: "",
  title: "",
  company: "",
  start: "",
  end: "",
  urgentName: "",
  urgentContact: "",
  generalName: "",
  generalContact: "",
};

function fmt(isoDate: string): string {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(d);
}

function reasonPhrase(r: Reason): string {
  switch (r) {
    case "vacation": return "on vacation";
    case "travel": return "traveling for work";
    case "holiday": return "away for the holiday";
    case "leave": return "on leave";
    case "limited": return "out of the office with limited email access";
    default: return "out of the office";
  }
}

interface Out {
  subject: string;
  internal: string;
  external: string;
}

function build(f: Form): Out {
  const who = f.name.trim() || "[Your name]";
  const returnOn = fmt(f.end);
  const startOn = fmt(f.start);
  const datesShown = f.showDates && Boolean(returnOn);
  const away =
    f.showDates && startOn && returnOn
      ? `I am ${reasonPhrase(f.reason)} from ${startOn} and will be back on ${returnOn}.`
      : datesShown
        ? `I am ${reasonPhrase(f.reason)} and will be back on ${returnOn}.`
        : `I am ${reasonPhrase(f.reason)}.`;
  const awayFriendly =
    f.showDates && returnOn
      ? `Thanks for your message. I am ${reasonPhrase(f.reason)} and will be back on ${returnOn}.`
      : `Thanks for your message. I am ${reasonPhrase(f.reason)}.`;
  const awayBrief = f.showDates && returnOn ? `I am ${reasonPhrase(f.reason)} until ${returnOn}.` : `I am ${reasonPhrase(f.reason)}.`;

  const access =
    f.checkEmail === "limited"
      ? "I will have limited access to email and will reply as soon as I can."
      : "I will not be checking email while I am away.";
  const rt = f.responseTime.trim() ? `I will reply within ${f.responseTime.trim()} of my return.` : "";

  const back = datesShown || rt ? "" : "I will reply when I return.";
  const urgent = f.urgentName.trim()
    ? `For anything urgent, please contact ${f.urgentName.trim()}${f.urgentContact.trim() ? ` at ${f.urgentContact.trim()}` : ""}.`
    : "";
  const general = f.generalName.trim()
    ? `For other questions, please contact ${f.generalName.trim()}${f.generalContact.trim() ? ` at ${f.generalContact.trim()}` : ""}.`
    : "";

  const sig = [who, f.title.trim(), f.company.trim()].filter(Boolean).join("\n");

  const subject = (() => {
    const base = f.reason === "holiday" ? "Out of office" : f.reason === "limited" ? "Limited email access" : "Out of office";
    return f.showDates && returnOn ? `${base}: back ${returnOn.replace(/^\w+, /, "")}` : base;
  })();

  let internal = "";
  let external = "";

  if (f.tone === "brief") {
    const ext = [awayBrief, urgent || general].filter(Boolean).join(" ");
    external = `${ext}\n\n${who}`;
    internal = [`${awayBrief} ${access}`, [urgent, general].filter(Boolean).join(" ")].filter(Boolean).join("\n\n") + `\n\n${who}`;
  } else if (f.tone === "friendly") {
    external = [
      "Hello,",
      `${awayFriendly} ${rt}`.trim(),
      [urgent, general].filter(Boolean).join(" "),
      "Thank you for your patience.",
      sig,
    ].filter(Boolean).join("\n\n");
    internal = [
      "Hi all,",
      `${awayFriendly} ${access}`,
      [urgent, general].filter(Boolean).join(" "),
      "Thanks,",
      who,
    ].filter(Boolean).join("\n\n");
  } else {
    external = [
      "Hello,",
      `Thank you for your message. ${away} ${back}`.replace(/\s+/g, " ").trim(),
      rt,
      [urgent, general].filter(Boolean).join(" "),
      "Kind regards,",
      sig,
    ].filter(Boolean).join("\n\n");
    internal = [
      "Hello,",
      `${away} ${access}`.replace(/\s+/g, " ").trim(),
      back,
      [urgent, general].filter(Boolean).join(" "),
      "Kind regards,",
      who,
    ].filter(Boolean).join("\n\n");
  }

  // Remove placeholders for dates that were not provided and tidy double spaces.
  const tidy = (s: string) => s.replace(/[ \t]+\n/g, "\n").replace(/ {2,}/g, " ");
  return { subject, internal: tidy(internal), external: tidy(external) };
}

const inputCls =
  "mt-1.5 w-full rounded-lg border border-cream-300 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-gold-500";

export default function OutOfOfficeGenerator() {
  const [f, setF] = useState<Form>(EXAMPLE);
  const [tab, setTab] = useState<"external" | "internal">("external");
  const [copied, setCopied] = useState("");
  const out = useMemo(() => build(f), [f]);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const dateWarning = f.start && f.end && f.end < f.start ? "The return date is before the start date." : "";
  const text = tab === "external" ? out.external : out.internal;

  const copy = async (what: "subject" | "body") => {
    try {
      await navigator.clipboard.writeText(what === "subject" ? out.subject : text);
      setCopied(what);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="card space-y-5 p-6">
        <div className="flex gap-3 text-sm">
          <button type="button" className="font-semibold text-gold-700 underline underline-offset-2" onClick={() => setF(EXAMPLE)}>Load example</button>
          <button type="button" className="font-semibold text-ink-500 underline underline-offset-2" onClick={() => setF(EMPTY)}>Clear</button>
        </div>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">About you</legend>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Your name</span>
            <input value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Job title (optional)</span>
            <input value={f.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-ink-900">Company (optional)</span>
            <input value={f.company} onChange={(e) => set("company", e.target.value)} className={inputCls} />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">When and why</legend>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Reason</span>
            <select value={f.reason} onChange={(e) => set("reason", e.target.value as Reason)} className={inputCls}>
              {REASONS.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Tone</span>
            <select value={f.tone} onChange={(e) => set("tone", e.target.value as Tone)} className={inputCls}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="brief">Brief</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">First day away</span>
            <input type="date" value={f.start} onChange={(e) => set("start", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Return date</span>
            <input type="date" value={f.end} onChange={(e) => set("end", e.target.value)} className={inputCls} />
          </label>
          {dateWarning && <p className="text-xs text-red-700 sm:col-span-2" role="alert">{dateWarning}</p>}
          <label className="flex items-start gap-2 text-sm text-ink-800 sm:col-span-2">
            <input type="checkbox" checked={f.showDates} onChange={(e) => set("showDates", e.target.checked)} className="mt-1" />
            <span>Include dates in the message. Turn this off if you would rather not announce when you are away.</span>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Email access</span>
            <select value={f.checkEmail} onChange={(e) => set("checkEmail", e.target.value as Form["checkEmail"])} className={inputCls}>
              <option value="no">Not checking email</option>
              <option value="limited">Checking occasionally</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Reply within (after return)</span>
            <input value={f.responseTime} onChange={(e) => set("responseTime", e.target.value)} className={inputCls} placeholder="two business days" />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">Who covers for you</legend>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Urgent contact name</span>
            <input value={f.urgentName} onChange={(e) => set("urgentName", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">Urgent contact email or phone</span>
            <input value={f.urgentContact} onChange={(e) => set("urgentContact", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">General contact or team</span>
            <input value={f.generalName} onChange={(e) => set("generalName", e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink-900">General contact email</span>
            <input value={f.generalContact} onChange={(e) => set("generalContact", e.target.value)} className={inputCls} />
          </label>
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div role="tablist" aria-label="Audience" className="mb-3 inline-flex rounded-lg border border-cream-300 bg-white p-1 text-sm font-semibold">
          {(["external", "internal"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 ${tab === t ? "bg-gold-100 text-gold-700" : "text-ink-600 hover:text-ink-900"}`}
            >
              {t === "external" ? "Clients and outside contacts" : "Colleagues"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-cream-300 bg-white p-5">
          <div className="flex items-center justify-between gap-3 border-b border-cream-300 pb-3">
            <div className="min-w-0 text-sm">
              <span className="font-semibold text-ink-500">Subject: </span>
              <span className="break-words text-ink-900" data-testid="ooo-subject">{out.subject}</span>
            </div>
            <button type="button" onClick={() => copy("subject")} className="shrink-0 text-sm font-semibold text-gold-700 underline underline-offset-2">
              {copied === "subject" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre data-testid="ooo-body" className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-900">{text}</pre>
        </div>

        <div className="mt-3 flex gap-3">
          <button type="button" onClick={() => copy("body")} className="btn-primary">{copied === "body" ? "Copied" : "Copy message"}</button>
        </div>

        <p className="mt-3 text-xs text-ink-500">
          The outside version keeps personal detail to a minimum. Nothing you type here leaves your browser.
        </p>
      </div>
    </div>
  );
}
