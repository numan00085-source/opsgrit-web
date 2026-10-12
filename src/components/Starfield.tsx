"use client";

import { useEffect, useRef } from "react";

/**
 * A calm, realistic night sky: three depth layers of stars drifting at different speeds (parallax),
 * gentle twinkling, a few soft glowing stars and an occasional shooting star.
 * Built for reading: stars stay small and dim, it pauses when off screen or in a background tab,
 * and with "reduce motion" it draws a single still sky.
 */
export default function Starfield({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    let raf = 0;
    let running = false;
    let last = 0;
    let t = 0;

    type Star = { x: number; y: number; z: number; r: number; ph: number; sp: number; tint: number };
    let stars: Star[] = [];
    type Shot = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    let shot: Shot | null = null;
    let nextShot = 5 + Math.random() * 6;

    // Soft glow sprite, drawn once and reused so large stars stay cheap.
    const glow = document.createElement("canvas");
    glow.width = glow.height = 64;
    {
      const g = glow.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,0.95)");
      grd.addColorStop(0.18, "rgba(255,255,255,0.35)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
    }

    const TINTS = ["255,255,255", "205,222,255", "255,238,205"]; // white, cool blue, warm gold

    function seed() {
      const area = w * h;
      const n = Math.max(90, Math.min(280, Math.round(area / 6800)));
      stars = Array.from({ length: n }, () => {
        const layer = Math.random();
        const z = layer < 0.55 ? 0.3 : layer < 0.88 ? 0.6 : 1; // far, mid, near
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: (0.35 + Math.random() * 0.7) * (0.6 + z * 0.9),
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.6,
          tint: Math.random() < 0.7 ? 0 : Math.random() < 0.5 ? 1 : 2,
        };
      });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      draw(0);
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, w, h);
      // Drift: slow, down and to the left, faster for nearer stars.
      for (const s of stars) {
        if (dt) {
          s.x -= 5 * s.z * dt;
          s.y += 2.2 * s.z * dt;
          if (s.x < -4) s.x = w + 4;
          if (s.y > h + 4) s.y = -4;
        }
        const tw = reduce ? 0.8 : 0.62 + 0.38 * Math.sin(t * s.sp + s.ph);
        const a = (0.4 + 0.58 * s.z) * tw;
        if (s.z === 1 && s.r > 1) {
          const gs = s.r * 9;
          ctx!.globalAlpha = a * 0.55;
          ctx!.drawImage(glow, s.x - gs / 2, s.y - gs / 2, gs, gs);
        }
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = `rgba(${TINTS[s.tint]},${a.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      // Shooting star
      if (shot) {
        const p = shot.life / shot.max;
        const alpha = Math.sin(Math.PI * Math.min(1, p)) * 0.75;
        const len = 90;
        const ang = Math.atan2(shot.vy, shot.vx);
        const tx = shot.x - Math.cos(ang) * len;
        const ty = shot.y - Math.sin(ang) * len;
        const g = ctx!.createLinearGradient(shot.x, shot.y, tx, ty);
        g.addColorStop(0, `rgba(255,250,235,${alpha})`);
        g.addColorStop(1, "rgba(255,250,235,0)");
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 1.4;
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
      nextShot -= dt;
      if (!shot && nextShot <= 0) {
        const fromLeft = Math.random() < 0.5;
        const speed = 520 + Math.random() * 220;
        const ang = (fromLeft ? 0.35 : Math.PI - 0.35) + (Math.random() - 0.5) * 0.2;
        shot = { x: Math.random() * w * 0.7 + (fromLeft ? 0 : w * 0.3), y: Math.random() * h * 0.35, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 0, max: 0.9 };
        nextShot = 9 + Math.random() * 9;
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

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
