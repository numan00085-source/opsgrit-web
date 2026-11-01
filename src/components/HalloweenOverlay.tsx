"use client";

import { useEffect, useRef, useState } from "react";
import { useIdleEffect } from "@/lib/useIdleEffect";

/**
 * One-day Halloween scene for the whole site: bats cross the sky, ghosts drift up the page edges, lanterns
 * bob along the bottom and a little fog rolls in. Everything is drawn on one canvas that ignores the mouse,
 * stays mostly at the sides (so reading is never blocked), pauses in background tabs, and draws one still frame
 * for visitors who prefer reduced motion.
 *
 * It removes itself at a fixed moment: midnight at the end of October 31, 2026 in Detroit (04:00 UTC on
 * November 1, still on summer time). The check runs in the browser, so it switches off even on pages that
 * were loaded earlier or cached.
 */
const END_AT = Date.UTC(2026, 10, 1, 4, 0, 0);
const KEY = "ops_halloween_hidden";

type Bat = { x: number; y: number; vx: number; ph: number; s: number; amp: number; sp: number };
type Ghost = { x: number; y: number; vy: number; ph: number; s: number; side: number; a: number };
type Lantern = { x: number; ph: number; s: number; sp: number };

export default function HalloweenOverlay() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Decide on the client whether the day is still running.
  useEffect(() => {
    if (Date.now() >= END_AT) return;
    try {
      if (localStorage.getItem(KEY) === "1") setHidden(true);
    } catch {
      /* storage can be blocked; show the scene */
    }
    setOn(true);
    const t = window.setInterval(() => {
      if (Date.now() >= END_AT) setOn(false);
    }, 15000);
    const left = END_AT - Date.now();
    const exact = left > 0 && left < 2147483000 ? window.setTimeout(() => setOn(false), left) : 0;
    return () => {
      window.clearInterval(t);
      if (exact) window.clearTimeout(exact);
    };
  }, []);

  useIdleEffect(() => {
    if (!on || hidden) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let running = false;
    let last = 0;
    let acc = 0;
    let t = 0;
    const small = window.innerWidth < 700;

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    let bats: Bat[] = [];
    let ghosts: Ghost[] = [];
    let lanterns: Lantern[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeBat = (fromEdge: boolean): Bat => {
      const dir = Math.random() < 0.5 ? 1 : -1;
      return {
        x: fromEdge ? (dir > 0 ? -60 : w + 60) : rnd(0, w),
        y: rnd(h * 0.08, h * 0.5),
        vx: dir * rnd(55, 110),
        ph: rnd(0, 6.28),
        s: rnd(0.8, 1.35) * (small ? 0.8 : 1),
        amp: rnd(14, 38),
        sp: rnd(9, 14),
      };
    };
    const makeGhost = (i: number): Ghost => ({
      side: i % 2 === 0 ? 0 : 1,
      x: i % 2 === 0 ? rnd(0.01, 0.09) : rnd(0.91, 0.99),
      y: rnd(0.15, 1.05) * h,
      vy: -rnd(10, 22),
      ph: rnd(0, 6.28),
      s: rnd(0.8, 1.25) * (small ? 0.75 : 1),
      a: rnd(0.55, 0.8),
    });

    const init = () => {
      resize();
      bats = Array.from({ length: small ? 3 : 6 }, () => makeBat(false));
      ghosts = Array.from({ length: small ? 2 : 4 }, (_, i) => makeGhost(i));
      lanterns = Array.from({ length: small ? 3 : 5 }, (_, i) => ({
        x: (i + 0.5) / (small ? 3 : 5),
        ph: rnd(0, 6.28),
        s: rnd(0.85, 1.15) * (small ? 0.8 : 1),
        sp: rnd(0.8, 1.4),
      }));
    };

    const drawMoon = () => {
      const r = small ? 26 : 38;
      const x = w - (small ? 54 : 110);
      const y = small ? 118 : 140;
      const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 3.2);
      g.addColorStop(0, "rgba(255,190,90,0.34)");
      g.addColorStop(1, "rgba(255,190,90,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = "rgba(255,214,140,0.92)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = "rgba(235,170,80,0.55)";
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.18, 0, 6.2832);
      ctx.arc(x + r * 0.28, y + r * 0.22, r * 0.12, 0, 6.2832);
      ctx.arc(x + r * 0.1, y - r * 0.45, r * 0.09, 0, 6.2832);
      ctx.fill();
    };

    const drawBat = (b: Bat) => {
      const flap = Math.sin(t * b.sp + b.ph);
      const wing = 16 * b.s;
      const up = flap * 12 * b.s;
      ctx.save();
      ctx.translate(b.x, b.y + Math.sin(t * 1.4 + b.ph) * b.amp);
      ctx.scale(b.vx < 0 ? -1 : 1, 1);
      ctx.fillStyle = "#1c1030";
      ctx.strokeStyle = "rgba(255,140,40,0.6)";
      ctx.lineWidth = 1;
      for (const m of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(m * wing * 0.9, -wing * 0.9 - up, m * wing * 2.2, -up * 0.6);
        ctx.quadraticCurveTo(m * wing * 1.7, wing * 0.1, m * wing * 1.45, wing * 0.5);
        ctx.quadraticCurveTo(m * wing * 1.05, wing * 0.1, m * wing * 0.75, wing * 0.55);
        ctx.quadraticCurveTo(m * wing * 0.4, wing * 0.1, 0, wing * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(0, 2 * b.s, 5 * b.s, 8 * b.s, 0, 0, 6.2832);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-4 * b.s, -5 * b.s);
      ctx.lineTo(-2 * b.s, -11 * b.s);
      ctx.lineTo(0, -6 * b.s);
      ctx.lineTo(2 * b.s, -11 * b.s);
      ctx.lineTo(4 * b.s, -5 * b.s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ff9f2e";
      ctx.fillRect(-3 * b.s, -2 * b.s, 1.6 * b.s, 1.6 * b.s);
      ctx.fillRect(1.4 * b.s, -2 * b.s, 1.6 * b.s, 1.6 * b.s);
      ctx.restore();
    };

    const drawGhost = (g: Ghost) => {
      const sway = Math.sin(t * 1.2 + g.ph) * 10;
      const x = g.x * w + sway;
      const r = 24 * g.s;
      ctx.save();
      ctx.translate(x, g.y);
      ctx.globalAlpha = g.a * Math.min(1, Math.max(0.15, Math.min(g.y / 140, (h + 80 - g.y) / 140)));
      const grad = ctx.createLinearGradient(0, -r, 0, r * 1.6);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#d9d3f3");
      ctx.fillStyle = grad;
      ctx.shadowColor = "rgba(190,170,255,0.8)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI, 0);
      ctx.lineTo(r, r * 1.5);
      const waves = 4;
      const seg = (r * 2) / waves;
      for (let i = 0; i < waves; i++) {
        const sx = r - i * seg;
        ctx.quadraticCurveTo(sx - seg * 0.25, r * 1.5 + (i % 2 ? -7 : 7) * g.s + Math.sin(t * 3 + i) * 2, sx - seg * 0.5, r * 1.5);
        ctx.quadraticCurveTo(sx - seg * 0.75, r * 1.5 + (i % 2 ? 7 : -7) * g.s, sx - seg, r * 1.5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#2a1f4a";
      ctx.beginPath();
      ctx.ellipse(-r * 0.36, -r * 0.05, r * 0.14, r * 0.22, 0, 0, 6.2832);
      ctx.ellipse(r * 0.36, -r * 0.05, r * 0.14, r * 0.22, 0, 0, 6.2832);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, r * 0.45, r * 0.16, r * 0.22, 0, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    };

    const drawLantern = (l: Lantern) => {
      const x = l.x * w + Math.sin(t * l.sp + l.ph) * 14;
      const y = h - (small ? 54 : 70) - Math.sin(t * l.sp * 0.9 + l.ph) * 8;
      const r = 20 * l.s;
      const flick = 0.82 + Math.sin(t * 9 + l.ph * 3) * 0.1 + Math.sin(t * 5.3 + l.ph) * 0.06;
      const glow = ctx.createRadialGradient(x, y, 2, x, y, r * 3.2);
      glow.addColorStop(0, `rgba(255,150,40,${0.5 * flick})`);
      glow.addColorStop(1, "rgba(255,150,40,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, 6.2832);
      ctx.fill();
      const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 1.1);
      body.addColorStop(0, "#ffb347");
      body.addColorStop(1, "#e8590c");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.1, r * 0.92, 0, 0, 6.2832);
      ctx.fill();
      ctx.strokeStyle = "rgba(120,40,0,0.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.5, r * 0.92, 0, 0, 6.2832);
      ctx.stroke();
      ctx.fillStyle = "#3d7a2a";
      ctx.fillRect(x - 2.5, y - r * 1.12, 5, 8);
      ctx.fillStyle = `rgba(255,236,150,${flick})`;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.55, y - r * 0.15);
      ctx.lineTo(x - r * 0.25, y - r * 0.5);
      ctx.lineTo(x - r * 0.05, y - r * 0.15);
      ctx.closePath();
      ctx.moveTo(x + r * 0.05, y - r * 0.15);
      ctx.lineTo(x + r * 0.25, y - r * 0.5);
      ctx.lineTo(x + r * 0.55, y - r * 0.15);
      ctx.closePath();
      ctx.moveTo(x - r * 0.6, y + r * 0.2);
      ctx.quadraticCurveTo(x, y + r * 0.78, x + r * 0.6, y + r * 0.2);
      ctx.lineTo(x + r * 0.35, y + r * 0.18);
      ctx.lineTo(x, y + r * 0.4);
      ctx.lineTo(x - r * 0.35, y + r * 0.18);
      ctx.closePath();
      ctx.fill();
    };

    const drawFog = () => {
      for (let i = 0; i < 3; i++) {
        const cx = ((t * (10 + i * 6) + i * w * 0.5) % (w * 1.6)) - w * 0.3;
        const g = ctx.createRadialGradient(cx, h, 10, cx, h, w * 0.5);
        g.addColorStop(0, "rgba(170,150,220,0.22)");
        g.addColorStop(1, "rgba(170,150,220,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, h - 220, w, 220);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      drawFog();
      drawMoon();
      for (const l of lanterns) drawLantern(l);
      for (const g of ghosts) drawGhost(g);
      for (const b of bats) drawBat(b);
    };

    const step = (dt: number) => {
      t += dt;
      for (let i = 0; i < bats.length; i++) {
        const b = bats[i];
        b.x += b.vx * dt;
        if ((b.vx > 0 && b.x > w + 80) || (b.vx < 0 && b.x < -80)) bats[i] = makeBat(true);
      }
      for (let i = 0; i < ghosts.length; i++) {
        const g = ghosts[i];
        g.y += g.vy * dt;
        if (g.y < -80) {
          ghosts[i] = makeGhost(i);
          ghosts[i].y = h + 60;
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      acc += dt;
      if (acc < 1 / 30) return;
      step(acc);
      acc = 0;
      draw();
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onVis = () => (document.hidden ? stop() : start());
    const onResize = () => {
      resize();
      if (reduce) draw();
    };

    init();
    if (reduce) {
      t = 1.3;
      draw();
    } else {
      start();
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [on, hidden]);

  if (!on) return null;

  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {!hidden && <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[35]" />}
      {!hidden && (
        <div className="fixed bottom-3 left-3 z-[36] flex items-center gap-2 rounded-full border border-orange-300/60 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-orange-200 shadow-lg backdrop-blur">
          <span>Happy Halloween from OpsGrit</span>
          <button type="button" onClick={hide} className="rounded-full px-2 py-0.5 text-[11px] text-orange-100/80 underline-offset-2 hover:text-white hover:underline" aria-label="Hide the Halloween decorations">
            Hide
          </button>
        </div>
      )}
    </>
  );
}
