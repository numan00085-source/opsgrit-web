"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- constants ---------- */
const W = 720;
const H = 400;
const GROUND = 330;
const PX = 110; // player x
const PH = 40; // player height
const PW = 26; // player hit width
const GRAV = 1900;
const JUMP1 = 640;
const JUMP2 = 560;
const BEST_KEY = "opsgrit-runner-best";

const GROUND_LABELS = ["SPREADSHEET_v7_FINAL", "REPLY ALL", "MANUAL ENTRY", "COPY + PASTE", "STATUS UPDATE", "SIGN-OFF #4"];
const AIR_LABELS = ["SYNC MEETING", "PER MY LAST EMAIL", "URGENT FYI"];

const RANKS: [number, string][] = [
  [320, "Automation Architect"],
  [180, "Ops Lead"],
  [90, "Analyst"],
  [30, "Coordinator"],
  [0, "Intern"],
];
const rankOf = (s: number) => RANKS.find(([min]) => s >= min)![1];

/* ---------- types ---------- */
interface Obstacle { x: number; y: number; w: number; h: number; air: boolean; label: string; dead?: boolean }
interface Item { x: number; y: number; kind: "clock" | "auto"; taken?: boolean }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Popup { x: number; y: number; text: string; life: number }
interface Game {
  t: number; speed: number; dist: number; clocks: number; bonus: number;
  y: number; vy: number; jumps: number; hold: number; holding: boolean;
  obstacles: Obstacle[]; items: Item[]; parts: Particle[]; pops: Popup[];
  nextAt: number; nextAuto: number; power: number; shake: number; flash: number;
  over: boolean; step: number;
}

const newGame = (): Game => ({
  t: 0, speed: 290, dist: 0, clocks: 0, bonus: 0,
  y: GROUND, vy: 0, jumps: 0, hold: 0, holding: false,
  obstacles: [], items: [], parts: [], pops: [],
  nextAt: 900, nextAuto: 9000, power: 0, shake: 0, flash: 0, over: false, step: 0,
});

const score = (g: Game) => Math.floor(g.dist / 100) + g.clocks * 3 + g.bonus;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/* ---------- component ---------- */
export default function OpsRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const g = useRef<Game>(newGame());
  const screenRef = useRef<"ready" | "playing" | "over">("ready");
  const best = useRef(0);
  const mutedRef = useRef(false);
  const audio = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const reduce = useRef(false);

  const [screen, setScreen] = useState<"ready" | "playing" | "over">("ready");
  const [result, setResult] = useState({ score: 0, rank: "Intern", best: 0, isBest: false });
  const [muted, setMuted] = useState(false);
  const [note, setNote] = useState("");

  /* ----- sound ----- */
  const tone = useCallback((f: number, dur: number, type: OscillatorType = "square", vol = 0.05, slide = 0) => {
    if (mutedRef.current) return;
    try {
      const ctx = audio.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, ctx.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), ctx.currentTime + dur);
      gn.gain.setValueAtTime(vol, ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(gn).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {
      /* sound is optional */
    }
  }, []);

  const burst = (x: number, y: number, color: string, n = 12, sp = 220) => {
    const s = g.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = rnd(sp * 0.3, sp);
      s.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rnd(0.3, 0.7), max: 0.7, color, size: rnd(2, 4.5) });
    }
  };

  /* ----- game control ----- */
  const jump = useCallback(() => {
    const s = g.current;
    if (screenRef.current !== "playing" || s.over) return;
    if (s.y >= GROUND - 0.5 || s.jumps < 2) {
      const first = s.y >= GROUND - 0.5;
      s.vy = -(first ? JUMP1 : JUMP2);
      s.jumps = first ? 1 : 2;
      s.hold = 0.17;
      s.holding = true;
      burst(PX, s.y, first ? "#e9c46a" : "#ffffff", first ? 6 : 9, 120);
      tone(first ? 420 : 560, 0.12, "square", 0.04, 240);
    }
  }, [tone]);

  const release = useCallback(() => {
    g.current.holding = false;
  }, []);

  const start = useCallback(() => {
    try {
      if (!audio.current) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AC) audio.current = new AC();
      }
      void audio.current?.resume();
    } catch {
      /* ignore */
    }
    g.current = newGame();
    screenRef.current = "playing";
    setScreen("playing");
    setNote("");
    wrapRef.current?.focus({ preventScroll: true });
  }, []);

  const end = useCallback(() => {
    const s = g.current;
    s.over = true;
    s.shake = reduce.current ? 0 : 0.5;
    s.flash = 0.25;
    burst(PX, s.y - 20, "#ff5d73", 26, 320);
    tone(220, 0.35, "sawtooth", 0.07, -150);
    const sc = score(s);
    const isBest = sc > best.current;
    if (isBest) {
      best.current = sc;
      try {
        window.localStorage.setItem(BEST_KEY, String(sc));
      } catch {
        /* storage may be blocked */
      }
    }
    setResult({ score: sc, rank: rankOf(sc), best: best.current, isBest });
    // Let the crash play out for a moment before the result card shows.
    setTimeout(() => {
      screenRef.current = "over";
      setScreen("over");
    }, 650);
  }, [tone]);

  /* ----- spawning ----- */
  const spawn = (ctx: CanvasRenderingContext2D) => {
    const s = g.current;
    const p = s.dist / 1000;
    const air = p > 8 && Math.random() < 0.3;
    const x0 = W + 60;
    ctx.font = "700 11px ui-monospace, monospace";
    const mk = (airO: boolean, at: number): Obstacle => {
      const label = (airO ? AIR_LABELS : GROUND_LABELS)[Math.floor(Math.random() * (airO ? AIR_LABELS : GROUND_LABELS).length)];
      const w = Math.max(airO ? 96 : 60, Math.ceil(ctx.measureText(label).width) + 18);
      const h = airO ? 34 : Math.round(rnd(42, 76));
      return { x: at, w, h, y: airO ? GROUND - 54 - h : GROUND - h, air: airO, label };
    };
    const first = mk(air, x0);
    s.obstacles.push(first);
    let span = first.w;
    if (!air && p > 20 && Math.random() < 0.3) {
      const second = mk(false, x0 + first.w + 72);
      s.obstacles.push(second);
      span = first.w + 72 + second.w;
    }
    // Rewards: clocks over a ground obstacle, or along the ground under an air one.
    if (Math.random() < 0.75) {
      const n = air ? 4 : 5;
      for (let i = 0; i < n; i++) {
        const cx = x0 + (span / (n + 1)) * (i + 1) + (air ? 40 : 0);
        const cy = air ? GROUND - 20 : GROUND - first.h - 48 - Math.sin((i / (n - 1)) * Math.PI) * 34;
        s.items.push({ x: cx, y: cy, kind: "clock" });
      }
    }
    if (s.dist > s.nextAuto) {
      s.items.push({ x: x0 + span + 120, y: GROUND - 64, kind: "auto" });
      s.nextAuto = s.dist + rnd(9000, 14000);
    }
    s.nextAt = s.dist + span + s.speed * rnd(0.8, 1.55) + 120;
  };

  /* ----- update ----- */
  const update = (dt: number, ctx: CanvasRenderingContext2D) => {
    const s = g.current;
    s.t += dt;
    if (s.over) {
      s.shake = Math.max(0, s.shake - dt);
      s.flash = Math.max(0, s.flash - dt);
      s.parts.forEach((q) => {
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.vy += 700 * dt;
        q.life -= dt;
      });
      s.parts = s.parts.filter((q) => q.life > 0);
      return;
    }
    if (screenRef.current !== "playing") return;

    s.speed = 290 + Math.min(330, s.dist * 0.0073);
    const mul = s.power > 0 ? 1.25 : 1;
    const dx = s.speed * mul * dt;
    s.dist += dx;
    s.step += dx;
    if (s.power > 0) s.power = Math.max(0, s.power - dt);

    // player physics
    const gravity = s.vy < 0 && s.holding && s.hold > 0 ? GRAV * 0.42 : GRAV;
    if (s.hold > 0) s.hold -= dt;
    s.vy += gravity * dt;
    s.y += s.vy * dt;
    if (s.y >= GROUND) {
      if (s.jumps > 0 && s.vy > 120) burst(PX, GROUND, "#e9c46a", 5, 100);
      s.y = GROUND;
      s.vy = 0;
      s.jumps = 0;
    }

    if (s.dist >= s.nextAt) spawn(ctx);

    for (const o of s.obstacles) o.x -= dx;
    for (const i of s.items) i.x -= dx;
    s.obstacles = s.obstacles.filter((o) => o.x + o.w > -40 && !o.dead);
    s.items = s.items.filter((i) => i.x > -40 && !i.taken);

    // collisions
    const px0 = PX - PW / 2;
    const px1 = PX + PW / 2;
    const py0 = s.y - PH + 3;
    const py1 = s.y;
    for (const o of s.obstacles) {
      const hit = px1 > o.x + 3 && px0 < o.x + o.w - 3 && py1 > o.y + 3 && py0 < o.y + o.h - 3;
      if (!hit) continue;
      if (s.power > 0) {
        o.dead = true;
        s.bonus += 2;
        burst(o.x + o.w / 2, o.y + o.h / 2, "#ff5d73", 16, 260);
        s.pops.push({ x: o.x + o.w / 2, y: o.y, text: "+2", life: 0.8 });
        tone(300, 0.1, "square", 0.04, 300);
      } else {
        end();
        return;
      }
    }
    for (const i of s.items) {
      const cx = PX;
      const cy = s.y - PH / 2;
      if (Math.hypot(i.x - cx, i.y - cy) < (i.kind === "auto" ? 30 : 24)) {
        i.taken = true;
        if (i.kind === "clock") {
          s.clocks += 1;
          burst(i.x, i.y, "#e9c46a", 6, 140);
          s.pops.push({ x: i.x, y: i.y - 10, text: "+3", life: 0.7 });
          tone(740 + Math.min(s.clocks, 12) * 25, 0.09, "triangle", 0.05);
        } else {
          s.power = 5;
          burst(i.x, i.y, "#52e0a1", 22, 300);
          s.pops.push({ x: i.x, y: i.y - 14, text: "AUTOPILOT!", life: 1.1 });
          tone(330, 0.3, "sawtooth", 0.05, 500);
        }
      }
    }

    // trail while powered
    if (s.power > 0 && Math.random() < 0.8) s.parts.push({ x: PX - 12, y: s.y - rnd(6, PH - 6), vx: -rnd(80, 200), vy: rnd(-30, 30), life: 0.35, max: 0.35, color: "#52e0a1", size: rnd(2, 4) });

    s.parts.forEach((q) => {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.vy += 500 * dt;
      q.life -= dt;
    });
    s.parts = s.parts.filter((q) => q.life > 0);
    s.pops.forEach((q) => {
      q.y -= 40 * dt;
      q.life -= dt;
    });
    s.pops = s.pops.filter((q) => q.life > 0);
    s.shake = Math.max(0, s.shake - dt);
  };

  /* ----- draw ----- */
  const draw = (ctx: CanvasRenderingContext2D) => {
    const s = g.current;
    ctx.save();
    if (s.shake > 0) ctx.translate(rnd(-1, 1) * s.shake * 14, rnd(-1, 1) * s.shake * 14);

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#080b16");
    sky.addColorStop(1, "#1a1f3a");
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // stars
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 38; i++) {
      const x = ((i * 197 - s.dist * 0.04) % (W + 20) + (W + 20)) % (W + 20);
      const y = (i * 53) % (GROUND - 90);
      ctx.fillRect(x, y, i % 5 === 0 ? 2 : 1.2, i % 5 === 0 ? 2 : 1.2);
    }
    // far skyline
    ctx.fillStyle = "#11162b";
    for (let i = 0; i < 14; i++) {
      const bw = 46 + ((i * 29) % 40);
      const bh = 70 + ((i * 61) % 110);
      const x = (((i * 92 - s.dist * 0.1) % (W + 140)) + (W + 140)) % (W + 140) - 70;
      ctx.fillRect(x, GROUND - bh, bw, bh);
    }
    // near skyline with lit windows
    for (let i = 0; i < 9; i++) {
      const bw = 70 + ((i * 37) % 50);
      const bh = 40 + ((i * 47) % 70);
      const x = (((i * 140 - s.dist * 0.22) % (W + 200)) + (W + 200)) % (W + 200) - 100;
      ctx.fillStyle = "#171d38";
      ctx.fillRect(x, GROUND - bh, bw, bh);
      ctx.fillStyle = "rgba(233,196,106,0.35)";
      for (let wy = GROUND - bh + 8; wy < GROUND - 8; wy += 14) for (let wx = x + 8; wx < x + bw - 10; wx += 16) if (((wx + wy) | 0) % 3 === 0) ctx.fillRect(wx, wy, 6, 6);
    }

    // ground
    ctx.fillStyle = "#0d1126";
    ctx.fillRect(0, GROUND, W, H - GROUND);
    ctx.fillStyle = s.power > 0 ? "#52e0a1" : "#e9c46a";
    ctx.fillRect(0, GROUND, W, 3);
    ctx.strokeStyle = "rgba(233,196,106,0.18)";
    ctx.lineWidth = 1;
    const off = s.step % 48;
    for (let x = -off; x < W; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND + 3);
      ctx.lineTo(x - 30, H);
      ctx.stroke();
    }

    // items
    for (const i of s.items) {
      const bob = Math.sin(s.t * 6 + i.x * 0.05) * 3;
      if (i.kind === "clock") {
        ctx.fillStyle = "#e9c46a";
        ctx.beginPath();
        ctx.arc(i.x, i.y + bob, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#7a5b10";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i.x, i.y + bob - 6);
        ctx.lineTo(i.x, i.y + bob);
        ctx.lineTo(i.x + 5, i.y + bob + 3);
        ctx.stroke();
      } else {
        ctx.save();
        ctx.shadowColor = "#52e0a1";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#52e0a1";
        ctx.beginPath();
        ctx.arc(i.x, i.y + bob, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#06281a";
        ctx.font = "800 10px ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText("AUTO", i.x, i.y + bob + 4);
      }
    }

    // obstacles
    for (const o of s.obstacles) {
      ctx.fillStyle = o.air ? "#2a1a4a" : "#3a1220";
      ctx.strokeStyle = o.air ? "#a78bfa" : "#ff5d73";
      ctx.lineWidth = 2;
      roundRect(ctx, o.x, o.y, o.w, o.h, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f8e8ec";
      ctx.font = "700 11px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h / 2 + 4);
    }

    // player
    drawBot(ctx, s);

    // particles and popups
    for (const q of s.parts) {
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.color;
      ctx.fillRect(q.x, q.y, q.size, q.size);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    for (const q of s.pops) {
      ctx.globalAlpha = Math.min(1, q.life * 2);
      ctx.fillStyle = q.text === "AUTOPILOT!" ? "#52e0a1" : "#f5d98a";
      ctx.font = "800 14px ui-monospace, monospace";
      ctx.fillText(q.text, q.x, q.y);
    }
    ctx.globalAlpha = 1;

    // HUD
    ctx.textAlign = "left";
    ctx.fillStyle = "#f5d98a";
    ctx.font = "800 22px ui-monospace, monospace";
    ctx.fillText(String(score(s)), 18, 34);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "600 11px ui-monospace, monospace";
    ctx.fillText("HOURS SAVED", 18, 50);
    ctx.textAlign = "right";
    ctx.fillText(`BEST ${best.current}`, W - 18, 34);
    if (s.power > 0) {
      ctx.fillStyle = "rgba(82,224,161,0.25)";
      ctx.fillRect(W - 138, 44, 120, 8);
      ctx.fillStyle = "#52e0a1";
      ctx.fillRect(W - 138, 44, 120 * (s.power / 5), 8);
    }

    if (s.flash > 0) {
      ctx.fillStyle = `rgba(255,93,115,${s.flash * 1.2})`;
      ctx.fillRect(-20, -20, W + 40, H + 40);
    }
    ctx.restore();
  };

  const drawBot = (ctx: CanvasRenderingContext2D, s: Game) => {
    const air = s.y < GROUND - 1;
    const x = PX;
    const y = s.y;
    const run = Math.floor(s.step / 22) % 2;
    ctx.save();
    if (s.power > 0) {
      ctx.shadowColor = "#52e0a1";
      ctx.shadowBlur = 22;
    }
    // legs
    ctx.fillStyle = "#c9a24a";
    if (air) {
      ctx.fillRect(x - 9, y - 8, 6, 8);
      ctx.fillRect(x + 3, y - 8, 6, 8);
    } else {
      ctx.fillRect(x - 9, y - (run ? 8 : 5), 6, run ? 8 : 5);
      ctx.fillRect(x + 3, y - (run ? 5 : 8), 6, run ? 5 : 8);
    }
    // body
    ctx.fillStyle = s.power > 0 ? "#bff5da" : "#f5d98a";
    roundRect(ctx, x - 13, y - PH, 26, 30, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    // visor
    ctx.fillStyle = "#0b1020";
    roundRect(ctx, x - 9, y - PH + 6, 18, 11, 4);
    ctx.fill();
    ctx.fillStyle = s.over ? "#ff5d73" : "#7ce8ff";
    ctx.fillRect(x - 1, y - PH + 9, 6, 4);
    // antenna
    ctx.strokeStyle = "#c9a24a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - PH);
    ctx.lineTo(x - 2, y - PH - 8);
    ctx.stroke();
    ctx.fillStyle = Math.floor(s.t * 4) % 2 ? "#ff5d73" : "#f5d98a";
    ctx.beginPath();
    ctx.arc(x - 2, y - PH - 9, 3, 0, Math.PI * 2);
    ctx.fill();
    // jet flame while holding in the air
    if (air && s.holding && s.hold > 0) {
      ctx.fillStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 10);
      ctx.lineTo(x - 14 - rnd(0, 8), y - 4);
      ctx.lineTo(x - 4, y - 8);
      ctx.fill();
    }
    ctx.restore();
  };

  /* ----- main loop and setup ----- */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    try {
      reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      best.current = Number(window.localStorage.getItem(BEST_KEY)) || 0;
      mutedRef.current = window.localStorage.getItem("opsgrit-runner-muted") === "1";
      setMuted(mutedRef.current);
    } catch {
      /* ignore */
    }
    setResult((r) => ({ ...r, best: best.current }));

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (screenRef.current === "ready") g.current.t += dt;
      update(dt, ctx);
      draw(ctx);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        if (screenRef.current === "playing") {
          e.preventDefault();
          if (!e.repeat) jump();
        } else if (screenRef.current === "ready" && document.activeElement === wrapRef.current) {
          e.preventDefault();
          start();
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") release();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    try {
      window.localStorage.setItem("opsgrit-runner-muted", mutedRef.current ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    const text = `I saved ${result.score} hours in Ops Runner and ranked ${result.rank}. Beat me:`;
    const url = typeof window !== "undefined" ? window.location.origin + "/tools/ops-runner" : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ops Runner", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setNote("Copied. Paste it anywhere.");
    } catch {
      setNote("Sharing is blocked in this browser.");
    }
    setTimeout(() => setNote(""), 2400);
  };

  return (
    <div className="mt-8">
      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-label="Ops Runner game. Press space, up arrow or tap to jump."
        className="relative mx-auto w-full max-w-4xl select-none overflow-hidden rounded-2xl border border-gold-500/40 bg-night-950 shadow-[0_20px_60px_-20px_rgba(233,196,106,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button,a")) return;
          if (screenRef.current === "playing") jump();
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
      >
        <canvas ref={canvasRef} className="block h-auto w-full" style={{ aspectRatio: `${W} / ${H}` }} />

        <button
          type="button"
          onClick={toggleMute}
          className="absolute bottom-2 right-2 rounded-md bg-black/40 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-black/60"
          aria-pressed={muted}
        >
          Sound {muted ? "off" : "on"}
        </button>

        {screen === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-night-950/70 px-4 text-center backdrop-blur-[2px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Free arcade game</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">Ops Runner</h2>
            <p className="mt-2 max-w-md text-sm text-slate-300 sm:text-base">
              Jump the busywork. Grab the clocks. Hit AUTO to smash through everything.
            </p>
            <button type="button" onClick={start} className="btn-primary mt-5 px-8 py-3 text-base">Play</button>
            <p className="mt-3 text-xs text-slate-400">Tap, click or press Space. Hold for a higher jump. Tap again in the air to double jump.</p>
            {result.best > 0 && <p className="mt-1 text-xs font-semibold text-gold-300">Your best: {result.best}</p>}
          </div>
        )}

        {screen === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-night-950/80 px-4 text-center backdrop-blur-[2px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">Busywork wins this round</p>
            <p className="mt-2 text-6xl font-extrabold text-white">{result.score}</p>
            <p className="text-sm text-slate-300">hours saved</p>
            <p className="mt-3 text-xl font-bold text-gold-300">{result.rank}</p>
            <p className="mt-1 text-xs text-slate-400">{result.isBest ? "New personal best!" : `Best: ${result.best}`}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={start} className="btn-primary px-7">Play again</button>
              <button type="button" onClick={share} className="btn-ghost !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">Share score</button>
            </div>
            <p className="mt-2 h-4 text-xs text-slate-300" role="status" aria-live="polite">{note}</p>
          </div>
        )}
      </div>

      <div className="mx-auto mt-5 grid max-w-4xl gap-3 text-sm text-ink-600 sm:grid-cols-3">
        <p><strong className="text-ink-900">Controls.</strong> Tap, click or press Space, Up or W. Hold for height. Jump again in mid-air.</p>
        <p><strong className="text-ink-900">Ranks.</strong> Intern, Coordinator, Analyst, Ops Lead, then Automation Architect.</p>
        <p>
          <strong className="text-ink-900">Real hours.</strong> Curious what a real automation could save you? Try the{" "}
          <Link className="underline underline-offset-2" href="/tools/roi-calculator">ROI calculator</Link>.
        </p>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
