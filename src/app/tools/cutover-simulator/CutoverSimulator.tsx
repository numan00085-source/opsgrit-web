"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { IconCheck, IconCross, IconGear, IconPlanet, IconPuzzle, IconRocket, IconWarn, Pip } from "@/components/icons/OpsIcons";

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
export function shuffle<T>(arr: T[], seed: number): T[] {
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
  if (score >= 16) return { title: "Clean cutover", tone: "text-emerald-300", body: "Users barely noticed. You audited first, proved the new system in shadow mode, and had a rollback plan nobody had to use." };
  if (score >= 11) return { title: "Cutover with a few incidents", tone: "text-amber-300", body: "You got there, but a gap or two cost you a bad weekend. Check which rounds lost points below." };
  if (score >= 6) return { title: "Rollback triggered", tone: "text-orange-300", body: "Gaps in preparation showed up in production and the team had to roll back. The playbook below would have caught most of them." };
  return { title: "Extended outage", tone: "text-red-300", body: "Too many shortcuts piled up. Data drifted, nobody owned the rollback decision, and the old system was gone. This is what the playbook exists to prevent." };
}

const PLANETS = ["Assess", "Prepare", "Prepare", "Parallel", "Cutover", "Retire"];
const PIECE = "M10 10 H40 a10 10 0 1 1 20 0 H90 V40 a10 10 0 1 1 0 20 V90 H60 a10 10 0 1 0 -20 0 H10 Z";

/** Glass panel for the game. The space backdrop (stars, nebula, puzzle pieces) fills the whole page behind it. */
export function Stage({ children, shake = false, flash, flashKey = 0 }: { children: React.ReactNode; shake?: boolean; flash?: "good" | "bad" | null; flashKey?: number }) {
  return (
    <div className={`relative mt-8 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#070b14]/55 text-slate-100 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-[2px] ${shake ? "cs-shake" : ""}`}>
      {flash && <div key={`${flash}-${flashKey}`} className={`cs-flash pointer-events-none absolute inset-0 ${flash === "good" ? "bg-emerald-400/25" : "bg-red-500/30"}`} />}
      <div className="relative z-10 p-5 sm:p-9">{children}</div>
    </div>
  );
}

/** Count up to a number so the score feels earned. */
export function useCount(target: number, run: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return n;
}

export function Burst() {
  return (
    <span className="pointer-events-none absolute right-6 top-1/2 z-20" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <i key={i} className="cs-spark absolute block h-2 w-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-500" style={{ ["--a" as string]: `${i * 30}deg`, ["--d" as string]: `${46 + (i % 3) * 14}px`, left: 0, top: 0 }} />
      ))}
    </span>
  );
}

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-full overflow-hidden" aria-hidden="true">
      {Array.from({ length: 34 }).map((_, i) => (
        <i
          key={i}
          className="cs-confetti absolute block"
          style={{
            left: `${(i * 29) % 100}%`,
            width: 7 + (i % 3) * 3,
            height: 10 + (i % 4) * 3,
            background: ["#f6e3a3", "#d4af4f", "#8b93f7", "#34d399", "#ffffff"][i % 5],
            borderRadius: i % 2 ? 2 : 9,
            ["--x" as string]: `${((i % 7) - 3) * 18}px`,
            ["--ft" as string]: `${2.6 + (i % 5) * 0.35}s`,
            ["--fd" as string]: `${(i % 9) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

/** The mission route: six planets, one per decision, with a rocket travelling between them. */
function Route({ results, i, done }: { results: number[]; i: number; done: boolean }) {
  const at = done ? 5 : i;
  return (
    <div className="relative mx-1 mt-1 pb-7 pt-2" role="img" aria-label={`Mission progress, round ${Math.min(i + 1, ROUNDS.length)} of ${ROUNDS.length}`}>
      <div className="absolute left-[4%] right-[4%] top-[22px] h-[3px] rounded-full bg-white/10" />
      <div className="absolute left-[4%] top-[22px] h-[3px] rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700" style={{ width: `${(at / 5) * 92}%` }} />
      <div className="relative flex justify-between px-[1%]">
        {PLANETS.map((name, idx) => {
          const r = results[idx];
          const cur = idx === i && !done;
          const color = r === undefined ? (cur ? "bg-amber-300" : "bg-slate-600") : r === 3 ? "bg-emerald-400" : r === 1 ? "bg-amber-400" : "bg-red-500";
          return (
            <div key={idx} className="relative flex w-10 flex-col items-center sm:w-14">
              {cur && <span className="cs-ring absolute top-[2px] h-5 w-5 rounded-full border-2 border-amber-300" />}
              <span className={`relative h-5 w-5 rounded-full ring-2 ring-white/20 transition-colors duration-500 ${color}`} style={{ marginTop: 3 }}>
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
              </span>
              <span className="mt-2 hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">{name}</span>
            </div>
          );
        })}
      </div>
      <span className="absolute top-0 text-lg transition-all duration-700 ease-out" style={{ left: `calc(4% + ${(at / 5) * 92}% - 12px)` }} aria-hidden="true">
        <span className="cs-rocket inline-block"><IconRocket size={24} className="rotate-90" /></span>
      </span>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300/90">{children}</p>;
}

export default function CutoverSimulator() {
  const [attempt, setAttempt] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const done = results.length === ROUNDS.length;
  const round = ROUNDS[Math.min(i, ROUNDS.length - 1)];
  const options = useMemo(() => shuffle(round.options, attempt * 31 + i), [round, attempt, i]);
  const score = results.reduce((a, b) => a + b, 0);
  const lost = results.reduce((a, b) => a + (3 - b), 0);
  const risk = Math.round((lost / MAX) * 100);
  const shown = useCount(score, done);

  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setFlash(options[idx].points === 3 ? "good" : options[idx].points === 0 ? "bad" : null);
  };
  const next = () => {
    if (picked === null) return;
    setResults((r) => [...r, options[picked].points]);
    setPicked(null);
    setFlash(null);
    if (i < ROUNDS.length - 1) setI(i + 1);
  };
  const reset = () => {
    setAttempt((a) => a + 1);
    setI(0);
    setPicked(null);
    setResults([]);
    setStarted(true);
    setCopied(false);
    setFlash(null);
  };

  const shareText = () =>
    `I scored ${score}/${MAX} on the OpsGrit Cutover Simulator: "${outcome(score).title}"\n${results.filter((r) => r === 3).length} best-practice, ${results.filter((r) => r === 1).length} risky, ${results.filter((r) => r === 0).length} dangerous\nCan you migrate ops tools without downtime? https://www.getopsgrit.com/tools/cutover-simulator`;
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

  const glassBtn = "inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-100 backdrop-blur transition hover:border-amber-300/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

  if (!started) {
    return (
      <Stage>
        <div className="cs-in mx-auto max-w-2xl py-6 text-center sm:py-12">
          <Eyebrow>Mission briefing</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Migrate the CRM. <span className="gold-text-light">Don&rsquo;t crash the company.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-300">
            Six decisions stand between you and a clean cutover. Each has a sound answer, a risky shortcut and a middle
            path. Your score and risk meter react to every call. About three minutes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="inline-flex items-center gap-1.5"><IconPuzzle size={18} /> 6 puzzles</span><span className="inline-flex items-center gap-1.5"><IconPlanet size={18} /> 6 planets</span><span className="inline-flex items-center gap-1.5"><IconRocket size={18} /> 1 cutover</span>
          </div>
          <button type="button" onClick={() => setStarted(true)} className="btn-primary cs-glow mt-8 px-8 py-3 text-base">Launch mission</button>
        </div>
      </Stage>
    );
  }

  if (done) {
    const o = outcome(score);
    const bad = score < 6;
    return (
      <Stage shake={bad}>
        {score >= 16 && <Confetti />}
        <div className="cs-in" aria-live="polite">
          <Route results={results} i={i} done />
          <Eyebrow>Mission report</Eyebrow>
          <h2 className={`mt-2 text-3xl font-extrabold sm:text-5xl ${o.tone}`}>{o.title}</h2>
          <p className="mt-3 text-5xl font-black tabular-nums text-white sm:text-6xl">
            {shown}<span className="text-2xl font-bold text-slate-400"> / {MAX}</span>
          </p>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-300">{o.body}</p>
          <div className="mt-5 flex gap-1.5" aria-label="Your round results">{results.map((p, k) => <Pip key={k} p={p} size={28} />)}</div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {results.map((p, idx) => (
              <li key={idx} className="cs-in rounded-xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur" style={{ animationDelay: `${idx * 90}ms` }}>
                <span className="flex items-start gap-2 font-semibold text-white"><Pip p={p} size={20} /><span>{ROUNDS[idx].phase}: {ROUNDS[idx].question}</span></span>
                {p < 3 ? <p className="mt-1 pl-7 leading-relaxed text-slate-300">{ROUNDS[idx].why}</p> : <p className="mt-1 pl-7 text-emerald-300">Nailed it.</p>}
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={share} className="btn-primary">{copied ? "Copied" : "Share my result"}</button>
            <button type="button" onClick={reset} className={glassBtn}>Play again</button>
            <Link href="/blog/migrate-operations-tools-without-downtime-playbook" className={glassBtn}>Read the full playbook</Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">This is a learning game, not a prediction of how a real migration will go.</p>
        </div>
      </Stage>
    );
  }

  const chosen = picked !== null ? options[picked] : null;
  const riskColor = risk < 25 ? "from-emerald-400 to-emerald-300" : risk < 55 ? "from-amber-400 to-amber-300" : "from-red-500 to-orange-400";
  return (
    <Stage shake={chosen?.points === 0} flash={flash} flashKey={i}>
      <Route results={results} i={i} done={false} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>Round {i + 1} of {ROUNDS.length} · {round.phase}</Eyebrow>
        <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-bold tabular-nums text-amber-200">Score {score}</span>
      </div>
      <div className="mt-3" role="img" aria-label={`Cutover risk ${risk} percent`}>
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400"><span>Cutover risk</span><span>{risk}%</span></div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full bg-gradient-to-r ${riskColor} transition-all duration-700`} style={{ width: `${Math.max(risk, 4)}%` }} />
        </div>
      </div>

      <div key={i} className="cs-in">
        <p className="mt-6 rounded-lg border-l-4 border-amber-300 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur">
          <span className="mr-2 text-[11px] font-bold uppercase tracking-widest text-amber-300">Incoming</span>
          {round.pressure}<span className="cs-cursor ml-1 text-amber-300">▍</span>
        </p>
        <h2 className="mt-4 text-xl font-bold text-white sm:text-3xl">{round.question}</h2>

        <div className="mt-5 space-y-3" role="group" aria-label="Choose one option">
          {options.map((o, idx) => {
            const isPick = picked === idx;
            const reveal = picked !== null;
            const style = !reveal
              ? "border-white/15 bg-white/[0.06]"
              : o.points === 3
                ? "border-emerald-400 bg-emerald-400/15 shadow-[0_0_32px_-8px_rgba(52,211,153,.7)]"
                : isPick
                  ? o.points === 1
                    ? "border-amber-400 bg-amber-400/15 shadow-[0_0_28px_-8px_rgba(251,191,36,.6)]"
                    : "cs-shake border-red-500 bg-red-500/15 shadow-[0_0_28px_-8px_rgba(239,68,68,.7)]"
                  : "border-white/10 bg-white/[0.03] opacity-60";
            return (
              <div key={o.text} className="relative">
                <button
                  type="button"
                  onClick={() => choose(idx)}
                  disabled={reveal}
                  aria-pressed={isPick}
                  className={`cs-opt flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left text-sm leading-relaxed text-slate-100 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 sm:text-base ${style}`}
                  style={!reveal ? { animation: `cs-in .55s cubic-bezier(.22,1,.36,1) ${idx * 110}ms both` } : undefined}
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-200 to-amber-500 text-sm font-black text-[#1a1405]">{"ABC"[idx]}</span>
                  <span>
                    {o.text}
                    {reveal && o.points === 3 && <span className="ml-2 inline-flex items-center gap-1 font-bold text-emerald-300"><IconCheck size={16} /> Best practice</span>}
                    {reveal && isPick && o.points === 1 && <span className="ml-2 inline-flex items-center gap-1 font-bold text-amber-300"><IconWarn size={16} /> Risky</span>}
                    {reveal && isPick && o.points === 0 && <span className="ml-2 inline-flex items-center gap-1 font-bold text-red-300"><IconCross size={16} /> Dangerous</span>}
                  </span>
                </button>
                {reveal && isPick && o.points === 3 && <Burst />}
              </div>
            );
          })}
        </div>

        {chosen && (
          <div className="cs-in mt-5" aria-live="polite">
            <p className="rounded-xl border border-white/15 bg-white/[0.07] p-4 text-sm leading-relaxed text-slate-200 backdrop-blur">
              <span className="font-bold text-white">{chosen.points === 3 ? "Good call. " : chosen.points === 1 ? "Partly right. " : "Ouch. "}</span>
              {round.why}
            </p>
            <button type="button" onClick={next} className="btn-primary mt-4">{i === ROUNDS.length - 1 ? "See my mission report" : "Next planet →"}</button>
          </div>
        )}
      </div>
    </Stage>
  );
}
