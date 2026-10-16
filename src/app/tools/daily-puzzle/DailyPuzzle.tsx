"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconCheck, IconCross, IconPlanet, IconPuzzle, IconRocket, IconWarn, Pip } from "@/components/icons/OpsIcons";
import { Burst, Confetti, Eyebrow, Stage, shuffle, useCount } from "../cutover-simulator/CutoverSimulator";

type Tier = "best" | "risky" | "bad";
interface P {
  id: string;
  slug: string;
  article: string;
  scenario: string;
  question: string;
  options: { text: string; tier: Tier }[];
  why: string;
}
type Mode = "daily" | "latest" | "more";
const PTS: Record<Tier, 0 | 1 | 3> = { best: 3, risky: 1, bad: 0 };

function seededPick(pool: P[], n: number, seed: number): P[] {
  return shuffle(pool, seed + 7).slice(0, n);
}

export default function DailyPuzzle({ date, daily, latest, pool }: { date: string; daily: P[]; latest: { title: string; slug: string; puzzles: P[] } | null; pool: P[] }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [round, setRound] = useState(0); // bumps on every "play more"
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState<"good" | "bad" | null>(null);

  const set: P[] = useMemo(() => {
    if (mode === "daily") return daily;
    if (mode === "latest") return latest?.puzzles ?? [];
    if (mode === "more") return seededPick(pool, 5, round * 13 + 1);
    return [];
  }, [mode, daily, latest, pool, round]);

  const done = set.length > 0 && results.length === set.length;
  const puzzle = set[Math.min(i, Math.max(set.length - 1, 0))];
  const options = useMemo(() => (puzzle ? shuffle(puzzle.options, round * 31 + i + 3) : []), [puzzle, round, i]);
  const max = set.length * 3;
  const score = results.reduce((a, b) => a + b, 0);
  const shown = useCount(score, done);

  const start = (m: Mode) => {
    setMode(m);
    setI(0);
    setPicked(null);
    setResults([]);
    setCopied(false);
    setFlash(null);
  };
  const choose = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const t = options[idx].tier;
    setFlash(t === "best" ? "good" : t === "bad" ? "bad" : null);
  };
  const next = () => {
    if (picked === null) return;
    setResults((r) => [...r, PTS[options[picked].tier]]);
    setPicked(null);
    setFlash(null);
    if (i < set.length - 1) setI(i + 1);
  };
  const more = () => {
    setRound((r) => r + 1);
    start("more");
  };

  const label = mode === "daily" ? `Daily puzzle ${date}` : mode === "latest" ? "Latest article" : "Practice set";
  const shareText = () =>
    `I scored ${score}/${max} on the OpsGrit ${label}. ${results.filter((r) => r === 3).length} best-practice, ${results.filter((r) => r === 1).length} risky, ${results.filter((r) => r === 0).length} dangerous.\nTry it: https://www.getopsgrit.com/tools/daily-puzzle`;
  const share = async () => {
    const text = shareText();
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* fall through */
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
  const card = "cs-opt group flex w-full items-start gap-4 rounded-2xl border-2 border-white/15 bg-white/[0.06] p-5 text-left text-slate-100 backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300";

  if (!mode) {
    return (
      <Stage>
        <div className="cs-in mx-auto max-w-2xl py-4 text-center sm:py-8">
          <Eyebrow>{date}</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Pick your mission</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">{pool.length} puzzles from our articles. Each one has a best answer, a risky shortcut and a dangerous one.</p>
          <div className="mt-7 space-y-3 text-left">
            <button type="button" onClick={() => start("daily")} className={card}>
              <IconPuzzle size={30} />
              <span><span className="block text-lg font-bold text-white">Today&rsquo;s puzzle</span><span className="text-sm text-slate-300">Three scenarios, the same for everyone today. About a minute.</span></span>
            </button>
            {latest && (
              <button type="button" onClick={() => start("latest")} className={card}>
                <IconRocket size={30} />
                <span><span className="block text-lg font-bold text-white">Latest article</span><span className="text-sm text-slate-300">{latest.puzzles.length} scenarios from &ldquo;{latest.title}&rdquo;.</span></span>
              </button>
            )}
            <button type="button" onClick={more} className={card}>
              <IconPlanet size={30} />
              <span><span className="block text-lg font-bold text-white">Random practice</span><span className="text-sm text-slate-300">Five scenarios picked from the whole bank. Play as often as you like.</span></span>
            </button>
          </div>
        </div>
      </Stage>
    );
  }

  if (done) {
    const perfect = score === max;
    return (
      <Stage shake={score === 0}>
        {perfect && <Confetti />}
        <div className="cs-in" aria-live="polite">
          <Eyebrow>{label}</Eyebrow>
          <h2 className={`mt-2 text-3xl font-extrabold sm:text-5xl ${perfect ? "text-emerald-300" : score >= max * 0.6 ? "text-amber-300" : "text-orange-300"}`}>
            {perfect ? "Flawless run" : score >= max * 0.6 ? "Solid instincts" : "Room to grow"}
          </h2>
          <p className="mt-3 text-5xl font-black tabular-nums text-white sm:text-6xl">{shown}<span className="text-2xl font-bold text-slate-400"> / {max}</span></p>
          <div className="mt-5 flex gap-1.5" aria-label="Your results">{results.map((p, k) => <Pip key={k} p={p} size={28} />)}</div>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {results.map((p, idx) => (
              <li key={idx} className="cs-in rounded-xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur" style={{ animationDelay: `${idx * 90}ms` }}>
                <span className="flex items-start gap-2 font-semibold text-white"><Pip p={p} size={20} /><span>{set[idx].question}</span></span>
                {p < 3 && <p className="mt-1 pl-7 leading-relaxed text-slate-300">{set[idx].why}</p>}
                <Link href={`/blog/${set[idx].slug}`} className="mt-2 block pl-7 text-xs text-gold-300 underline underline-offset-2 hover:text-gold-200">From: {set[idx].article}</Link>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={share} className="btn-primary">{copied ? "Copied" : "Share my score"}</button>
            <button type="button" onClick={more} className={glassBtn}>Play more</button>
            <button type="button" onClick={() => setMode(null)} className={glassBtn}>Back to menu</button>
          </div>
        </div>
      </Stage>
    );
  }

  const chosen = picked !== null ? options[picked] : null;
  return (
    <Stage shake={chosen?.tier === "bad"} flash={flash} flashKey={i}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>{label} · {i + 1} of {set.length}</Eyebrow>
        <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-bold tabular-nums text-amber-200">Score {score}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`Puzzle ${i + 1} of ${set.length}`}>
        <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700" style={{ width: `${((i + (chosen ? 1 : 0)) / set.length) * 100}%` }} />
      </div>
      <div key={`${round}-${i}`} className="cs-in">
        <p className="mt-6 rounded-lg border-l-4 border-amber-300 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur">
          <span className="mr-2 text-[11px] font-bold uppercase tracking-widest text-amber-300">Scenario</span>
          {puzzle.scenario}
        </p>
        <h2 className="mt-4 text-xl font-bold text-white sm:text-3xl">{puzzle.question}</h2>
        <div className="mt-5 space-y-3" role="group" aria-label="Choose one option">
          {options.map((o, idx) => {
            const isPick = picked === idx;
            const reveal = picked !== null;
            const style = !reveal
              ? "border-white/15 bg-white/[0.06]"
              : o.tier === "best"
                ? "border-emerald-400 bg-emerald-400/15 shadow-[0_0_32px_-8px_rgba(52,211,153,.7)]"
                : isPick
                  ? o.tier === "risky"
                    ? "border-amber-400 bg-amber-400/15"
                    : "cs-shake border-red-500 bg-red-500/15"
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
                    {reveal && o.tier === "best" && <span className="ml-2 inline-flex items-center gap-1 font-bold text-emerald-300"><IconCheck size={16} /> Best practice</span>}
                    {reveal && isPick && o.tier === "risky" && <span className="ml-2 inline-flex items-center gap-1 font-bold text-amber-300"><IconWarn size={16} /> Risky</span>}
                    {reveal && isPick && o.tier === "bad" && <span className="ml-2 inline-flex items-center gap-1 font-bold text-red-300"><IconCross size={16} /> Dangerous</span>}
                  </span>
                </button>
                {reveal && isPick && o.tier === "best" && <Burst />}
              </div>
            );
          })}
        </div>
        {chosen && (
          <div className="cs-in mt-5" aria-live="polite">
            <p className="rounded-xl border border-white/15 bg-white/[0.07] p-4 text-sm leading-relaxed text-slate-200 backdrop-blur">
              <span className="font-bold text-white">{chosen.tier === "best" ? "Good call. " : chosen.tier === "risky" ? "Partly right. " : "Ouch. "}</span>
              {puzzle.why}
            </p>
            <button type="button" onClick={next} className="btn-primary mt-4">{i === set.length - 1 ? "See my score" : "Next puzzle →"}</button>
          </div>
        )}
      </div>
    </Stage>
  );
}
