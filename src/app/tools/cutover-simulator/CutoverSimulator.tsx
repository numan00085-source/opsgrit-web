"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Opt = { text: string; points: 0 | 1 | 3 };
interface Round {
  phase: string;
  pressure: string;
  question: string;
  options: Opt[];
  why: string;
}

const ROUNDS: Round[] = [
  {
    phase: "Assess",
    pressure: "Leadership wants the new CRM live in three weeks.",
    question: "Where do you start?",
    options: [
      { text: "Spend about a week on a pre-flight audit: inventory every workflow and integration, map dependencies, and name the system of record for each data type.", points: 3 },
      { text: "Move a copy of the data into a sandbox and discover the dependencies as you go.", points: 1 },
      { text: "Skip the audit. The vendor's migration wizard will find what matters.", points: 0 },
    ],
    why: "Hidden dependencies cause most migration surprises. Naming the system of record for each data type before anything moves means nobody argues about which copy is right later.",
  },
  {
    phase: "Prepare",
    pressure: "The data has duplicate customers and mismatched status values.",
    question: "How do you handle the mapping?",
    options: [
      { text: "Build a field-level mapping table (source, target, transform, validation rule) and write reconciliation queries for row counts, checksums and business-key uniqueness.", points: 3 },
      { text: "Map the main fields and spot-check a sample by hand.", points: 1 },
      { text: "Import everything as it is and clean it up after go-live.", points: 0 },
    ],
    why: "Mapping tables turn a vague promise (we moved the data) into something you can test. Reconciliation queries tell you, with evidence, whether source and target still agree.",
  },
  {
    phase: "Prepare",
    pressure: "The sandbox is validated and the team is relaxed.",
    question: "What do you settle before any live traffic moves?",
    options: [
      { text: "Written rollback triggers with thresholds, and one named decision owner for each trigger.", points: 3 },
      { text: "Agree that the team will get together and decide if something goes wrong.", points: 1 },
      { text: "Nothing. The new tool is better, so a rollback will not be needed.", points: 0 },
    ],
    why: "Triggers decided in advance remove the debate during an incident. If nobody can say 'we roll back now', the team is not ready to cut over.",
  },
  {
    phase: "Parallel-run",
    pressure: "Everything looks good in the sandbox. Now real customers are involved.",
    question: "How do you start using live traffic?",
    options: [
      { text: "Shadow mode first: mirror writes to the new system, compare outputs field by field, then ramp live traffic in measured steps and pause the ramp if any criterion fails.", points: 3 },
      { text: "Move one whole department to the new tool and watch how it goes.", points: 1 },
      { text: "Switch everyone at once. Running two systems doubles the work.", points: 0 },
    ],
    why: "Shadow mode proves the new system handles real workloads without users noticing a thing. Stepped ramps keep the blast radius small, and a clean pause beats a messy fix.",
  },
  {
    phase: "Cutover",
    pressure: "Shadow mode has been clean. It is cutover time.",
    question: "How do you run the cutover?",
    options: [
      { text: "A scheduled freeze window, a verification checklist (smoke tests, webhook delivery, report parity, top workflows) and a sign-off at each checkpoint.", points: 3 },
      { text: "Cut over late on Friday so users do not notice, and verify on Monday.", points: 1 },
      { text: "Flip the switch mid-day and fix problems as users report them.", points: 0 },
    ],
    why: "A freeze window with checkpoints, each signed off by a named person, turns the cutover into a controlled relay instead of a gamble.",
  },
  {
    phase: "Decommission",
    pressure: "The new system has been stable for two days and finance is asking about the old bill.",
    question: "What happens to the old system?",
    options: [
      { text: "Keep it available (read-only if possible) for at least one billing cycle and follow a decommission checklist.", points: 3 },
      { text: "Keep it for two weeks, then cancel.", points: 1 },
      { text: "Cancel it today and save the subscription fee.", points: 0 },
    ],
    why: "Stranded data and edge cases show up late, often at month end. One billing cycle of access is a cheap insurance policy.",
  },
];

const MAX = ROUNDS.length * 3;

// small seeded shuffle so options move around on every play but render identically on server and client
function seeded(seed: number) {
  let s = seed + 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  if (seed === 0) return a;
  const r = seeded(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function outcome(score: number) {
  if (score >= 16) return { title: "Clean cutover", tone: "text-emerald-700", body: "Users barely noticed. You audited first, proved the new system in shadow mode, and had a rollback plan nobody had to use." };
  if (score >= 11) return { title: "Cutover with a few incidents", tone: "text-amber-700", body: "You got there, but a gap or two cost you a bad weekend. Check which rounds lost points below." };
  if (score >= 6) return { title: "Rollback triggered", tone: "text-orange-700", body: "Gaps in preparation showed up in production and the team had to roll back. The playbook below would have caught most of them." };
  return { title: "Extended outage", tone: "text-red-700", body: "Too many shortcuts piled up. Data drifted, nobody owned the rollback decision, and the old system was gone. This is what the playbook exists to prevent." };
}

const SQ = (p: number) => (p === 3 ? "🟩" : p === 1 ? "🟨" : "🟥");

export default function CutoverSimulator() {
  const [attempt, setAttempt] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [copied, setCopied] = useState(false);

  const done = results.length === ROUNDS.length;
  const round = ROUNDS[Math.min(i, ROUNDS.length - 1)];
  const options = useMemo(() => shuffle(round.options, attempt * 31 + i), [round, attempt, i]);
  const score = results.reduce((a, b) => a + b, 0);
  const lost = results.reduce((a, b) => a + (3 - b), 0);
  const risk = Math.round((lost / MAX) * 100);

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
  };
  const next = () => {
    if (picked === null) return;
    setResults((r) => [...r, options[picked].points]);
    setPicked(null);
    if (i < ROUNDS.length - 1) setI(i + 1);
  };
  const reset = () => {
    setAttempt((a) => a + 1);
    setI(0);
    setPicked(null);
    setResults([]);
    setStarted(true);
    setCopied(false);
  };

  const shareText = () =>
    `I scored ${score}/${MAX} on the OpsGrit Cutover Simulator: "${outcome(score).title}"\n${results.map(SQ).join("")}\nCan you migrate ops tools without downtime? https://www.getopsgrit.com/tools/cutover-simulator`;
  const share = async () => {
    const text = shareText();
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  if (!started) {
    return (
      <div className="card mt-8 max-w-3xl p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Scenario</p>
        <h2 className="mt-2 text-2xl font-bold text-ink-900">You are migrating your company's CRM</h2>
        <p className="mt-3 leading-relaxed text-ink-600">
          Six decisions stand between you and a clean cutover. Each one has a sound answer, a risky shortcut and a
          middle path. Your score and risk meter react to every choice. It takes about three minutes.
        </p>
        <button type="button" onClick={() => setStarted(true)} className="btn-primary mt-6">Start the migration</button>
      </div>
    );
  }

  if (done) {
    const o = outcome(score);
    return (
      <div className="card mt-8 max-w-3xl p-7 sm:p-9" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Result</p>
        <h2 className={`mt-2 text-3xl font-extrabold ${o.tone}`}>{o.title}</h2>
        <p className="mt-2 text-lg font-semibold text-ink-900">{score} / {MAX} points</p>
        <p className="mt-3 leading-relaxed text-ink-600">{o.body}</p>
        <div className="mt-5 text-2xl tracking-widest" aria-label="Your round results">{results.map(SQ).join("")}</div>

        <ol className="mt-6 space-y-3">
          {results.map((p, idx) => (
            <li key={idx} className="rounded-xl border border-cream-300 bg-white/60 p-4 text-sm">
              <span className="font-semibold text-ink-900">{SQ(p)} {ROUNDS[idx].phase}: {ROUNDS[idx].question}</span>
              {p < 3 && <p className="mt-1 leading-relaxed text-ink-600">{ROUNDS[idx].why}</p>}
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={share} className="btn-primary">{copied ? "Copied" : "Share my result"}</button>
          <button type="button" onClick={reset} className="btn-ghost">Play again</button>
          <Link href="/blog/migrate-operations-tools-without-downtime-playbook" className="btn-ghost">Read the full playbook</Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">This is a learning game, not a prediction of how a real migration will go.</p>
      </div>
    );
  }

  const chosen = picked !== null ? options[picked] : null;
  return (
    <div className="card mt-8 max-w-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
        <span>Round {i + 1} of {ROUNDS.length} · {round.phase}</span>
        <span>Score {score}</span>
      </div>
      <div className="mt-3" role="img" aria-label={`Cutover risk ${risk} percent`}>
        <div className="flex items-center justify-between text-xs text-ink-500"><span>Cutover risk</span><span>{risk}%</span></div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-cream-300">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500" style={{ width: `${Math.max(risk, 4)}%` }} />
        </div>
      </div>

      <p className="mt-6 rounded-lg border-l-4 border-gold-500 bg-gold-100/60 px-4 py-3 text-sm text-ink-700">{round.pressure}</p>
      <h2 className="mt-4 text-xl font-bold text-ink-900 sm:text-2xl">{round.question}</h2>

      <div className="mt-5 space-y-3" role="group" aria-label="Choose one option">
        {options.map((o, idx) => {
          const isPick = picked === idx;
          const reveal = picked !== null;
          const style = !reveal
            ? "border-cream-300 bg-white/70 hover:border-gold-500 hover:bg-white"
            : o.points === 3
              ? "border-emerald-500 bg-emerald-50"
              : isPick
                ? o.points === 1
                  ? "border-amber-500 bg-amber-50"
                  : "border-red-500 bg-red-50"
                : "border-cream-300 bg-white/40 opacity-70";
          return (
            <button
              key={o.text}
              type="button"
              onClick={() => choose(idx)}
              disabled={reveal}
              aria-pressed={isPick}
              className={`w-full rounded-xl border-2 p-4 text-left text-sm leading-relaxed text-ink-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-600 sm:text-base ${style}`}
            >
              {o.text}
              {reveal && o.points === 3 && <span className="ml-2 font-semibold text-emerald-700">Best practice</span>}
              {reveal && isPick && o.points !== 3 && <span className="ml-2 font-semibold text-ink-700">{o.points === 1 ? "Risky" : "Dangerous"}</span>}
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="mt-5" aria-live="polite">
          <p className="rounded-xl border border-cream-300 bg-white/60 p-4 text-sm leading-relaxed text-ink-700">
            <span className="font-semibold text-ink-900">
              {chosen.points === 3 ? "Good call. " : chosen.points === 1 ? "Partly right. " : "Ouch. "}
            </span>
            {round.why}
          </p>
          <button type="button" onClick={next} className="btn-primary mt-4">{i === ROUNDS.length - 1 ? "See my result" : "Next round"}</button>
        </div>
      )}
    </div>
  );
}
