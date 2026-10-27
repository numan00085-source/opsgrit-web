"use client";

import { useRef } from "react";
import { useIdleEffect } from "@/lib/useIdleEffect";
import { usePathname } from "next/navigation";

/**
 * Calm, site-wide ambient motion for the cream pages: golden dust floating in warm light.
 * Designed for reading: particles are tiny and faint, they stay mostly to the sides, fade out
 * behind the centre reading column, drift slowly and drift a little as you scroll.
 * Pauses in background tabs, runs at ~30fps, and is a still picture with "reduce motion".
 */
export default function AmbientDust() {
  const path = usePathname();
  const ref = useRef<HTMLCanvasElement>(null);
  const hidden = path === "/tools/ops-bot"; // that page has its own night sky

  useIdleEffect(() => {
    if (hidden) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    let raf = 0, running = false, last = 0, t = 0, acc = 0;
    let scrollY = window.scrollY;

    type P = { x: number; y: number; d: number; r: number; a: number; ph: number; sp: number; sway: number; vx: number; vy: number; big: boolean };
    let ps: P[] = [];

    // Pre-rendered soft sprites: a tiny golden mote and a large faint "bokeh" disc.
    const mote = document.createElement("canvas");
    mote.width = mote.height = 48;
    {
      const g = mote.getContext("2d")!;
      const r = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      r.addColorStop(0, "rgba(214,170,60,1)");
      r.addColorStop(0.3, "rgba(214,170,60,0.55)");
      r.addColorStop(1, "rgba(214,170,60,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, 48, 48);
    }
    const bokeh = document.createElement("canvas");
    bokeh.width = bokeh.height = 128;
    {
      const g = bokeh.getContext("2d")!;
      const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      r.addColorStop(0, "rgba(232,196,98,0.55)");
      r.addColorStop(0.7, "rgba(232,196,98,0.28)");
      r.addColorStop(0.92, "rgba(232,196,98,0.12)");
      r.addColorStop(1, "rgba(232,196,98,0)");
      g.fillStyle = r;
      g.fillRect(0, 0, 128, 128);
    }

    function edgeX(): number {
      // Mostly near the left and right edges, so the reading column stays calm.
      const side = Math.random() < 0.5 ? 0 : 1;
      const n = Math.random() < 0.72 ? Math.pow(Math.random(), 1.6) * 0.34 : Math.random(); // 72% in outer third
      return (side ? 1 - n : n) * w;
    }

    function seed() {
      const area = w * h;
      const nMotes = Math.max(26, Math.min(64, Math.round(area / 21000)));
      const nBokeh = Math.max(3, Math.min(8, Math.round(area / 190000)));
      ps = [];
      for (let i = 0; i < nMotes + nBokeh; i++) {
        const big = i >= nMotes;
        const d = big ? 0.25 + Math.random() * 0.3 : 0.4 + Math.random() * 0.6;
        ps.push({
          x: edgeX(),
          y: Math.random() * h,
          d,
          r: big ? 30 + Math.random() * 54 : 2 + Math.random() * 3,
          a: big ? 0.10 + Math.random() * 0.10 : 0.38 + Math.random() * 0.4,
          ph: Math.random() * Math.PI * 2,
          sp: 0.12 + Math.random() * 0.22, // breathing speed (very slow)
          sway: 6 + Math.random() * 16,
          vx: 1.5 + Math.random() * 3.5,
          vy: -(2.5 + Math.random() * 6) * d, // slowly rising
          big,
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw();
    }

    const smooth = (x: number) => x * x * (3 - 2 * x);

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      const half = w / 2;
      for (const p of ps) {
        // Scroll parallax: nearer motes move a little more as you scroll.
        let y = p.y - scrollY * p.d * 0.12;
        y = ((y % (h + 120)) + (h + 120)) % (h + 120) - 60;
        const x = p.x + Math.sin(t * 0.25 + p.ph) * p.sway;
        const breath = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(t * p.sp + p.ph);
        // Dimmer toward the centre column (the text), full strength at the edges.
        const edge = smooth(Math.min(1, Math.abs(x - half) / half));
        const centre = 0.3 + 0.7 * edge;
        const alpha = p.a * breath * centre;
        if (alpha < 0.004) continue;
        ctx!.globalAlpha = alpha;
        const s = p.r * 2;
        ctx!.drawImage(p.big ? bokeh : mote, x - p.r, y - p.r, s, s);
      }
      ctx!.globalAlpha = 1;
    }

    function frame(now: number) {
      if (!running) return;
      const dt = Math.min(0.1, (now - last) / 1000 || 0);
      last = now;
      acc += dt;
      if (acc >= 1 / 30) {
        const step = acc;
        acc = 0;
        t += step;
        for (const p of ps) {
          p.x += p.vx * step * p.d;
          p.y += p.vy * step;
          if (p.x > w + 80) p.x = -60;
          if (p.y < -80) p.y = h + 60;
        }
        draw();
      }
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

    const onScroll = () => {
      scrollY = window.scrollY;
      if (reduce) draw();
    };
    const onVis = () => (document.hidden ? stop() : start());

    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [hidden]);

  if (hidden) return null;
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen" />;
}
