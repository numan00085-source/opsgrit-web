import { BOX_D, BOX_W, CROSSBAR, GOAL_DEPTH, GOAL_W, GOAL_Y0, GOAL_Y1, H, SIX_D, SIX_W, W, type GameEvent } from "./engine";
import type { View, VPlayer } from "./view";

export const TEAM_NAMES: [string, string] = ["OPSGRIT FC", "BACKLOG UTD"];
const KIT = [
  { shirt: "#e9b949", shirt2: "#b98a22", trim: "#15161d", gk: "#1d2b44", gk2: "#e9b949" },
  { shirt: "#17b8a6", shirt2: "#0d8579", trim: "#f4f7fb", gk: "#ff5d73", gk2: "#ffe3e7" },
];
const SKIN = ["#f1c9a1", "#d9a577", "#b27a52", "#8a5a3a", "#5f3d26", "#efd2b3"];
const HAIR = ["#1c1410", "#3b2a1c", "#7a5230", "#c79a4b", "#111111", "#6b2d1e"];
const ADS = [
  { t: "OPSGRIT", bg: "#e9b949", fg: "#15161d" },
  { t: "AUTOMATE THE BORING", bg: "#15161d", fg: "#f5d98a" },
  { t: "RACI MATRIX", bg: "#17b8a6", fg: "#06231f" },
  { t: "GETOPSGRIT.COM", bg: "#f4efe3", fg: "#15161d" },
  { t: "SOP BUILDER", bg: "#2b2f55", fg: "#f5d98a" },
  { t: "ROI CALCULATOR", bg: "#e9b949", fg: "#15161d" },
  { t: "SHIP THE HANDOFF", bg: "#15161d", fg: "#7ce8ff" },
];

interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; max: number; color: string; size: number; kind: "grass" | "conf" | "spark" | "dust"; rot: number }
interface Ring { x: number; y: number; t: number; max: number; r: number }
interface Banner { text: string; sub?: string; t: number; max: number; big?: boolean; color?: string }

export interface DrawOpts {
  flip: boolean;
  myTeam: number;
  online: boolean;
  w: number; // css px
  h: number;
  names: [string, string];
  touch: boolean;
  attract?: boolean;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class Renderer {
  ctx: CanvasRenderingContext2D;
  cam = { x: W / 2, y: H / 2, zoom: 1 };
  private lastBall = { x: W / 2, y: H / 2 };
  private ballVel = { x: 0, y: 0 };
  private trail: { x: number; y: number; z: number }[] = [];
  private roll = 0;
  parts: Particle[] = [];
  rings: Ring[] = [];
  banners: Banner[] = [];
  shake = 0;
  flash = 0;
  ripple = [0, 0];
  private lastEv = -1;
  private seeded = false;
  private crowd: CanvasPattern | null = null;
  private grain: CanvasPattern | null = null;
  private excite = 0;
  time = 0;
  goalText: { t: number; team: number; minute: number } | null = null;
  reduce = false;

  constructor(private cv: HTMLCanvasElement) {
    this.ctx = cv.getContext("2d", { alpha: false })!;
    this.buildPatterns();
    try {
      this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* ignore */
    }
  }

  private buildPatterns() {
    const mk = (w: number, h: number, fn: (c: CanvasRenderingContext2D) => void) => {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      fn(c.getContext("2d")!);
      return this.ctx.createPattern(c, "repeat");
    };
    this.crowd = mk(180, 180, (c) => {
      c.fillStyle = "#0c0f1c";
      c.fillRect(0, 0, 180, 180);
      const cols = ["#e9b949", "#17b8a6", "#f4efe3", "#ff5d73", "#3a4272", "#6b5cff", "#2b2f55", "#c9a24a"];
      for (let i = 0; i < 260; i++) {
        c.fillStyle = cols[Math.floor(Math.random() * cols.length)];
        c.globalAlpha = rnd(0.35, 0.9);
        c.beginPath();
        c.arc(Math.random() * 180, Math.random() * 180, rnd(1.6, 3.2), 0, 7);
        c.fill();
      }
    });
    this.grain = mk(128, 128, (c) => {
      for (let i = 0; i < 900; i++) {
        c.fillStyle = Math.random() < 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
        c.fillRect(Math.random() * 128, Math.random() * 128, rnd(1, 3), rnd(1, 3));
      }
    });
  }

  /* ---------- events ---------- */
  /** Returns events not seen before and turns them into effects. */
  ingest(events: GameEvent[], names: [string, string]): GameEvent[] {
    if (!this.seeded) {
      this.seeded = true;
      this.lastEv = events.reduce((m, e) => Math.max(m, e.id), -1);
      return [];
    }
    const fresh = events.filter((e) => e.id > this.lastEv);
    for (const e of fresh) {
      this.lastEv = Math.max(this.lastEv, e.id);
      this.onEvent(e, names);
    }
    return fresh;
  }

  resetEvents() {
    this.seeded = false;
    this.lastEv = -1;
    this.banners = [];
    this.parts = [];
    this.goalText = null;
  }

  private onEvent(e: GameEvent, names: [string, string]) {
    const x = e.x ?? W / 2;
    const y = e.y ?? H / 2;
    switch (e.k) {
      case "kick":
      case "shot":
        this.rings.push({ x, y, t: 0, max: 0.35, r: 10 + (e.a ?? 0.4) * 24 });
        for (let i = 0; i < 4; i++) this.dust(x, y, 60);
        if (e.k === "shot" && (e.a ?? 0) > 0.7) this.shake = Math.max(this.shake, 0.08);
        break;
      case "pass":
        this.rings.push({ x, y, t: 0, max: 0.25, r: 12 });
        break;
      case "slide":
        for (let i = 0; i < 10; i++) this.grass(x, y, 140);
        break;
      case "tackle":
        for (let i = 0; i < 8; i++) this.grass(x, y, 160);
        this.banner("Great tackle", names[e.team ?? 0], 1.1, e.team);
        break;
      case "post":
        for (let i = 0; i < 10; i++) this.spark(x, y);
        this.shake = Math.max(this.shake, 0.28);
        this.banner("OFF THE WOODWORK", undefined, 1.2);
        break;
      case "save":
        if ((e.a ?? 0) >= 0.5) this.banner("SAVED!", undefined, 1.1);
        break;
      case "bounce":
        for (let i = 0; i < 3; i++) this.dust(x, y, 40);
        break;
      case "net":
        this.ripple[e.team === 0 ? 1 : 0] = 1;
        break;
      case "goal": {
        const t = e.team ?? 0;
        this.goalText = { t: 3.4, team: t, minute: e.a ?? 0 };
        this.flash = 0.35;
        this.shake = this.reduce ? 0 : 0.7;
        this.excite = 1;
        this.ripple[t === 0 ? 1 : 0] = 1.4;
        for (let i = 0; i < 160; i++) this.confetti(t);
        break;
      }
      case "throw": this.banner("Throw-in", names[e.team ?? 0], 1.4, e.team); break;
      case "corner": this.banner("Corner kick", names[e.team ?? 0], 1.6, e.team); break;
      case "goalkick": this.banner("Goal kick", names[e.team ?? 0], 1.4, e.team); break;
      case "streak": this.banner(e.a === 8 ? "8 clean handoffs in a row" : "4 clean handoffs in a row", "Smooth workflow", 1.6, e.team); break;
      case "half": this.banner("HALF TIME", undefined, 3, undefined, true); break;
      case "full": this.banner("FULL TIME", undefined, 4, undefined, true); break;
      case "whistle": break;
    }
  }

  banner(text: string, sub?: string, max = 1.4, team?: number, big = false) {
    this.banners = this.banners.filter((b) => b.big || b.text !== text);
    this.banners.push({ text, sub, t: 0, max, big, color: team === undefined ? undefined : KIT[team].shirt });
    if (this.banners.length > 3) this.banners.shift();
  }

  private grass(x: number, y: number, sp: number) {
    const a = Math.random() * 6.283;
    const v = rnd(sp * 0.3, sp);
    this.parts.push({ x, y, z: 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: rnd(60, 180), life: rnd(0.4, 0.8), max: 0.8, color: Math.random() < 0.5 ? "#3f9c3b" : "#7a5a2e", size: rnd(1.4, 3), kind: "grass", rot: 0 });
  }
  private dust(x: number, y: number, sp: number) {
    const a = Math.random() * 6.283;
    this.parts.push({ x, y, z: 1, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, vz: rnd(10, 40), life: 0.5, max: 0.5, color: "rgba(235,235,220,0.5)", size: rnd(2, 4), kind: "dust", rot: 0 });
  }
  private spark(x: number, y: number) {
    const a = Math.random() * 6.283;
    const v = rnd(80, 260);
    this.parts.push({ x, y, z: 20, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vz: rnd(40, 200), life: rnd(0.3, 0.7), max: 0.7, color: "#fff2b8", size: rnd(1.5, 2.6), kind: "spark", rot: 0 });
  }
  private confetti(team: number) {
    const cols = team === 0 ? ["#e9b949", "#f5d98a", "#ffffff", "#15161d"] : ["#17b8a6", "#7be8dc", "#ffffff", "#15161d"];
    this.parts.push({
      x: rnd(W * 0.25, W * 0.75), y: rnd(100, H - 100), z: rnd(140, 360), vx: rnd(-60, 60), vy: rnd(-60, 60), vz: rnd(-40, 60),
      life: rnd(1.6, 3.2), max: 3.2, color: cols[Math.floor(Math.random() * cols.length)], size: rnd(3, 6), kind: "conf", rot: rnd(0, 6),
    });
  }

  /* ---------- main draw ---------- */
  draw(v: View, o: DrawOpts, dt: number) {
    const ctx = this.ctx;
    const { w, h } = o;
    this.time += dt;
    this.updateEffects(v, dt);

    // camera
    const ball = v.ball;
    this.ballVel.x = lerp(this.ballVel.x, (ball.x - this.lastBall.x) / Math.max(dt, 0.001), Math.min(1, dt * 8));
    this.ballVel.y = lerp(this.ballVel.y, (ball.y - this.lastBall.y) / Math.max(dt, 0.001), Math.min(1, dt * 8));
    const jumped = Math.hypot(ball.x - this.lastBall.x, ball.y - this.lastBall.y) > 250;
    if (jumped) { this.ballVel.x = 0; this.ballVel.y = 0; }
    this.lastBall = { x: ball.x, y: ball.y };
    const me = v.ctrl[o.myTeam] >= 0 ? v.players[v.ctrl[o.myTeam]] : null;
    let fx = ball.x + this.ballVel.x * 0.22;
    let fy = ball.y + this.ballVel.y * 0.22;
    if (me && v.phase === "play") { fx = lerp(fx, me.x, 0.28); fy = lerp(fy, me.y, 0.28); }
    let zoomT = 1;
    if (v.phase === "kickoff" || v.phase === "half") { fx = W / 2; fy = H / 2; zoomT = 0.86; }
    if (v.phase === "goal") zoomT = 1.12;
    if (v.phase === "full") { fx = W / 2; fy = H / 2; zoomT = 0.8; }
    const baseScale = Math.max(w / 1180, h / 640);
    const sc = baseScale * this.cam.zoom;
    const vw = w / sc, vh = h / sc;
    const mx = 170, my = 150;
    fx = vw >= W + mx * 2 ? W / 2 : Math.min(Math.max(fx, vw / 2 - mx), W - vw / 2 + mx);
    fy = vh >= H + my * 2 ? H / 2 : Math.min(Math.max(fy, vh / 2 - my), H - vh / 2 + my);
    const k = Math.min(1, dt * (jumped ? 30 : 5.5));
    this.cam.x = lerp(this.cam.x, fx, k);
    this.cam.y = lerp(this.cam.y, fy, k);
    this.cam.zoom = lerp(this.cam.zoom, zoomT, Math.min(1, dt * 2.4));

    // background
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#05070d";
    ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    const dpr = this.cv.width / w;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.save();
    const sh = this.shake > 0 ? this.shake : 0;
    ctx.translate(w / 2 + (sh ? rnd(-1, 1) * sh * 10 : 0), h / 2 + (sh ? rnd(-1, 1) * sh * 10 : 0));
    const s = o.flip ? -sc : sc;
    ctx.scale(s, s);
    ctx.translate(-this.cam.x, -this.cam.y);

    this.drawStadium(o, v);
    this.drawPitch();
    this.drawGoals();
    this.drawBoards(o);

    // ground effects
    for (const r of this.rings) {
      const p = r.t / r.max;
      ctx.strokeStyle = `rgba(255,255,255,${0.45 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * (0.4 + p), 0, Math.PI * 2);
      ctx.stroke();
    }

    // entities
    const sorted = v.players.map((p, i) => ({ p, i })).sort((a, b) => a.p.y - b.p.y);
    const ballLow = ball.y;
    let ballDone = false;
    for (const { p, i } of sorted) {
      if (!ballDone && ballLow < p.y) { this.drawBall(v); ballDone = true; }
      this.drawPlayer(p, i, v, o);
    }
    if (!ballDone) this.drawBall(v);

    // markers over players
    for (let t = 0; t < 2; t++) {
      const id = v.ctrl[t];
      if (id < 0 || v.phase === "full") continue;
      const p = v.players[id];
      const mine = t === o.myTeam;
      if (!mine && !o.online) continue;
      this.drawMarker(p, mine, v.charge[t], o);
    }
    this.drawParticles(v);
    ctx.restore();

    // light vignette and flash
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,244,200,${Math.min(0.5, this.flash)})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (!o.attract) this.drawHud(v, o);
  }

  private updateEffects(v: View, dt: number) {
    this.shake = Math.max(0, this.shake - dt);
    this.flash = Math.max(0, this.flash - dt * 1.4);
    this.excite = Math.max(0, this.excite - dt * 0.3);
    this.ripple[0] = Math.max(0, this.ripple[0] - dt * 1.3);
    this.ripple[1] = Math.max(0, this.ripple[1] - dt * 1.3);
    for (const r of this.rings) r.t += dt;
    this.rings = this.rings.filter((r) => r.t < r.max);
    for (const q of this.parts) {
      q.life -= dt;
      q.x += q.vx * dt; q.y += q.vy * dt;
      q.z += q.vz * dt;
      q.rot += dt * 6;
      if (q.kind === "conf") { q.vz -= 160 * dt; q.vx *= 0.99; q.z = Math.max(0, q.z); if (q.z <= 0) q.vz = 0; }
      else { q.vz -= 520 * dt; if (q.z < 0) { q.z = 0; q.vz *= -0.2; } }
    }
    this.parts = this.parts.filter((q) => q.life > 0);
    for (const b of this.banners) b.t += dt;
    this.banners = this.banners.filter((b) => b.t < b.max);
    if (this.goalText) {
      this.goalText.t -= dt;
      if (this.goalText.t <= 0) this.goalText = null;
    }
    // running dust and ball trail
    if (v.phase === "play") {
      for (const p of v.players) {
        if ((p.flags & 1) && Math.random() < 0.35) this.dust(p.x - Math.cos(p.face) * 8, p.y - Math.sin(p.face) * 8, 22);
      }
    }
    const b = v.ball;
    this.trail.push({ x: b.x, y: b.y, z: b.z });
    if (this.trail.length > 9) this.trail.shift();
    const sp = Math.hypot(this.ballVel.x, this.ballVel.y);
    this.roll += sp * dt * 0.1;
  }

  /* ---------- stadium and pitch ---------- */
  private drawStadium(o: DrawOpts, v: View) {
    const ctx = this.ctx;
    const ex = this.excite + (v.phase === "goal" ? 0.5 : 0);
    ctx.save();
    // dark base
    ctx.fillStyle = "#070914";
    ctx.fillRect(-700, -700, W + 1400, H + 1400);
    if (this.crowd) {
      ctx.fillStyle = this.crowd;
      const bob = Math.sin(this.time * (3 + ex * 5)) * (1 + ex * 3);
      ctx.translate(0, bob);
      ctx.fillRect(-700, -700, W + 1400, H + 1400);
      ctx.translate(0, -bob);
    }
    // darken the crowd with distance from the pitch
    const g = ctx.createRadialGradient(W / 2, H / 2, 600, W / 2, H / 2, 1100);
    g.addColorStop(0, "rgba(5,7,13,0.15)");
    g.addColorStop(1, "rgba(5,7,13,0.92)");
    ctx.fillStyle = g;
    ctx.fillRect(-700, -700, W + 1400, H + 1400);
    // stand edge
    ctx.fillStyle = "#0a0c18";
    ctx.fillRect(-130, -130, W + 260, H + 260);
    ctx.restore();
    void o;
  }

  private drawPitch() {
    const ctx = this.ctx;
    // grass with mow stripes
    const x0 = -110, y0 = -100, x1 = W + 110, y1 = H + 100;
    ctx.fillStyle = "#2f8c3b";
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    const stripe = 100;
    for (let i = 0, x = x0; x < x1; x += stripe, i++) {
      ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.06)";
      ctx.fillRect(x, y0, Math.min(stripe, x1 - x), y1 - y0);
    }
    if (this.grain) {
      ctx.fillStyle = this.grain;
      ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    }
    // lines
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.strokeRect(0, 0, W, H);
    ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 110, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 4, 0, Math.PI * 2); ctx.fill();
    for (const side of [0, 1]) {
      const sx = side === 0 ? 0 : W;
      const d = side === 0 ? 1 : -1;
      ctx.strokeRect(side === 0 ? 0 : W - BOX_D, H / 2 - BOX_W / 2, BOX_D, BOX_W);
      ctx.strokeRect(side === 0 ? 0 : W - SIX_D, H / 2 - SIX_W / 2, SIX_D, SIX_W);
      const px = sx + d * 165;
      ctx.beginPath(); ctx.arc(px, H / 2, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      const a = Math.acos((BOX_D - 165) / 110);
      if (side === 0) ctx.arc(px, H / 2, 110, -a, a); else ctx.arc(px, H / 2, 110, Math.PI - a, Math.PI + a);
      ctx.stroke();
    }
    // corner arcs
    for (const [cx, cy, a0] of [[0, 0, 0], [W, 0, Math.PI / 2], [W, H, Math.PI], [0, H, -Math.PI / 2]] as [number, number, number][]) {
      ctx.beginPath(); ctx.arc(cx, cy, 16, a0, a0 + Math.PI / 2); ctx.stroke();
    }
    // corner flags
    for (const [cx, cy] of [[0, 0], [W, 0], [W, H], [0, H]]) {
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  private drawGoals() {
    const ctx = this.ctx;
    for (const side of [0, 1]) {
      const rip = this.ripple[side];
      const x0 = side === 0 ? -GOAL_DEPTH : W;
      const w = GOAL_DEPTH;
      ctx.fillStyle = "rgba(10,12,22,0.55)";
      ctx.fillRect(x0, GOAL_Y0, w, GOAL_W);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      const step = 11;
      ctx.beginPath();
      for (let y = GOAL_Y0; y <= GOAL_Y1; y += step) {
        const off = rip > 0 ? Math.sin(y * 0.2 + this.time * 30) * rip * 4 : 0;
        ctx.moveTo(x0 + (side === 0 ? w : 0) + (side === 0 ? -w + off : w + off) * 0, y);
        ctx.lineTo(x0 + (side === 0 ? 0 : w) + off, y);
      }
      for (let x = 0; x <= w; x += step) {
        const off = rip > 0 ? Math.sin(x * 0.3 + this.time * 30) * rip * 4 : 0;
        ctx.moveTo(x0 + x, GOAL_Y0 + off);
        ctx.lineTo(x0 + x, GOAL_Y1 + off);
      }
      ctx.stroke();
      // frame
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeRect(x0, GOAL_Y0, w, GOAL_W);
      ctx.fillStyle = "#ffffff";
      for (const gy of [GOAL_Y0, GOAL_Y1]) {
        ctx.beginPath(); ctx.arc(side === 0 ? 0 : W, gy, 5.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    void CROSSBAR;
  }

  private drawBoards(o: DrawOpts) {
    const ctx = this.ctx;
    const bh = 26;
    const seg = 210;
    const draw = (y: number, top: boolean) => {
      const n = Math.ceil((W + 200) / seg);
      for (let i = 0; i < n; i++) {
        const ad = ADS[(i + (top ? 0 : 3)) % ADS.length];
        const x = -100 + i * seg;
        ctx.fillStyle = ad.bg;
        ctx.fillRect(x, y, seg - 3, bh);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fillRect(x, y, seg - 3, 4);
        ctx.save();
        ctx.translate(x + (seg - 3) / 2, y + bh / 2 + 1);
        if (o.flip) ctx.rotate(Math.PI);
        ctx.fillStyle = ad.fg;
        ctx.font = "800 12px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ad.t, 0, 0);
        ctx.restore();
      }
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(-100, top ? y + bh : y - 4, W + 200, 4);
    };
    draw(-72, true);
    draw(H + 46, false);
  }

  /* ---------- entities ---------- */
  private drawBall(v: View) {
    const ctx = this.ctx;
    const b = v.ball;
    const lift = b.z * 0.62;
    const rad = 8 * (1 + Math.min(b.z, 200) / 360);
    // shadow
    ctx.fillStyle = `rgba(0,0,0,${0.32 - Math.min(b.z, 160) * 0.0012})`;
    ctx.beginPath();
    ctx.ellipse(b.x + b.z * 0.12, b.y + 3 + b.z * 0.08, rad * 0.95, rad * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // trail
    const sp = Math.hypot(this.ballVel.x, this.ballVel.y);
    if (sp > 520) {
      for (let i = 0; i < this.trail.length - 1; i++) {
        const t = this.trail[i];
        ctx.fillStyle = `rgba(255,255,255,${(i / this.trail.length) * 0.18})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y - t.z * 0.62, 6 * (i / this.trail.length) + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.save();
    ctx.translate(b.x, b.y - lift);
    const g = ctx.createRadialGradient(-2.5, -3, 1, 0, 0, rad);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#cfd6e0");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill();
    ctx.rotate(this.roll + b.spin * 0.02);
    ctx.fillStyle = "#1b1f2b";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rad * 0.58, Math.sin(a) * rad * 0.58, rad * 0.26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, rad * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(b.x, b.y - lift, rad, 0, Math.PI * 2); ctx.stroke();
  }

  private drawPlayer(p: VPlayer, id: number, v: View, o: DrawOpts) {
    const ctx = this.ctx;
    const team = p.team;
    const gk = p.role === 0;
    const kit = KIT[team];
    const shirt = gk ? kit.gk : kit.shirt;
    const shirt2 = gk ? kit.gk2 : kit.shirt2;
    const trim = gk ? kit.gk2 : kit.trim;
    const sliding = (p.flags & 2) !== 0;
    const stunned = (p.flags & 4) !== 0;
    const kicking = (p.flags & 8) !== 0;
    const diving = (p.flags & 16) !== 0;
    const moving = v.phase === "play" || v.phase === "restart" || v.phase === "kickoff";
    const ph = p.step * 0.11;
    const skin = SKIN[(id * 5 + 2) % SKIN.length];
    const hair = HAIR[(id * 7 + 3) % HAIR.length];
    void o;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(p.x + 3, p.y + 5, sliding ? 17 : 12, sliding ? 8 : 9, p.face, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.face);
    if (stunned) ctx.globalAlpha = 0.85 + Math.sin(this.time * 30) * 0.1;

    const stretch = sliding ? 1.6 : 1;
    // legs and boots
    const swing = moving && !sliding ? Math.sin(ph) * 7.5 : 0;
    ctx.fillStyle = "#101119";
    const leg = (lx: number, ly: number) => {
      ctx.beginPath();
      ctx.ellipse(lx, ly, 5, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    if (sliding) { leg(13, -3.5); leg(15, 3.5); }
    else if (kicking) { leg(13, -3.5); leg(-4, 4); }
    else { leg(swing, -4.2); leg(-swing, 4.2); }
    // socks
    ctx.fillStyle = shirt;
    if (!sliding) {
      ctx.beginPath(); ctx.ellipse(swing - 2.5, -4.2, 3.2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-swing - 2.5, 4.2, 3.2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
    }
    // arms
    const armSwing = moving ? Math.sin(ph + Math.PI) * 4.5 : 0;
    ctx.fillStyle = skin;
    const armReach = diving ? 14 : 0;
    ctx.beginPath(); ctx.ellipse(armSwing + armReach, -10.5, diving ? 6.5 : 4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-armSwing + armReach, 10.5, diving ? 6.5 : 4, 2.8, 0, 0, Math.PI * 2); ctx.fill();
    // torso
    const tg = ctx.createLinearGradient(0, -11, 0, 11);
    tg.addColorStop(0, shirt);
    tg.addColorStop(0.5, shirt);
    tg.addColorStop(1, shirt2);
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.ellipse(-0.5, 0, 7.6 * stretch * (sliding ? 1.2 : 1), 11, 0, 0, Math.PI * 2);
    ctx.fill();
    // sleeves
    ctx.fillStyle = trim;
    ctx.beginPath(); ctx.ellipse(0.5, -10.3, 3.6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0.5, 10.3, 3.6, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    // back stripe
    ctx.fillStyle = shirt2;
    ctx.globalAlpha *= 0.5;
    ctx.fillRect(-7, -1.4, 6, 2.8);
    ctx.globalAlpha = stunned ? 0.85 : 1;
    // head
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.arc(1, 0, 5.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = hair;
    ctx.beginPath(); ctx.arc(0.2, 0, 5.3, Math.PI * 0.55, Math.PI * 1.45); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.ellipse(-0.5, 0, 7.6, 11, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  private drawMarker(p: VPlayer, mine: boolean, charge: number, o: DrawOpts) {
    const ctx = this.ctx;
    const col = mine ? "#f5d98a" : "#ff8a9a";
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = col;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(0, 3, 17, 13, 0, 0, Math.PI * 2); ctx.stroke();
    // arrow above the head, always upright for the viewer
    if (o.flip) ctx.rotate(Math.PI);
    const bob = Math.sin(this.time * 6) * 2;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(0, -24 + bob);
    ctx.lineTo(-6, -34 + bob);
    ctx.lineTo(6, -34 + bob);
    ctx.closePath();
    ctx.fill();
    if (charge > 0.02 && mine) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(-20, 22, 40, 6);
      const g = ctx.createLinearGradient(-20, 0, 20, 0);
      g.addColorStop(0, "#52e0a1"); g.addColorStop(0.6, "#f5d98a"); g.addColorStop(1, "#ff5d73");
      ctx.fillStyle = g;
      ctx.fillRect(-20, 22, 40 * charge, 6);
    }
    ctx.restore();
  }

  private drawParticles(v: View) {
    const ctx = this.ctx;
    void v;
    for (const q of this.parts) {
      const a = Math.max(0, Math.min(1, q.life / q.max * (q.kind === "conf" ? 1.6 : 1)));
      ctx.globalAlpha = a;
      const y = q.y - q.z * 0.62;
      if (q.kind === "conf") {
        ctx.save();
        ctx.translate(q.x, y);
        ctx.rotate(q.rot);
        ctx.fillStyle = q.color;
        ctx.fillRect(-q.size, -q.size * 0.5 * Math.abs(Math.sin(q.rot * 2)), q.size * 2, q.size * Math.abs(Math.sin(q.rot * 2)) + 1);
        ctx.restore();
      } else {
        ctx.fillStyle = q.color;
        ctx.beginPath();
        ctx.arc(q.x, y, q.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- HUD ---------- */
  private drawHud(v: View, o: DrawOpts) {
    const ctx = this.ctx;
    const { w, h } = o;
    const compact = w < 700;
    const bw = compact ? 330 : 440, bh = compact ? 40 : 48;
    const x = w / 2 - bw / 2, y = compact ? 8 : 12;
    // scoreboard
    ctx.save();
    ctx.fillStyle = "rgba(8,10,20,0.82)";
    this.rr(x, y, bw, bh, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(233,185,73,0.55)";
    ctx.lineWidth = 1.5;
    this.rr(x, y, bw, bh, 12);
    ctx.stroke();
    const mid = x + bw / 2;
    const fs = compact ? 14 : 16;
    ctx.textBaseline = "middle";
    ctx.font = `800 ${fs}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle = "#f4f7fb";
    ctx.fillText(o.names[0], mid - (compact ? 46 : 54), y + bh / 2);
    ctx.textAlign = "left";
    ctx.fillText(o.names[1], mid + (compact ? 46 : 54), y + bh / 2);
    // badges
    for (const t of [0, 1]) {
      ctx.fillStyle = KIT[t].shirt;
      ctx.beginPath();
      ctx.arc(t === 0 ? x + 18 : x + bw - 18, y + bh / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = "center";
    ctx.font = `900 ${compact ? 22 : 26}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = "#f5d98a";
    ctx.fillText(`${v.score[0]}  ${v.score[1]}`, mid, y + bh / 2 + 1);
    // clock
    const clk = `${v.minute}'`;
    ctx.fillStyle = "rgba(8,10,20,0.82)";
    this.rr(mid - 34, y + bh + 4, 68, 22, 8);
    ctx.fill();
    ctx.fillStyle = "#cfd6e0";
    ctx.font = "700 13px Inter, system-ui, sans-serif";
    ctx.fillText(v.phase === "half" ? "HT" : v.phase === "full" ? "FT" : clk, mid, y + bh + 15);
    ctx.restore();

    // stamina for my controlled player
    const me = v.ctrl[o.myTeam] >= 0 ? v.players[v.ctrl[o.myTeam]] : null;
    if (me && v.phase !== "full") {
      const sx = 16, sy = h - (o.touch ? 18 : 28);
      ctx.fillStyle = "rgba(8,10,20,0.7)";
      this.rr(sx, sy - 12, 112, 18, 8);
      ctx.fill();
      ctx.fillStyle = me.stam > 0.25 ? "#52e0a1" : "#ff5d73";
      this.rr(sx + 4, sy - 8, 104 * me.stam, 10, 5);
      ctx.fill();
      ctx.fillStyle = "#f4f7fb";
      ctx.font = "700 10px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("STAMINA", sx + 8, sy - 20);
    }

    this.drawRadar(v, o);

    // banners
    let by = y + bh + 40;
    for (const b of this.banners) {
      const p = b.t / b.max;
      const a = p < 0.12 ? p / 0.12 : p > 0.8 ? (1 - p) / 0.2 : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, a);
      if (b.big) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#f5d98a";
        ctx.font = `900 ${compact ? 40 : 60}px Inter, system-ui, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 12;
        ctx.fillText(b.text, w / 2, h * 0.42);
      } else {
        ctx.font = "800 15px Inter, system-ui, sans-serif";
        const tw = ctx.measureText(b.text).width + 36;
        ctx.fillStyle = "rgba(8,10,20,0.8)";
        this.rr(w / 2 - tw / 2, by, tw, b.sub ? 40 : 28, 10);
        ctx.fill();
        ctx.fillStyle = b.color ?? "#f5d98a";
        ctx.fillRect(w / 2 - tw / 2, by + 6, 3, (b.sub ? 40 : 28) - 12);
        ctx.textAlign = "center";
        ctx.fillStyle = "#f4f7fb";
        ctx.fillText(b.text, w / 2, by + 14);
        if (b.sub) {
          ctx.font = "600 11px Inter, system-ui, sans-serif";
          ctx.fillStyle = "#cfd6e0";
          ctx.fillText(b.sub, w / 2, by + 30);
        }
        by += b.sub ? 46 : 34;
      }
      ctx.restore();
    }

    // goal text
    if (this.goalText) {
      const g = this.goalText;
      const p = 1 - g.t / 3.4;
      const pop = Math.min(1, p / 0.12);
      ctx.save();
      ctx.translate(w / 2, h * 0.4);
      ctx.scale(0.6 + 0.5 * pop + Math.sin(this.time * 8) * 0.01, 0.6 + 0.5 * pop);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `900 ${compact ? 64 : 110}px Inter, system-ui, sans-serif`;
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(8,10,20,0.9)";
      ctx.strokeText("GOAL!", 0, 0);
      const gr = ctx.createLinearGradient(0, -50, 0, 50);
      gr.addColorStop(0, "#fff4c2");
      gr.addColorStop(1, KIT[g.team].shirt);
      ctx.fillStyle = gr;
      ctx.fillText("GOAL!", 0, 0);
      ctx.font = `800 ${compact ? 16 : 22}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = "#f4f7fb";
      ctx.lineWidth = 4;
      ctx.strokeText(`${o.names[g.team]}  ${g.minute}'`, 0, compact ? 46 : 70);
      ctx.fillText(`${o.names[g.team]}  ${g.minute}'`, 0, compact ? 46 : 70);
      ctx.restore();
    }

    // phase text
    if (v.phase === "kickoff" && v.phaseT > 0) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(8,10,20,0.7)";
      this.rr(w / 2 - 150, h * 0.62, 300, 54, 14);
      ctx.fill();
      ctx.fillStyle = "#f5d98a";
      ctx.font = "900 20px Inter, system-ui, sans-serif";
      ctx.fillText(v.half === 2 ? "SECOND HALF" : "KICK-OFF", w / 2, h * 0.62 + 22);
      ctx.fillStyle = "#cfd6e0";
      ctx.font = "600 12px Inter, system-ui, sans-serif";
      ctx.fillText(o.myTeam === 0 ? "You play in gold, attacking right" : "You play in teal, attacking right", w / 2, h * 0.62 + 40);
      ctx.restore();
    }
  }

  private drawRadar(v: View, o: DrawOpts) {
    const ctx = this.ctx;
    const rw = o.w < 700 ? 130 : 170;
    const rh = rw * (H / W);
    const rx = o.w / 2 - rw / 2;
    const ry = o.h - rh - (o.touch ? 10 : 16);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(8,30,16,0.7)";
    this.rr(rx, ry, rw, rh, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.beginPath(); ctx.moveTo(rx + rw / 2, ry); ctx.lineTo(rx + rw / 2, ry + rh); ctx.stroke();
    const mapX = (x: number) => rx + (o.flip ? 1 - x / W : x / W) * rw;
    const mapY = (y: number) => ry + (o.flip ? 1 - y / H : y / H) * rh;
    for (const p of v.players) {
      ctx.fillStyle = KIT[p.team].shirt;
      ctx.beginPath(); ctx.arc(mapX(p.x), mapY(p.y), 2.6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(mapX(v.ball.x), mapY(v.ball.y), 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  private rr(x: number, y: number, w: number, h: number, r: number) {
    const c = this.ctx;
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
}
