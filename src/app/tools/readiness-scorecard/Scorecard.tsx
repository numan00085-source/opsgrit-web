"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Cat = "process" | "inputs" | "value" | "control" | "owner";

const CATS: Record<Cat, { name: string; fix: string; links: { href: string; label: string }[] }> = {
  process: {
    name: "Process clarity",
    fix: "Write the process as numbered steps and have two people follow them. Where they differ, decide the rule before you automate it.",
    links: [
      { href: "/tools/sop-builder", label: "SOP builder" },
      { href: "/blog/how-to-write-an-sop-people-follow", label: "How to write an SOP people follow" },
    ],
  },
  inputs: {
    name: "Inputs and systems",
    fix: "Make the input arrive in one place and one format, and confirm the systems involved can be reached by an integration or an export.",
    links: [
      { href: "/blog/system-of-record-source-of-truth", label: "System of record" },
      { href: "/blog/webhooks-apis-ipaas-integration-patterns", label: "Webhooks, APIs and iPaaS patterns" },
    ],
  },
  value: {
    name: "Volume and value",
    fix: "Time the task for a week before you decide. A rare or very quick task rarely pays back the build and the upkeep.",
    links: [
      { href: "/tools/roi-calculator", label: "Automation ROI calculator" },
      { href: "/blog/what-to-automate-first-process-prioritization", label: "What to automate first" },
    ],
  },
  control: {
    name: "Risk and control",
    fix: "Add a human approval before money moves, customers are contacted or records are deleted, and make sure a wrong result can be undone.",
    links: [
      { href: "/blog/human-in-the-loop-ai-approvals", label: "Human-in-the-loop design" },
      { href: "/blog/ai-agent-safety-boundary-template", label: "Agent safety boundary template" },
    ],
  },
  owner: {
    name: "Ownership and monitoring",
    fix: "Name one owner, send failures to a place someone reads, and put a review in the calendar.",
    links: [
      { href: "/blog/automation-alert-review-cadence-weekly-monthly", label: "Alert review cadence" },
      { href: "/tools/raci-generator", label: "RACI matrix generator" },
    ],
  },
};

interface Q {
  cat: Cat;
  text: string;
  opts: [string, string, string];
}

const QUESTIONS: Q[] = [
  { cat: "process", text: "Could you write the task as numbered steps that two different people would carry out the same way?", opts: ["No, it depends on the person", "Mostly, with a few judgment calls", "Yes, the steps are clear"] },
  { cat: "process", text: "Do the rules and steps stay the same from one run to the next?", opts: ["No, every case is different", "Mostly the same, with some exceptions", "Yes, the same each time"] },
  { cat: "inputs", text: "Does the input always arrive in the same place and format, such as a form, a system or one inbox?", opts: ["No, it comes from many places", "Partly, some cleanup is needed", "Yes, one place and format"] },
  { cat: "inputs", text: "Can the systems involved be connected by an integration, an API or a regular export?", opts: ["No, or we do not know", "Some of them can", "Yes, all of them"] },
  { cat: "value", text: "How often is the task done?", opts: ["Less than monthly", "Monthly to weekly", "Weekly or more"] },
  { cat: "value", text: "Do you know how long it takes today, measured rather than guessed?", opts: ["No idea", "A rough guess", "Yes, we timed it"] },
  { cat: "control", text: "If it goes wrong, can the mistake be caught and undone before it reaches a customer or a payment?", opts: ["No, it cannot be undone", "Sometimes", "Yes, we can catch and undo it"] },
  { cat: "control", text: "Is there a point where a person approves the risky steps?", opts: ["No, it would run unattended", "For some steps", "Yes, for every risky step"] },
  { cat: "owner", text: "Will one named person own the process after it goes live?", opts: ["No owner yet", "A team, not a person", "Yes, one named owner"] },
  { cat: "owner", text: "Will someone be alerted when it fails and review how it is doing on a schedule?", opts: ["No", "Alerts only", "Alerts and a scheduled review"] },
];

type Band = { name: string; text: string };
function bandOf(pct: number, controlScore: number): Band {
  let b: Band;
  if (pct < 35) b = { name: "Not ready yet", text: "Document and stabilise the process first. Automating an unclear process makes the confusion faster." };
  else if (pct < 60) b = { name: "Partly ready", text: "Fix the weakest areas below, then try a small pilot on a low-risk slice of the work." };
  else if (pct < 80) b = { name: "Ready for a pilot", text: "Start small, keep a person in the loop and measure results before you widen it." };
  else b = { name: "Strong candidate", text: "The basics are in place. Pilot it, measure it and keep the review cadence." };
  if (controlScore <= 1 && (b.name === "Ready for a pilot" || b.name === "Strong candidate")) {
    b = { name: "Partly ready", text: "The other areas look good, but the risk controls are thin. Add an approval step and a way to undo mistakes before you go live." };
  }
  return b;
}

export default function Scorecard() {
  const [a, setA] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const code = new URLSearchParams(window.location.search).get("a") ?? "";
      if (/^[0-2]{10}$/.test(code)) setA(code.split("").map(Number));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const done = a.every((x) => x !== null);
  const answered = a.filter((x) => x !== null).length;

  useEffect(() => {
    if (!ready) return;
    try {
      window.history.replaceState(null, "", window.location.pathname + (done ? `?a=${a.join("")}` : ""));
    } catch {
      /* ignore */
    }
  }, [a, done, ready]);

  const res = useMemo(() => {
    const by: Record<Cat, number> = { process: 0, inputs: 0, value: 0, control: 0, owner: 0 };
    QUESTIONS.forEach((q, i) => (by[q.cat] += a[i] ?? 0));
    const total = Object.values(by).reduce((x, y) => x + y, 0);
    const pct = Math.round((total / 20) * 100);
    return { by, pct, band: bandOf(pct, by.control) };
  }, [a]);

  const weakest = (Object.keys(res.by) as Cat[]).filter((c) => res.by[c] <= 2).sort((x, y) => res.by[x] - res.by[y]);

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote(msg);
    } catch {
      setNote("Copy is blocked in this browser.");
    }
    setTimeout(() => setNote(""), 2200);
  };

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-5">
        {QUESTIONS.map((q, i) => (
          <fieldset key={i} className="card p-5">
            <legend className="sr-only">Question {i + 1}</legend>
            <p className="text-xs font-bold uppercase tracking-wider text-gold-700">{CATS[q.cat].name} · {i + 1} of {QUESTIONS.length}</p>
            <p className="mt-1.5 font-semibold text-ink-900">{q.text}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {q.opts.map((o, v) => {
                const on = a[i] === v;
                return (
                  <label
                    key={v}
                    className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm transition ${on ? "border-gold-500 bg-gold-100/70 font-semibold text-ink-900" : "border-cream-300 bg-white text-ink-700 hover:border-gold-400"}`}
                  >
                    <input
                      type="radio"
                      name={`q${i}`}
                      className="sr-only"
                      checked={on}
                      onChange={() => setA((p) => p.map((x, j) => (j === i ? v : x)))}
                    />
                    {o}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-night-950 p-6 text-white" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Your result</p>
          {!done ? (
            <>
              <p className="mt-3 text-2xl font-extrabold">{answered} of {QUESTIONS.length} answered</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold-400 transition-all" style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} /></div>
              <p className="mt-3 text-sm text-slate-300">Answer every question to see your score and what to fix first.</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-5xl font-extrabold">{res.pct}<span className="text-2xl text-slate-400"> / 100</span></p>
              <p className="mt-1 text-lg font-bold text-gold-300">{res.band.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{res.band.text}</p>
              <ul className="mt-5 space-y-3">
                {(Object.keys(res.by) as Cat[]).map((c) => (
                  <li key={c}>
                    <div className="flex justify-between text-xs text-slate-300"><span>{CATS[c].name}</span><span>{res.by[c]} / 4</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold-400" style={{ width: `${(res.by[c] / 4) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {done && (
          <div className="mt-4 space-y-4">
            <div className="card p-5">
              <h2 className="font-extrabold text-ink-900">{weakest.length ? "Fix these first" : "Nothing urgent"}</h2>
              {weakest.length === 0 && <p className="mt-2 text-sm text-ink-600">Every area scored 3 or 4 out of 4. Move on to a measured pilot.</p>}
              {weakest.map((c) => (
                <div key={c} className="mt-3 border-t border-cream-200 pt-3 first:mt-2 first:border-0 first:pt-0">
                  <p className="text-sm font-bold text-ink-900">{CATS[c].name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{CATS[c].fix}</p>
                  <p className="mt-1.5 text-sm">
                    {CATS[c].links.map((l, k) => (
                      <span key={l.href}>{k > 0 && " · "}<Link href={l.href} className="font-semibold text-gold-700 underline underline-offset-2">{l.label}</Link></span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={() => copy(window.location.href, "Link copied. It opens with these answers.")}>Copy link to my result</button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => copy(`Automation readiness: ${res.pct}/100 (${res.band.name}). Weakest areas: ${weakest.map((c) => CATS[c].name).join(", ") || "none"}. Try it: ${window.location.href}`, "Summary copied.")}
              >
                Copy summary
              </button>
              <button type="button" className="text-sm font-semibold text-ink-500 underline underline-offset-2" onClick={() => setA(QUESTIONS.map(() => null))}>Start over</button>
            </div>
            <p className="text-sm text-ink-500" role="status" aria-live="polite">{note}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
