"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIdleEffect } from "@/lib/useIdleEffect";

/**
 * The homepage hero: a night sky with a living "operations constellation".
 * Gold nodes are real operations ideas. Data pulses travel between them, thin orbits carry small satellites,
 * a planet glows at the corner and a comet crosses now and then. A "More you know" card rotates through a
 * short, true tip for each idea and links to the matching guide. Hover or tap a node to read its tip.
 *
 * Built for reading: nothing bright sits behind the headline, the canvas is decorative (aria-hidden), it
 * pauses when off screen or in a background tab, and with "reduce motion" it draws one still frame.
 */

type Tip = { key: string; label: string; tip: string; href: string; cta: string };

const TIPS: Tip[] = [
  { key: "build", label: "Build vs buy", tip: "Build only what gives you an edge. Plumbing that every company needs is almost always cheaper to buy than to maintain.", href: "/blog/build-vs-buy-operations-software", cta: "Read the decision guide" },
  { key: "sop", label: "SOP", tip: "A procedure nobody owns goes stale. The fix is boring: one named owner and a review date on every page.", href: "/blog/how-to-write-an-sop-people-follow", cta: "How to write an SOP people follow" },
  { key: "webhook", label: "Webhook", tip: "A webhook pushes data the moment something happens. Polling keeps asking, “anything new yet?”.", href: "/blog/webhooks-apis-ipaas-integration-patterns", cta: "Webhooks, APIs and iPaaS" },
  { key: "runbook", label: "Runbook", tip: "Write the runbook for the person on call at 3 a.m., not for the person who wrote it.", href: "/blog/operational-incident-response-runbook", cta: "Incident response runbook" },
  { key: "roi", label: "ROI", tip: "Count review time and upkeep, not only hours saved. Every automation has a running cost.", href: "/tools/roi-calculator", cta: "Try the ROI calculator" },
  { key: "stack", label: "Stack audit", tip: "A simple inventory of your tools often turns up overlap you did not know you were paying for.", href: "/blog/operations-tech-stack-audit", cta: "Audit your stack" },
  { key: "approval", label: "Human in the loop", tip: "Let the AI draft and a person approve, at the steps where a mistake costs real money.", href: "/blog/human-in-the-loop-ai-approvals", cta: "Design approvals that work" },
  { key: "prompt", label: "Prompt injection", tip: "Text an AI reads can carry hidden instructions. Treat outside content as untrusted input.", href: "/blog/securing-ai-workflows-prompt-injection-operations", cta: "Secure your AI workflows" },
  { key: "system", label: "System of record", tip: "Pick one source of truth for each kind of data. Two “sources of truth” really means none.", href: "/blog/system-of-record-source-of-truth", cta: "Choose a system of record" },
  { key: "handoff", label: "Handoffs", tip: "Most operations delays hide in the handoffs between people, not inside the tasks themselves.", href: "/blog/what-to-automate-first-process-prioritization", cta: "What to automate first" },
];

// Node positions as fractions of the hero, for wide and narrow screens. The middle stays clear for the headline.
const POS_WIDE: [number, number][] = [
  [0.27, 0.08], [0.1, 0.27], [0.14, 0.5], [0.09, 0.72], [0.23, 0.88],
  [0.73, 0.08], [0.91, 0.18], [0.86, 0.5], [0.91, 0.68], [0.77, 0.88],
];
const POS_NARROW: [number, number][] = [
  [0.3, 0.05], [0.08, 0.2], [0.92, 0.3], [0.07, 0.5], [0.15, 0.93],
  [0.7, 0.05], [0.93, 0.18], [0.1, 0.34], [0.93, 0.56], [0.85, 0.94],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [1, 3], [5, 6], [6, 7], [7, 8], [8, 9], [6, 8], [4, 9],
];

export default function HeroScene({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const holdUntil = useRef(0);
  const reducedRef = useRef(false);

  const choose = useCallback((i: number, hold = true) => {
    activeRef.current = i;
    setActive(i);
    if (hold) holdUntil.current = performance.now() + 14000;
  }, []);

  // Rotate the tip card on its own until the visitor interacts.
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) return;
    const id = setInterval(() => {
      if (performance.now() < holdUntil.current) return;
      choose((activeRef.current + 1) % TIPS.length, false);
    }, 6500);
    return () => clearInterval(id);
  }, [choose]);

  useIdleEffect(() => {
    const cv = canvas.current;
    const host = wrap.current;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, narrow = false;
    let raf = 0, running = false, last = 0, t = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    let hoverNode = -1;

    type Star = { x: number; y: number; z: number; r: number; ph: number; sp: number; warm: boolean };
    type Pulse = { e: number; p: number; v: number; rev: boolean };
    type Shot = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    let stars: Star[] = [];
    let pulses: Pulse[] = [];
    let shot: Shot | null = null;
    let nextShot = 4 + Math.random() * 4;
    let nextPulse = 0.4;
    const phases = TIPS.map(() => Math.random() * Math.PI * 2);
    const nodeXY: { x: number; y: number }[] = TIPS.map(() => ({ x: 0, y: 0 }));

    // One soft glow sprite, reused everywhere, so glows stay cheap.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 96;
    {
      const g = glow.getContext("2d")!;
      const grd = g.createRadialGradient(48, 48, 0, 48, 48, 48);
      grd.addColorStop(0, "rgba(255,236,170,0.95)");
      grd.addColorStop(0.2, "rgba(236,196,92,0.4)");
      grd.addColorStop(1, "rgba(212,175,79,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 96, 96);
    }

    function seed() {
      const n = Math.max(110, Math.min(300, Math.round((w * h) / 5200)));
      stars = Array.from({ length: n }, () => {
        const l = Math.random();
        const z = l < 0.55 ? 0.3 : l < 0.88 ? 0.6 : 1;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: (0.35 + Math.random() * 0.75) * (0.6 + z * 0.9),
          ph: Math.random() * Math.PI * 2,
          sp: 0.5 + Math.random() * 1.6,
          warm: Math.random() < 0.3,
        };
      });
    }

    function resize() {
      const rect = cv!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      narrow = w < 720;
      cv!.width = Math.round(w * dpr);
      cv!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0);
    }

    const ease = (x: number) => x * x * (3 - 2 * x);

    function layoutNodes() {
      const pos = narrow ? POS_NARROW : POS_WIDE;
      pos.forEach(([fx, fy], i) => {
        const d = 0.55 + (i % 3) * 0.2;
        nodeXY[i].x = fx * w + Math.sin(t * 0.35 + phases[i]) * 7 + pointer.x * 16 * d;
        nodeXY[i].y = fy * h + Math.cos(t * 0.3 + phases[i] * 1.3) * 6 + pointer.y * 10 * d;
      });
    }

    function planet() {
      const R = narrow ? Math.min(w * 0.42, h * 0.3) : Math.min(w * 0.19, h * 0.4);
      const cx = narrow ? w * 1.0 : w * 0.97 + pointer.x * 8;
      const cy = narrow ? h * 1.04 : h * 1.06 + pointer.y * 5;
      // atmosphere
      let g = ctx!.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.6);
      g.addColorStop(0, "rgba(212,175,79,0.20)");
      g.addColorStop(1, "rgba(212,175,79,0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx!.fill();
      // body, lit from the upper left
      g = ctx!.createRadialGradient(cx - R * 0.45, cy - R * 0.5, R * 0.05, cx, cy, R);
      g.addColorStop(0, "rgba(150,118,52,0.75)");
      g.addColorStop(0.45, "rgba(46,40,30,0.95)");
      g.addColorStop(1, "rgba(11,15,23,1)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.fill();
      // faint bands that slowly slide
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.clip();
      for (let i = 0; i < 4; i++) {
        const by = cy - R * 0.7 + i * R * 0.32 + Math.sin(t * 0.15 + i) * 3;
        ctx!.fillStyle = `rgba(212,175,79,${0.035 + i * 0.006})`;
        ctx!.fillRect(cx - R, by, R * 2, R * 0.1);
      }
      ctx!.restore();
      // rim light
      ctx!.strokeStyle = "rgba(240,208,120,0.42)";
      ctx!.lineWidth = 1.4;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, Math.PI * 1.05, Math.PI * 1.62);
      ctx!.stroke();
      // a thin ring around it
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(-0.28);
      ctx!.strokeStyle = "rgba(230,200,115,0.22)";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.ellipse(0, 0, R * 1.5, R * 0.34, 0, Math.PI * 1.02, Math.PI * 1.98);
      ctx!.stroke();
      ctx!.restore();
    }

    function orbits() {
      const cx = w * 0.5 + pointer.x * 6;
      const cy = h * 0.5 + pointer.y * 4;
      for (let k = 0; k < 3; k++) {
        const rx = w * (narrow ? 0.62 + k * 0.16 : 0.34 + k * 0.1);
        const ry = rx * (0.3 + k * 0.03);
        const rot = -0.16 + k * 0.1;
        ctx!.save();
        ctx!.translate(cx, cy);
        ctx!.rotate(rot);
        ctx!.strokeStyle = `rgba(222,190,100,${0.1 - k * 0.025})`;
        ctx!.lineWidth = 1;
        ctx!.setLineDash(k === 1 ? [2, 9] : []);
        ctx!.beginPath();
        ctx!.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.setLineDash([]);
        const ang = t * (0.14 - k * 0.035) + k * 2.1;
        const sx = Math.cos(ang) * rx;
        const sy = Math.sin(ang) * ry;
        const gs = 20 - k * 3;
        ctx!.globalAlpha = 0.85;
        ctx!.drawImage(glow, sx - gs / 2, sy - gs / 2, gs, gs);
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = "rgba(255,240,190,0.95)";
        ctx!.beginPath();
        ctx!.arc(sx, sy, 1.8, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    function constellation(dt: number) {
      layoutNodes();
      const act = activeRef.current;
      const scale = narrow ? 0.6 : 1;

      // links
      EDGES.forEach(([a, b]) => {
        const hot = a === act || b === act;
        ctx!.strokeStyle = `rgba(228,196,108,${(hot ? 0.5 : 0.16) * scale + (hot ? 0.1 : 0)})`;
        ctx!.lineWidth = hot ? 1.2 : 0.8;
        ctx!.beginPath();
        ctx!.moveTo(nodeXY[a].x, nodeXY[a].y);
        ctx!.lineTo(nodeXY[b].x, nodeXY[b].y);
        ctx!.stroke();
      });

      // pulses of light travelling along links
      if (dt && !reduce) {
        nextPulse -= dt;
        if (nextPulse <= 0 && pulses.length < 7) {
          pulses.push({ e: Math.floor(Math.random() * EDGES.length), p: 0, v: 0.28 + Math.random() * 0.22, rev: Math.random() < 0.5 });
          nextPulse = 0.5 + Math.random() * 0.7;
        }
        pulses.forEach((p) => (p.p += p.v * dt));
        pulses = pulses.filter((p) => p.p < 1);
      }
      pulses.forEach((p) => {
        const [a, b] = EDGES[p.e];
        const s = nodeXY[p.rev ? b : a];
        const e = nodeXY[p.rev ? a : b];
        const k = ease(p.p);
        const x = s.x + (e.x - s.x) * k;
        const y = s.y + (e.y - s.y) * k;
        const gs = 20 * scale + 6;
        ctx!.globalAlpha = Math.sin(Math.PI * p.p) * 0.95;
        ctx!.drawImage(glow, x - gs / 2, y - gs / 2, gs, gs);
        ctx!.globalAlpha = 1;
      });

      // nodes
      TIPS.forEach((tp, i) => {
        const { x, y } = nodeXY[i];
        const isAct = i === act;
        const breathe = 0.75 + 0.25 * Math.sin(t * 1.4 + phases[i]);
        const gs = (isAct ? 54 : 30) * scale + 8;
        ctx!.globalAlpha = (isAct ? 0.95 : 0.55 * breathe) * (narrow && !isAct ? 0.8 : 1);
        ctx!.drawImage(glow, x - gs / 2, y - gs / 2, gs, gs);
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = isAct ? "rgba(255,244,205,1)" : "rgba(244,220,150,0.95)";
        ctx!.beginPath();
        ctx!.arc(x, y, (isAct ? 4.4 : 3) * (narrow ? 0.85 : 1), 0, Math.PI * 2);
        ctx!.fill();
        if (isAct) {
          const ph = (t * 0.9) % 1;
          ctx!.strokeStyle = `rgba(240,208,120,${0.55 * (1 - ph)})`;
          ctx!.lineWidth = 1.2;
          ctx!.beginPath();
          ctx!.arc(x, y, 7 + ph * 18, 0, Math.PI * 2);
          ctx!.stroke();
        }
        if (!narrow) {
          ctx!.font = `${isAct ? 700 : 600} ${isAct ? 12 : 11}px ui-sans-serif, system-ui, sans-serif`;
          ctx!.textBaseline = "middle";
          const left = x < w * 0.5;
          ctx!.textAlign = left ? "left" : "right";
          ctx!.fillStyle = isAct ? "rgba(255,240,196,1)" : "rgba(226,214,184,0.62)";
          ctx!.fillText(tp.label.toUpperCase(), x + (left ? 12 : -12), y + 0.5);
        }
      });
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, w, h);

      // stars, three depths, parallax with the pointer
      for (const s of stars) {
        if (dt && !reduce) {
          s.x -= 4 * s.z * dt;
          s.y += 1.6 * s.z * dt;
          if (s.x < -4) s.x = w + 4;
          if (s.y > h + 4) s.y = -4;
        }
        const tw = reduce ? 0.8 : 0.6 + 0.4 * Math.sin(t * s.sp + s.ph);
        const a = (0.35 + 0.6 * s.z) * tw;
        const px = s.x + pointer.x * 14 * s.z;
        const py = s.y + pointer.y * 9 * s.z;
        if (s.z === 1 && s.r > 1) {
          const gs = s.r * 10;
          ctx!.globalAlpha = a * 0.5;
          ctx!.drawImage(glow, px - gs / 2, py - gs / 2, gs, gs);
          ctx!.globalAlpha = 1;
        }
        ctx!.fillStyle = s.warm ? `rgba(255,238,200,${a.toFixed(3)})` : `rgba(215,228,255,${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(px, py, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      planet();
      orbits();
      constellation(dt);

      if (shot) {
        const p = shot.life / shot.max;
        const alpha = Math.sin(Math.PI * Math.min(1, p)) * 0.85;
        const len = 120;
        const ang = Math.atan2(shot.vy, shot.vx);
        const tx = shot.x - Math.cos(ang) * len;
        const ty = shot.y - Math.sin(ang) * len;
        const g = ctx!.createLinearGradient(shot.x, shot.y, tx, ty);
        g.addColorStop(0, `rgba(255,246,214,${alpha})`);
        g.addColorStop(1, "rgba(255,246,214,0)");
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.6;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(shot.x, shot.y);
        ctx!.lineTo(tx, ty);
        ctx!.stroke();
      }
    }

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      t += dt;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
      nextShot -= dt;
      if (!shot && nextShot <= 0) {
        const fromLeft = Math.random() < 0.5;
        const speed = 560 + Math.random() * 240;
        const ang = (fromLeft ? 0.3 : Math.PI - 0.3) + (Math.random() - 0.5) * 0.2;
        shot = { x: Math.random() * w * 0.6 + (fromLeft ? 0 : w * 0.4), y: Math.random() * h * 0.3, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 0, max: 1 };
        nextShot = 8 + Math.random() * 8;
      }
      if (shot) {
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        shot.life += dt;
        if (shot.life >= shot.max) shot = null;
      }
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function localXY(e: PointerEvent) {
      const r = cv!.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
    }
    function nearest(x: number, y: number) {
      let best = -1;
      let bd = (narrow ? 26 : 30) ** 2;
      nodeXY.forEach((n, i) => {
        const d = (n.x - x) ** 2 + (n.y - y) ** 2;
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function onMove(e: PointerEvent) {
      const p = localXY(e);
      if (!p.inside) return;
      pointer.tx = (p.x / w - 0.5) * 2;
      pointer.ty = (p.y / h - 0.5) * 2;
      const n = nearest(p.x, p.y);
      if (n !== hoverNode) {
        hoverNode = n;
        cv!.parentElement!.style.cursor = n >= 0 ? "pointer" : "";
        if (n >= 0) choose(n);
      }
    }
    function onDown(e: PointerEvent) {
      const p = localXY(e);
      if (!p.inside) return;
      const n = nearest(p.x, p.y);
      if (n >= 0) choose(n);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    if (reduce) draw(0);

    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(host);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [choose]);

  const tip = TIPS[active];
  return (
    <section ref={wrap} className="relative isolate overflow-hidden bg-night-950 text-white">
      {/* deep-space colour: warm gold bloom, cool indigo bloom, vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(60%_55%_at_18%_0%,rgba(212,175,79,0.20),transparent_70%),radial-gradient(55%_60%_at_88%_100%,rgba(91,99,214,0.20),transparent_70%),linear-gradient(180deg,#0b0f17_0%,#0d1220_60%,#0b0f17_100%)]"
      />
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />
      {/* keeps the headline area calm and readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(48%_46%_at_50%_44%,rgba(11,15,23,0.78),transparent_100%)]"
      />

      <div className="container-page relative py-20 text-center sm:py-24">
        {children}

        <div className="mx-auto mt-12 max-w-xl text-left">
          <div className="rounded-2xl border border-gold-400/25 bg-night-900/65 p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">More you know</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{tip.label}</p>
            </div>
            <div key={tip.key} className="hero-tip-in mt-3 min-h-[92px] sm:min-h-[72px]">
              <p className="text-[15px] leading-relaxed text-slate-100">{tip.tip}</p>
              <Link href={tip.href} className="mt-3 inline-block text-sm font-semibold text-gold-300 hover:text-gold-200 hover:underline">
                {tip.cta} →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-1.5" role="group" aria-label="Choose a tip">
              {TIPS.map((x, i) => (
                <button
                  key={x.key}
                  onClick={() => choose(i)}
                  aria-label={`Show tip: ${x.label}`}
                  aria-current={i === active ? "true" : undefined}
                  className="group flex h-6 items-center justify-center px-1"
                >
                  <span className={`block h-1.5 rounded-full transition-all ${i === active ? "w-6 bg-gold-300" : "w-1.5 bg-white/25 group-hover:bg-white/50"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="gold-rule" />
    </section>
  );
}
