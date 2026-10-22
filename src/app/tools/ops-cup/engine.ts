/**
 * OpsGrit Cup match engine. Pure TypeScript, no DOM. One Match is the single source of truth:
 * it runs on the host (or on the only device in a solo game) and can be packed into compact snapshots for the guest.
 */

/* ------------------------------------------------------------------ pitch */
export const W = 1400;
export const H = 880;
export const PR = 12; // player radius
export const BR = 8; // ball radius
export const GOAL_W = 150; // distance between the posts
export const GOAL_Y0 = (H - GOAL_W) / 2;
export const GOAL_Y1 = GOAL_Y0 + GOAL_W;
export const GOAL_DEPTH = 58;
export const CROSSBAR = 64;
export const BOX_D = 230;
export const BOX_W = 520;
export const SIX_D = 92;
export const SIX_W = 250;
export const HALF_SECONDS = 100; // real seconds per half; shown as 45 minutes each
export const MATCH_SECONDS = HALF_SECONDS * 2;

export type Role = "GK" | "DL" | "DR" | "ML" | "MR" | "ST";
export const ROLES: Role[] = ["GK", "DL", "DR", "ML", "MR", "ST"];
const FORMATION: Record<Role, [number, number]> = {
  GK: [0.035, 0.5],
  DL: [0.2, 0.3],
  DR: [0.2, 0.7],
  ML: [0.43, 0.26],
  MR: [0.43, 0.74],
  ST: [0.6, 0.5],
};
const NUMBERS = [1, 4, 5, 8, 10, 9];

export type Phase = "kickoff" | "play" | "goal" | "restart" | "half" | "full";
export type RestartKind = "throw" | "goalkick" | "corner";

export interface Input {
  mx: number;
  my: number;
  sprint: boolean;
  shoot: boolean; // held
  pass: number; // counters: a change means a new press
  tackle: number;
  sw: number;
}
export const blankInput = (): Input => ({ mx: 0, my: 0, sprint: false, shoot: false, pass: 0, tackle: 0, sw: 0 });

export interface GameEvent {
  id: number;
  k: string; // kick, pass, shot, tackle, save, post, goal, whistle, out, bounce, half, full, corner, throw, goalkick, net, streak
  team?: number;
  a?: number; // intensity or minute
  x?: number;
  y?: number;
}

export interface Player {
  id: number;
  team: 0 | 1;
  role: Role;
  num: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  face: number;
  stamina: number;
  sprint: boolean;
  step: number; // distance travelled, drives the running animation
  tackleT: number;
  tackleCd: number;
  stunT: number;
  kickT: number;
  pickCd: number;
  diveT: number;
  diveDir: number;
  holdT: number; // goalkeeper holding the ball
  skill: number;
  tx: number;
  ty: number;
  think: number;
  runPhase: number;
}

export interface Ball {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  spin: number;
}

interface Ctl {
  input: Input;
  lastPass: number;
  lastTackle: number;
  lastSw: number;
  charge: number;
  wasShoot: boolean;
  ctrl: number;
  swCd: number;
}

export interface Stats {
  poss: [number, number];
  shots: [number, number];
  sot: [number, number];
  pass: [number, number];
  passOk: [number, number];
  tackles: [number, number];
  saves: [number, number];
}

export type Difficulty = "easy" | "normal" | "hard";
const DIFF: Record<Difficulty, { speed: number; gk: number; aim: number; react: number; tackle: number }> = {
  easy: { speed: 0.88, gk: 0.55, aim: 0.55, react: 0.32, tackle: 0.45 },
  normal: { speed: 0.97, gk: 0.78, aim: 0.8, react: 0.2, tackle: 0.7 },
  hard: { speed: 1.05, gk: 0.93, aim: 0.95, react: 0.12, tackle: 0.9 },
};

/* ------------------------------------------------------------------ helpers */
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const hyp = Math.hypot;
const dirOf = (team: number) => (team === 0 ? 1 : -1);
const goalLineX = (team: number) => (team === 0 ? W : 0); // the goal this team attacks
const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
};
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);

export interface MatchOptions {
  humans: [boolean, boolean];
  difficulty?: Difficulty;
}

/* ------------------------------------------------------------------ match */
export class Match {
  players: Player[] = [];
  ball: Ball = { x: W / 2, y: H / 2, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };
  owner = -1;
  lastTouch = -1;
  phase: Phase = "kickoff";
  phaseT = 2.4;
  clock = 0;
  half = 1;
  score: [number, number] = [0, 0];
  goalTeam = -1;
  kickoffTeam = 0;
  restart: { kind: RestartKind; team: number; taker: number; x: number; y: number; t: number } | null = null;
  stats: Stats = { poss: [0, 0], shots: [0, 0], sot: [0, 0], pass: [0, 0], passOk: [0, 0], tackles: [0, 0], saves: [0, 0] };
  events: GameEvent[] = [];
  evId = 0;
  ctl: [Ctl | null, Ctl | null] = [null, null];
  diff: Difficulty;
  passTeam = -1;
  passTarget = -1;
  streak = [0, 0];
  time = 0;
  private lastSnapPhase: Phase = "kickoff";

  constructor(public opts: MatchOptions) {
    this.diff = opts.difficulty ?? "normal";
    for (const team of [0, 1] as const) {
      ROLES.forEach((role, i) => {
        this.players.push({
          id: team * 6 + i, team, role, num: NUMBERS[i], x: 0, y: 0, vx: 0, vy: 0,
          face: team === 0 ? 0 : Math.PI, stamina: 1, sprint: false, step: rnd(0, 20),
          tackleT: 0, tackleCd: 0, stunT: 0, kickT: 0, pickCd: 0, diveT: 0, diveDir: 0, holdT: 0,
          skill: rnd(0.7, 1), tx: 0, ty: 0, think: rnd(0, 0.2), runPhase: rnd(0, 6.28),
        });
      });
    }
    for (let t = 0; t < 2; t++) {
      if (this.opts.humans[t]) {
        this.ctl[t] = { input: blankInput(), lastPass: 0, lastTackle: 0, lastSw: 0, charge: 0, wasShoot: false, ctrl: t * 6 + 5, swCd: 0 };
      }
    }
    this.setupKickoff(0);
  }

  /* ---------- API ---------- */
  setInput(team: number, input: Input) {
    const c = this.ctl[team];
    if (c) c.input = input;
  }

  controlled(team: number): number {
    return this.ctl[team]?.ctrl ?? -1;
  }

  charge(team: number): number {
    return this.ctl[team]?.charge ?? 0;
  }

  minute(): number {
    return Math.min(90, Math.floor((this.clock / MATCH_SECONDS) * 90));
  }

  emit(k: string, extra: Partial<GameEvent> = {}) {
    this.events.push({ id: ++this.evId, k, ...extra });
    if (this.events.length > 24) this.events.shift();
  }

  /* ---------- setup ---------- */
  private homePos(p: Player, kickoff = false): [number, number] {
    const [fx, fy] = FORMATION[p.role];
    let u = fx * W;
    const v = fy * H;
    if (kickoff) u = Math.min(u, W / 2 - 40);
    return p.team === 0 ? [u, v] : [W - u, H - v];
  }

  setupKickoff(team: number) {
    this.kickoffTeam = team;
    for (const p of this.players) {
      const [x, y] = this.homePos(p, true);
      p.x = x; p.y = y; p.vx = p.vy = 0;
      p.face = p.team === 0 ? 0 : Math.PI;
      p.tackleT = p.stunT = p.kickT = p.diveT = p.pickCd = p.holdT = 0;
      p.stamina = Math.max(p.stamina, 0.7);
    }
    const taker = this.players[team * 6 + 5];
    taker.x = team === 0 ? W / 2 - 22 : W / 2 + 22;
    taker.y = H / 2;
    this.ball = { x: W / 2, y: H / 2, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };
    this.owner = taker.id;
    this.lastTouch = taker.id;
    this.restart = null;
    this.phase = "kickoff";
    this.phaseT = 2.2;
    this.passTeam = -1;
    for (let t = 0; t < 2; t++) {
      const c = this.ctl[t];
      if (c) c.ctrl = t * 6 + 5;
    }
  }

  /* ---------- main step ---------- */
  step(dt: number) {
    this.time += dt;
    if (this.phase === "full") {
      this.moveIdle(dt);
      this.ballPhysics(dt);
      return;
    }
    this.phaseT -= dt;

    if (this.phase === "kickoff") {
      this.runPlayers(dt, true);
      this.holdBallWithOwner(dt);
      if (this.phaseT <= 0) {
        this.phase = "play";
        this.emit("whistle");
      }
      return;
    }
    if (this.phase === "half") {
      this.moveIdle(dt);
      if (this.phaseT <= 0) {
        this.half = 2;
        this.setupKickoff(1);
      }
      return;
    }
    if (this.phase === "goal") {
      this.runPlayers(dt, true);
      this.ballPhysics(dt);
      if (this.phaseT <= 0) this.setupKickoff(this.goalTeam === 0 ? 1 : 0);
      return;
    }

    // play and restart
    if (this.phase === "play") {
      this.clock += dt;
      this.stats.poss[this.owner >= 0 ? this.players[this.owner].team : this.lastTouch >= 0 ? this.players[this.lastTouch].team : 0] += dt;
      if (this.half === 1 && this.clock >= HALF_SECONDS) {
        this.phase = "half";
        this.phaseT = 3.4;
        this.emit("half");
        return;
      }
      if (this.clock >= MATCH_SECONDS) {
        this.clock = MATCH_SECONDS;
        this.phase = "full";
        this.phaseT = 99;
        this.owner = -1;
        this.emit("full");
        return;
      }
    }
    this.updateControllers(dt);
    this.runPlayers(dt, false);
    if (this.phase === "restart") this.stepRestart(dt);
    this.ballPhysics(dt);
    if (this.phase === "play") {
      this.pickups();
      this.rules();
    }
  }

  private moveIdle(dt: number) {
    for (const p of this.players) {
      p.vx *= 0.9; p.vy *= 0.9;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }

  /* ---------- controllers (human) ---------- */
  private updateControllers(dt: number) {
    for (let t = 0; t < 2; t++) {
      const c = this.ctl[t];
      if (!c) continue;
      c.swCd -= dt;
      const cur = this.players[c.ctrl];
      const ownerP = this.owner >= 0 ? this.players[this.owner] : null;
      const wantManual = c.input.sw !== c.lastSw;
      c.lastSw = c.input.sw;
      const nearest = (exclude = -1, skipGK = true) => {
        let best = -1;
        let bd = 1e9;
        for (const p of this.players) {
          if (p.team !== t || p.id === exclude || (skipGK && p.role === "GK")) continue;
          const d = hyp(p.x - this.ball.x, p.y - this.ball.y);
          if (d < bd) { bd = d; best = p.id; }
        }
        return best;
      };
      if (wantManual) {
        // Switch to the teammate best placed to win the ball.
        const n = nearest(c.ctrl);
        if (n >= 0) c.ctrl = n;
        c.swCd = 0.35;
        continue;
      }
      if (ownerP && ownerP.team === t && ownerP.role !== "GK") {
        c.ctrl = ownerP.id;
      } else if (this.passTarget >= 0 && this.players[this.passTarget].team === t && this.owner < 0) {
        c.ctrl = this.passTarget;
      } else if (c.swCd <= 0) {
        const n = nearest();
        if (n >= 0 && n !== c.ctrl) {
          const dn = hyp(this.players[n].x - this.ball.x, this.players[n].y - this.ball.y);
          const dc = hyp(cur.x - this.ball.x, cur.y - this.ball.y);
          if (dn + 40 < dc || cur.role === "GK") {
            c.ctrl = n;
            c.swCd = 0.4;
          }
        }
      }
      if (this.players[c.ctrl].role === "GK") c.ctrl = nearest();
    }
  }

  /* ---------- players ---------- */
  private runPlayers(dt: number, frozen: boolean) {
    const teamBall = [this.teamHasBall(0), this.teamHasBall(1)];
    // chasers per team (closest outfield players to the predicted ball)
    const chasers: number[][] = [[], []];
    const bx = this.ball.x + this.ball.vx * 0.22;
    const by = this.ball.y + this.ball.vy * 0.22;
    for (let t = 0; t < 2; t++) {
      chasers[t] = this.players
        .filter((p) => p.team === t && p.role !== "GK")
        .sort((a, b) => hyp(a.x - bx, a.y - by) - hyp(b.x - bx, b.y - by))
        .map((p) => p.id);
    }

    for (const p of this.players) {
      p.tackleCd = Math.max(0, p.tackleCd - dt);
      p.stunT = Math.max(0, p.stunT - dt);
      p.kickT = Math.max(0, p.kickT - dt);
      p.pickCd = Math.max(0, p.pickCd - dt);
      p.diveT = Math.max(0, p.diveT - dt);
      p.think -= dt;
      const c = this.ctl[p.team];
      const human = c && c.ctrl === p.id && p.role !== "GK";

      let desX = 0, desY = 0, speedMul = 1, sprint = false;
      if (p.tackleT > 0) {
        p.tackleT -= dt;
        desX = Math.cos(p.face) * 330;
        desY = Math.sin(p.face) * 330;
        if (p.tackleT <= 0) p.stunT = Math.max(p.stunT, 0.3);
        this.tackleContact(p);
        this.applyVelocity(p, desX, desY, dt, 3600);
        this.advance(p, dt);
        continue;
      }
      if (p.stunT > 0 || frozen && this.owner === p.id && this.phase === "kickoff") {
        this.applyVelocity(p, 0, 0, dt, 1800);
        this.advance(p, dt);
        continue;
      }
      if (p.diveT > 0) {
        desX = 0;
        desY = p.tx; // dive speed, set by the goalkeeper
        this.applyVelocity(p, desX, desY, dt, 6000);
        this.advance(p, dt);
        continue;
      }

      if (frozen) {
        // celebrate or wait in position
        const [hx, hy] = this.phase === "kickoff" ? this.homePos(p, true) : [p.x, p.y];
        const target = this.phase === "kickoff" ? [p.id === this.owner ? p.x : hx, p.id === this.owner ? p.y : hy] : [p.x, p.y];
        this.moveTo(p, target[0], target[1], 0.6, dt);
        continue;
      }

      if (human) {
        const i = c!.input;
        const m = hyp(i.mx, i.my);
        const wantSprint = i.sprint && p.stamina > 0.04 && m > 0.2;
        sprint = wantSprint;
        const top = (wantSprint ? 214 : 176) * (this.owner === p.id ? 0.94 : 1);
        if (m > 0.12) {
          desX = (i.mx / Math.max(1, m)) * top * Math.min(1, m);
          desY = (i.my / Math.max(1, m)) * top * Math.min(1, m);
        }
        this.applyVelocity(p, desX, desY, dt, 1500);
        // human actions
        this.humanActions(p, c!, dt);
      } else if (p.role === "GK") {
        this.goalkeeper(p, dt);
        continue;
      } else {
        const r = this.outfieldAI(p, dt, teamBall, chasers);
        if (r) { desX = r.x; desY = r.y; sprint = r.sprint; }
        const top = ((sprint ? 214 : 176) * DIFF[this.diff].speed) * (this.owner === p.id ? 0.94 : 1) * (this.opts.humans[p.team] ? 0.97 : 1);
        const m = hyp(desX, desY);
        if (m > 1) {
          const k = Math.min(1, m / top) * top / m;
          desX *= k; desY *= k;
        }
        this.applyVelocity(p, desX, desY, dt, 1400);
      }
      p.sprint = sprint;
      p.stamina = clamp(p.stamina + (sprint ? -0.34 : 0.14) * dt, 0, 1);
      this.advance(p, dt);
    }
    this.separate();
  }

  private applyVelocity(p: Player, dx: number, dy: number, dt: number, accel: number) {
    const ax = dx - p.vx;
    const ay = dy - p.vy;
    const m = hyp(ax, ay);
    const maxD = accel * dt;
    if (m > maxD) {
      p.vx += (ax / m) * maxD;
      p.vy += (ay / m) * maxD;
    } else {
      p.vx = dx;
      p.vy = dy;
    }
  }

  private advance(p: Player, dt: number) {
    p.x = clamp(p.x + p.vx * dt, 10, W - 10);
    p.y = clamp(p.y + p.vy * dt, 10, H - 10);
    const sp = hyp(p.vx, p.vy);
    p.step += sp * dt;
    if (sp > 30 && p.tackleT <= 0 && p.diveT <= 0) {
      const want = Math.atan2(p.vy, p.vx);
      const d = angDiff(want, p.face);
      const turn = 13 * dt;
      p.face += clamp(d, -turn, turn);
    }
  }

  private moveTo(p: Player, tx: number, ty: number, mul: number, dt: number) {
    const dx = tx - p.x;
    const dy = ty - p.y;
    const d = hyp(dx, dy);
    const top = 176 * mul;
    const slow = clamp(d / 70, 0, 1);
    this.applyVelocity(p, d > 1 ? (dx / d) * top * slow : 0, d > 1 ? (dy / d) * top * slow : 0, dt, 1400);
    this.advance(p, dt);
  }

  private separate() {
    const ps = this.players;
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = hyp(dx, dy);
        const min = PR * 1.7;
        if (d < min && d > 0.001) {
          const push = (min - d) * 0.5;
          const nx = dx / d, ny = dy / d;
          a.x -= nx * push; a.y -= ny * push;
          b.x += nx * push; b.y += ny * push;
        }
      }
    }
  }

  private teamHasBall(t: number) {
    return this.owner >= 0 && this.players[this.owner].team === t;
  }

  /* ---------- human actions ---------- */
  private humanActions(p: Player, c: Ctl, dt: number) {
    const i = c.input;
    const canKick = this.canKick(p);
    // charging a shot
    if (i.shoot && canKick) c.charge = Math.min(1, c.charge + dt / 0.85);
    else if (!i.shoot && c.wasShoot && c.charge > 0 && canKick) {
      this.shoot(p, i.mx, i.my, Math.max(0.12, c.charge), true);
      c.charge = 0;
    } else if (!i.shoot) c.charge = 0;
    else if (i.shoot && !canKick) c.charge = Math.max(0, c.charge - dt * 2);
    c.wasShoot = i.shoot;

    if (i.pass !== c.lastPass) {
      c.lastPass = i.pass;
      if (canKick) this.passBall(p, i.mx, i.my, true);
    }
    if (i.tackle !== c.lastTackle) {
      c.lastTackle = i.tackle;
      this.startTackle(p);
    }
  }

  private canKick(p: Player): boolean {
    if (this.owner === p.id) return true;
    if (this.owner >= 0) return false;
    const b = this.ball;
    return b.z < 40 && hyp(b.x - p.x, b.y - p.y) < PR + BR + 16 && p.kickT <= 0;
  }

  /* ---------- kicks ---------- */
  private release(p: Player) {
    if (this.owner === p.id) this.owner = -1;
    p.pickCd = 0.32;
    p.kickT = 0.28;
    this.lastTouch = p.id;
    this.restartRelease(p);
  }

  private restartRelease(p: Player) {
    if (this.phase === "restart" && this.restart && this.restart.taker === p.id) {
      this.restart = null;
      this.phase = "play";
      this.emit("whistle", { a: 1 });
    }
  }

  shoot(p: Player, mx: number, my: number, charge: number, human: boolean) {
    const b = this.ball;
    let ang = hyp(mx, my) > 0.2 ? Math.atan2(my, mx) : p.face;
    const dir = dirOf(p.team);
    const gx = goalLineX(p.team);
    const dGoal = Math.abs(gx - p.x);
    // aim assist near goal: nudge towards the goal mouth (angles measured relative to the goal centre)
    if (dGoal < 520 && Math.cos(ang) * dir > 0.25) {
      const base = Math.atan2(H / 2 - p.y, gx - p.x);
      const a0 = angDiff(Math.atan2(GOAL_Y0 + 16 - p.y, gx - p.x), base);
      const a1 = angDiff(Math.atan2(GOAL_Y1 - 16 - p.y, gx - p.x), base);
      const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
      let off = angDiff(ang, base);
      if (off > lo - 0.38 && off < hi + 0.38) {
        off = clamp(off, lo + 0.03, hi - 0.03);
        ang = base + off;
      }
    }
    const aimSkill = human ? 0.88 : DIFF[this.diff].aim;
    const err = (1 - aimSkill * p.skill) * 0.24 + (1 - charge) * 0.015 + (p.sprint ? 0.03 : 0);
    ang += rnd(-err, err);
    const speed = 380 + 640 * charge;
    b.vx = Math.cos(ang) * speed;
    b.vy = Math.sin(ang) * speed;
    b.vz = charge > 0.6 ? 50 + 210 * ((charge - 0.6) / 0.4) : 22;
    b.spin = rnd(-1, 1) * 6;
    b.z = Math.max(b.z, 2);
    this.release(p);
    p.face = ang;
    this.passTarget = -1;
    this.passTeam = -1;
    const towards = Math.cos(ang) * dir > 0.3 && dGoal < 620;
    if (towards) {
      this.stats.shots[p.team]++;
      const t = (gx - b.x) / (Math.cos(ang) * speed || 1);
      const yAt = b.y + Math.sin(ang) * speed * t;
      if (yAt > GOAL_Y0 - 12 && yAt < GOAL_Y1 + 12) this.stats.sot[p.team]++;
      this.emit("shot", { team: p.team, a: charge, x: b.x, y: b.y });
    } else this.emit("kick", { team: p.team, a: charge, x: b.x, y: b.y });
  }

  bestTarget(p: Player, ax: number, ay: number, hasAim: boolean, ai = false): Player | null {
    const dir = dirOf(p.team);
    let best: Player | null = null;
    let bs = -1e9;
    const aimLen = hyp(ax, ay);
    for (const t of this.players) {
      if (t.team !== p.team || t.id === p.id) continue;
      const dx = t.x - p.x, dy = t.y - p.y;
      const d = hyp(dx, dy);
      if (d < 70 || d > 940) continue;
      let s = 0;
      if (hasAim && aimLen > 0.2) {
        const cos = (dx * ax + dy * ay) / (d * aimLen);
        if (cos < 0.3) continue;
        s += cos * 110;
      } else {
        s += (dx * dir) / d * 45 + 30;
      }
      s -= Math.abs(d - 340) * 0.06;
      if (t.role === "GK") s -= 40;
      // blocked lane?
      let minOpp = 1e9;
      for (const o of this.players) {
        if (o.team === p.team) continue;
        const l2 = d * d;
        const u = clamp(((o.x - p.x) * dx + (o.y - p.y) * dy) / l2, 0, 1);
        const px = p.x + dx * u, py = p.y + dy * u;
        minOpp = Math.min(minOpp, hyp(o.x - px, o.y - py));
        // opponent right next to the receiver
        if (u > 0.85) minOpp = Math.min(minOpp, hyp(o.x - t.x, o.y - t.y) * 0.9);
      }
      s += minOpp < 30 ? -70 : Math.min(30, minOpp * 0.25);
      if (ai) s += Math.abs(t.x - goalLineX(p.team)) < Math.abs(p.x - goalLineX(p.team)) ? 14 : -6;
      if (s > bs) { bs = s; best = t; }
    }
    return bs > -25 ? best : null;
  }

  passBall(p: Player, mx: number, my: number, human: boolean, forced?: Player | null) {
    const b = this.ball;
    const hasAim = hyp(mx, my) > 0.25;
    const t = forced ?? this.bestTarget(p, mx, my, hasAim);
    let ang: number;
    let speed: number;
    let vz = 0;
    let target = -1;
    if (t) {
      const dx = t.x - p.x, dy = t.y - p.y;
      const d = hyp(dx, dy);
      speed = clamp(280 + d * 1.15, 340, 800);
      const tt = d / speed;
      const lx = t.x + t.vx * tt * 0.8, ly = t.y + t.vy * tt * 0.8;
      ang = Math.atan2(ly - p.y, lx - p.x);
      if (d > 520) vz = 120 + d * 0.12;
      target = t.id;
    } else {
      ang = hasAim ? Math.atan2(my, mx) : p.face;
      speed = 520;
    }
    const err = human ? 0.02 : (1 - DIFF[this.diff].aim * p.skill) * 0.08;
    ang += rnd(-err, err);
    b.vx = Math.cos(ang) * speed;
    b.vy = Math.sin(ang) * speed;
    b.vz = vz;
    b.spin = 0;
    this.release(p);
    p.face = ang;
    this.passTeam = p.team;
    this.passTarget = target;
    this.stats.pass[p.team]++;
    this.emit("pass", { team: p.team, x: b.x, y: b.y });
  }

  private startTackle(p: Player) {
    if (p.tackleCd > 0 || p.stunT > 0 || p.tackleT > 0) return;
    if (this.owner === p.id) return;
    p.tackleT = 0.26;
    p.tackleCd = 1.15;
    // face the ball carrier or the ball if close
    const target = this.owner >= 0 && this.players[this.owner].team !== p.team ? this.players[this.owner] : null;
    const tx = target ? target.x : this.ball.x;
    const ty = target ? target.y : this.ball.y;
    if (hyp(tx - p.x, ty - p.y) < 90) p.face = Math.atan2(ty - p.y, tx - p.x);
    this.emit("slide", { team: p.team, x: p.x, y: p.y });
  }

  private tackleContact(p: Player) {
    const b = this.ball;
    if (this.owner >= 0) {
      const o = this.players[this.owner];
      if (o.team !== p.team && hyp(o.x - p.x, o.y - p.y) < PR * 2.3) {
        const facing = Math.cos(angDiff(Math.atan2(o.y - p.y, o.x - p.x), p.face)) > 0.3;
        const chance = (facing ? 0.78 : 0.3) * (this.opts.humans[p.team] ? 1 : DIFF[this.diff].tackle) + (o.skill < 0.82 ? 0.08 : 0);
        p.tackleT = 0;
        p.stunT = 0.35;
        if (Math.random() < chance) {
          this.owner = -1;
          const a = p.face + rnd(-0.5, 0.5);
          b.vx = Math.cos(a) * 240; b.vy = Math.sin(a) * 240; b.vz = 40;
          o.stunT = 0.55;
          o.pickCd = 0.5;
          p.pickCd = 0;
          this.lastTouch = p.id;
          this.stats.tackles[p.team]++;
          this.passTeam = -1;
          this.emit("tackle", { team: p.team, x: o.x, y: o.y });
        } else {
          this.emit("miss", { team: p.team, x: p.x, y: p.y });
        }
        return;
      }
    } else if (b.z < 24 && hyp(b.x - p.x, b.y - p.y) < PR + BR + 10) {
      // poking a loose ball away
      const a = p.face;
      b.vx = Math.cos(a) * 360; b.vy = Math.sin(a) * 360;
      this.lastTouch = p.id;
      p.tackleT = 0;
      p.stunT = 0.25;
      this.emit("kick", { team: p.team, a: 0.3, x: b.x, y: b.y });
    }
  }

  /* ---------- ball ---------- */
  private holdBallWithOwner(dt: number) {
    if (this.owner < 0) return;
    const p = this.players[this.owner];
    const b = this.ball;
    const off = PR + BR + 1;
    b.x = p.x + Math.cos(p.face) * off;
    b.y = p.y + Math.sin(p.face) * off;
    b.vx = p.vx; b.vy = p.vy; b.z = 0; b.vz = 0;
    void dt;
  }

  private ballPhysics(dt: number) {
    const b = this.ball;
    if (this.owner >= 0 && (this.phase === "play" || this.phase === "restart" || this.phase === "kickoff")) {
      const p = this.players[this.owner];
      const sp = hyp(p.vx, p.vy);
      const wob = Math.sin(p.step * 0.09) * (sp > 20 ? 4 : 0);
      const lead = PR + BR + 1 + (p.sprint ? 7 : 2) + wob;
      const tx = p.x + Math.cos(p.face) * lead;
      const ty = p.y + Math.sin(p.face) * lead;
      b.x += (tx - b.x) * Math.min(1, dt * 22);
      b.y += (ty - b.y) * Math.min(1, dt * 22);
      b.vx = p.vx; b.vy = p.vy; b.z = 0; b.vz = 0;
      b.spin = sp * 0.05;
      return;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vz -= 900 * dt;
    b.z += b.vz * dt;
    if (b.z <= 0) {
      b.z = 0;
      if (b.vz < -70) {
        b.vz = -b.vz * 0.52;
        b.vx *= 0.93; b.vy *= 0.93;
        if (b.vz > 110) this.emit("bounce", { a: Math.min(1, b.vz / 300), x: b.x, y: b.y });
      } else b.vz = 0;
    }
    if (b.z === 0) {
      const sp = hyp(b.vx, b.vy);
      const k = Math.exp(-0.8 * dt);
      let ns = sp * k - 28 * dt;
      if (ns < 4) ns = 0;
      if (sp > 0) { b.vx *= ns / sp; b.vy *= ns / sp; }
    } else {
      const k = Math.exp(-0.14 * dt);
      b.vx *= k; b.vy *= k;
    }
    b.spin *= Math.exp(-1.5 * dt);

    // goal frame
    this.goalFrame();
  }

  private goalFrame() {
    const b = this.ball;
    // posts
    for (const gx of [0, W]) {
      for (const gy of [GOAL_Y0, GOAL_Y1]) {
        const dx = b.x - gx, dy = b.y - gy;
        const d = hyp(dx, dy);
        const min = BR + 4;
        if (d < min && d > 0.001 && b.z < CROSSBAR + 10) {
          const nx = dx / d, ny = dy / d;
          const dot = b.vx * nx + b.vy * ny;
          if (dot < 0) {
            b.vx -= 1.75 * dot * nx;
            b.vy -= 1.75 * dot * ny;
            b.x = gx + nx * min; b.y = gy + ny * min;
            this.emit("post", { a: Math.min(1, Math.abs(dot) / 600), x: gx, y: gy });
            this.lastTouchKeep();
          }
        }
      }
    }
    // inside the net: walls
    for (const side of [0, 1]) {
      const inNet = side === 0 ? b.x < 0 : b.x > W;
      if (!inNet) continue;
      if (b.y > GOAL_Y0 && b.y < GOAL_Y1 && b.z < CROSSBAR + 10) {
        const back = side === 0 ? -GOAL_DEPTH : W + GOAL_DEPTH;
        if ((side === 0 && b.x < back + BR) || (side === 1 && b.x > back - BR)) {
          b.x = side === 0 ? back + BR : back - BR;
          b.vx *= -0.12;
          b.vy *= 0.4;
          this.emit("net", { team: side === 0 ? 1 : 0, a: 0.6, x: b.x, y: b.y });
        }
        if (b.y < GOAL_Y0 + BR) { b.y = GOAL_Y0 + BR; b.vy = Math.abs(b.vy) * 0.2; }
        if (b.y > GOAL_Y1 - BR) { b.y = GOAL_Y1 - BR; b.vy = -Math.abs(b.vy) * 0.2; }
      }
    }
    // crossbar: ball coming down onto the bar
    for (const gx of [0, W]) {
      if (Math.abs(b.x - gx) < 6 && b.y > GOAL_Y0 && b.y < GOAL_Y1 && Math.abs(b.z - CROSSBAR) < 8 && Math.abs(b.vz) > 40) {
        b.vz = -b.vz * 0.6;
        b.z = CROSSBAR + (b.vz > 0 ? 9 : -9);
        b.vx *= 0.7;
        this.emit("post", { a: 0.8, x: gx, y: b.y });
      }
    }
  }

  private lastTouchKeep() { /* the last touch stays with the shooter */ }

  /* ---------- pickups ---------- */
  private pickups() {
    const b = this.ball;
    if (this.owner >= 0) return;
    let best: Player | null = null;
    let bd = 1e9;
    for (const p of this.players) {
      if (p.pickCd > 0 || p.stunT > 0 || p.tackleT > 0 || p.role === "GK") continue;
      const d = hyp(b.x - p.x, b.y - p.y);
      const reach = PR + BR + 5;
      if (d < reach && b.z < 26 && d < bd) { best = p; bd = d; }
    }
    if (!best) return;
    const rel = hyp(b.vx - best.vx, b.vy - best.vy);
    const lim = this.ctl[best.team] && this.ctl[best.team]!.ctrl === best.id ? 780 : 640 * (0.8 + 0.4 * best.skill);
    if (rel > lim) {
      // too hot to control: it rebounds off the player
      b.vx *= -0.35 + rnd(-0.1, 0.1); b.vy = b.vy * 0.5 + rnd(-90, 90);
      best.pickCd = 0.25;
      this.lastTouch = best.id;
      this.emit("deflect", { x: b.x, y: b.y });
      return;
    }
    this.takeBall(best);
  }

  private takeBall(p: Player) {
    this.owner = p.id;
    this.lastTouch = p.id;
    if (this.passTeam === p.team && this.passTarget >= 0) {
      this.stats.passOk[p.team]++;
      this.streak[p.team]++;
      this.streak[1 - p.team] = 0;
      if (this.streak[p.team] === 4 || this.streak[p.team] === 8) this.emit("streak", { team: p.team, a: this.streak[p.team] });
    } else if (this.passTeam >= 0 && this.passTeam !== p.team) {
      this.streak[this.passTeam] = 0;
    }
    this.passTeam = -1;
    this.passTarget = -1;
  }

  /* ---------- rules ---------- */
  private rules() {
    const b = this.ball;
    // goal
    for (const side of [0, 1]) {
      const crossed = side === 0 ? b.x < -BR : b.x > W + BR;
      if (!crossed) continue;
      if (b.y > GOAL_Y0 && b.y < GOAL_Y1 && b.z < CROSSBAR) {
        const scorer = side === 0 ? 1 : 0;
        this.score[scorer]++;
        this.goalTeam = scorer;
        this.phase = "goal";
        this.phaseT = 3.6;
        this.owner = -1;
        this.emit("goal", { team: scorer, a: this.minute(), x: side === 0 ? 0 : W, y: b.y });
        return;
      }
    }
    if (this.restartPending()) return;
    const last = this.lastTouch >= 0 ? this.players[this.lastTouch].team : 0;
    // sidelines
    if (b.y < -BR || b.y > H + BR) {
      this.setRestart("throw", 1 - last, clamp(b.x, 30, W - 30), b.y < 0 ? 4 : H - 4);
      return;
    }
    // end lines
    if (b.x < -BR || b.x > W + BR) {
      const side = b.x < 0 ? 0 : 1; // 0 = left end (defended by team 0)
      const defTeam = side;
      if (last === defTeam) {
        // attackers get a corner
        this.setRestart("corner", 1 - defTeam, side === 0 ? 6 : W - 6, b.y < H / 2 ? 6 : H - 6);
      } else {
        this.setRestart("goalkick", defTeam, side === 0 ? SIX_D - 20 : W - SIX_D + 20, H / 2 + (b.y < H / 2 ? -50 : 50));
      }
    }
  }

  private restartPending() {
    return this.phase !== "play";
  }

  private setRestart(kind: RestartKind, team: number, x: number, y: number) {
    this.owner = -1;
    this.streak = [0, 0];
    this.passTeam = -1;
    this.passTarget = -1;
    // taker
    let taker: Player | null = null;
    let bd = 1e9;
    for (const p of this.players) {
      if (p.team !== team) continue;
      if (kind === "goalkick") { if (p.role === "GK") taker = p; continue; }
      if (p.role === "GK") continue;
      const d = hyp(p.x - x, p.y - y);
      if (d < bd) { bd = d; taker = p; }
    }
    if (!taker) taker = this.players[team * 6 + 1];
    this.restart = { kind, team, taker: taker.id, x, y, t: kind === "goalkick" ? 1.4 : 1.7 };
    this.phase = "restart";
    this.ball = { x, y, z: 0, vx: 0, vy: 0, vz: 0, spin: 0 };
    taker.x = x + (kind === "throw" ? 0 : kind === "corner" ? (x < W / 2 ? 14 : -14) : 0);
    taker.y = y + (kind === "throw" ? (y < H / 2 ? 14 : -14) : kind === "corner" ? (y < H / 2 ? 14 : -14) : 0);
    taker.vx = taker.vy = 0;
    taker.face = Math.atan2(H / 2 - taker.y, W / 2 - taker.x);
    this.owner = taker.id;
    this.lastTouch = taker.id;
    this.emit(kind === "throw" ? "throw" : kind === "corner" ? "corner" : "goalkick", { team });
    const c = this.ctl[team];
    if (c && taker.role !== "GK") c.ctrl = taker.id;
    // clear space around the ball
    for (const p of this.players) {
      if (p.team !== team && hyp(p.x - x, p.y - y) < 130) {
        const a = Math.atan2(p.y - y, p.x - x);
        p.x = x + Math.cos(a) * 140;
        p.y = clamp(y + Math.sin(a) * 140, 20, H - 20);
        p.x = clamp(p.x, 20, W - 20);
      }
    }
  }

  private stepRestart(dt: number) {
    const r = this.restart;
    if (!r) { this.phase = "play"; return; }
    r.t -= dt;
    const taker = this.players[r.taker];
    taker.vx = taker.vy = 0;
    // the taker is held in place
    taker.x = clamp(taker.x, 8, W - 8);
    const humanTaker = this.ctl[r.team] && this.ctl[r.team]!.ctrl === r.taker;
    if (r.t <= 0 && !humanTaker || r.t <= -4) {
      // computer takes it
      if (r.kind === "goalkick") {
        const t = this.bestTarget(taker, Math.cos(taker.face), Math.sin(taker.face), true) ?? this.players[r.team * 6 + 1];
        this.passBall(taker, 0, 0, false, t);
        this.ball.vz = 150;
        this.ball.vx *= 1.05; this.ball.vy *= 1.05;
      } else if (r.kind === "corner") {
        const tx = r.x < W / 2 ? 150 : W - 150;
        const ang = Math.atan2(H / 2 + rnd(-60, 60) - taker.y, tx - taker.x);
        const sp = 620 + rnd(0, 80);
        this.ball.vx = Math.cos(ang) * sp; this.ball.vy = Math.sin(ang) * sp; this.ball.vz = 260;
        this.release(taker);
        this.emit("kick", { team: r.team, a: 0.6, x: this.ball.x, y: this.ball.y });
      } else {
        const t = this.bestTarget(taker, 0, 0, false);
        if (t) this.passBall(taker, 0, 0, false, t);
        else this.shoot(taker, Math.cos(taker.face), Math.sin(taker.face), 0.3, false);
      }
    }
  }

  /* ---------- goalkeeper AI ---------- */
  private goalkeeper(p: Player, dt: number) {
    const b = this.ball;
    const d = DIFF[this.diff];
    const goalX = p.team === 0 ? 0 : W;
    const inX = p.team === 0 ? 1 : -1;
    const ownBall = this.owner === p.id;

    if (ownBall) {
      p.holdT -= dt;
      if (this.phase === "play" && p.holdT <= 0) {
        const t = this.bestTarget(p, inX, 0, true, true) ?? this.players[p.team * 6 + 1 + Math.floor(rnd(0, 2))];
        this.passBall(p, 0, 0, false, t);
        if (hyp(t.x - p.x, t.y - p.y) > 300) this.ball.vz = Math.max(this.ball.vz, 170);
      }
      this.moveTo(p, p.x, p.y, 0.3, dt);
      return;
    }
    if (this.phase === "restart" && this.restart?.taker === p.id) { this.moveTo(p, p.x, p.y, 0.3, dt); return; }

    // where is the ball going?
    let predY = b.y;
    let threat = 0;
    const toward = (goalX - b.x) * b.vx > 0 || (b.vx === 0 && false);
    if (toward && Math.abs(b.vx) > 120 && this.owner < 0) {
      const t = (goalX - b.x) / b.vx;
      if (t > 0 && t < 1.6) {
        predY = b.y + b.vy * t;
        threat = t;
      }
    }
    let ty: number;
    let tx = goalX + inX * (36 + clamp(Math.abs(b.x - goalX) * 0.05, 0, 70));
    if (threat > 0 && predY > GOAL_Y0 - 30 && predY < GOAL_Y1 + 30) {
      ty = clamp(predY + (Math.random() - 0.5) * 0.0, GOAL_Y0 + 6, GOAL_Y1 - 6);
      // dive when it is close and quick enough that running will not do
      const dist = Math.abs(ty - p.y);
      const pp = p as unknown as { dived?: number };
      if (threat < 0.62 - d.react && dist > 24 && p.diveT <= 0 && p.kickT <= 0 && !pp.dived) {
        pp.dived = 1;
        const err = (1 - d.gk) * 110 * (Math.random() * 2 - 1);
        const aim = clamp(ty + err, GOAL_Y0 - 10, GOAL_Y1 + 10);
        const dd = aim - p.y;
        p.diveDir = Math.sign(dd) || 1;
        const dur = clamp(threat * 0.9, 0.12, 0.5);
        p.tx = clamp(dd / dur, -640, 640);
        p.diveT = dur;
        this.emit("dive", { team: p.team });
      }
    } else {
      // stay on the line between ball and goal centre
      const gy = H / 2;
      const f = clamp(Math.abs(b.x - goalX) / 520, 0.1, 0.6);
      ty = clamp(gy + (b.y - gy) * (0.3 + f * 0.4), GOAL_Y0 + 14, GOAL_Y1 - 14);
      (p as unknown as { dived?: number }).dived = 0;
    }
    // loose ball inside the box: come out for it
    if (this.owner < 0 && b.vx * b.vx + b.vy * b.vy < 160 * 160 && Math.abs(b.x - goalX) < BOX_D - 20 && Math.abs(b.y - H / 2) < BOX_W / 2 - 30) {
      const near = this.players.filter((q) => q.team === p.team && q.id !== p.id).every((q) => hyp(q.x - b.x, q.y - b.y) > hyp(p.x - b.x, p.y - b.y) - 10);
      const opp = this.players.filter((q) => q.team !== p.team).some((q) => hyp(q.x - b.x, q.y - b.y) < hyp(p.x - b.x, p.y - b.y) - 30);
      if (near && !opp) { tx = b.x; ty = b.y; }
    }
    this.moveTo(p, tx, ty, 0.95, dt);

    // save attempt
    const reach = PR + BR + 14 + (p.diveT > 0 ? 30 : 0);
    if (this.owner < 0 && this.phase === "play" && b.z < 70 && hyp(b.x - p.x, b.y - p.y) < reach && p.pickCd <= 0) {
      const s = hyp(b.vx, b.vy);
      const inBox = Math.abs(b.x - goalX) < BOX_D && b.y > H / 2 - BOX_W / 2 && b.y < H / 2 + BOX_W / 2;
      if (!inBox && s < 260) { this.takeBall(p); return; }
      const lastTeam = this.lastTouch >= 0 ? this.players[this.lastTouch].team : -1;
      if (lastTeam === p.team && s < 300) return; // own pass back is just collected by pickups
      const prob = clamp(1.4 - s / 1650 + p.skill * 0.1 - (p.diveT > 0 ? 0.08 : 0), 0.12, 0.97) * (0.3 + 0.7 * d.gk);
      this.stats.saves[p.team]++;
      if (Math.random() < prob) {
        this.takeBall(p);
        p.holdT = 0.9 + rnd(0, 0.5);
        p.diveT = 0;
        this.emit("save", { team: p.team, a: 1, x: b.x, y: b.y });
      } else {
        const a = Math.atan2(b.y - p.y, inX) + rnd(-0.9, 0.9);
        const away = Math.atan2(b.y - H / 2, inX * 60) + rnd(-0.6, 0.6);
        void a;
        b.vx = Math.cos(away) * s * 0.55 * (Math.cos(away) * inX >= 0 ? 1 : -1);
        b.vy = Math.sin(away) * s * 0.55;
        b.vz = 80;
        p.pickCd = 0.5;
        this.lastTouch = p.id;
        this.emit("save", { team: p.team, a: 0.5, x: b.x, y: b.y });
      }
    }
  }

  /* ---------- outfield AI ---------- */
  private shapeTarget(p: Player, teamBall: boolean): [number, number] {
    const dir = dirOf(p.team);
    const [fx, fy] = FORMATION[p.role];
    const ownU = (x: number) => (p.team === 0 ? x : W - x);
    const ballU = ownU(this.ball.x);
    let u = fx * W + (ballU - W / 2) * 0.36 + (teamBall ? W * 0.07 : -W * 0.03);
    const lo = p.role === "DL" || p.role === "DR" ? 110 : p.role === "ST" ? 360 : 230;
    const hi = p.role === "DL" || p.role === "DR" ? W * 0.62 : p.role === "ST" ? W - 150 : W * 0.82;
    u = clamp(u, lo, hi);
    let v = fy * H + (this.ball.y - H / 2) * 0.25;
    if (p.team === 1) v = H - (fy * H) + (this.ball.y - H / 2) * 0.25;
    if (p.role === "ST" && teamBall) u = Math.min(W - 160, u + 120);
    // keep apart from team mates
    for (const q of this.players) {
      if (q.team !== p.team || q.id === p.id) continue;
      const qx = ownU(q.x);
      const dd = hyp(qx - u, q.y - v);
      if (dd < 85 && dd > 0.1) {
        v += ((v - q.y) / dd) * (85 - dd) * 0.6;
      }
    }
    void dir;
    return [p.team === 0 ? u : W - u, clamp(v, 40, H - 40)];
  }

  private outfieldAI(p: Player, dt: number, teamBall: boolean[], chasers: number[][]): { x: number; y: number; sprint: boolean } | null {
    const b = this.ball;
    const dir = dirOf(p.team);
    const goalX = goalLineX(p.team);
    const ownGoalX = goalLineX(1 - p.team);
    const dif = DIFF[this.diff];
    const restartTaker = this.phase === "restart" && this.restart && this.restart.taker === p.id;
    if (restartTaker) return { x: 0, y: 0, sprint: false };

    if (this.owner === p.id) {
      // ---- with the ball
      const toGoal = hyp(goalX - p.x, H / 2 - p.y);
      let nearestOpp = 1e9;
      for (const o of this.players) if (o.team !== p.team) nearestOpp = Math.min(nearestOpp, hyp(o.x - p.x, o.y - p.y));
      if (p.think <= 0) {
        p.think = rnd(0.12, 0.22) / (dif.speed);
        // shoot
        const inRange = Math.abs(goalX - p.x) < 360 && p.y > GOAL_Y0 - 150 && p.y < GOAL_Y1 + 150;
        if (inRange && (nearestOpp > 30 || Math.abs(goalX - p.x) < 240) && Math.random() < 0.38) {
          const aim = Math.atan2((Math.random() < 0.5 ? GOAL_Y0 + 24 : GOAL_Y1 - 24) - p.y, goalX - p.x);
          this.shoot(p, Math.cos(aim), Math.sin(aim), rnd(0.72, 1), false);
          return null;
        }
        // pass under pressure, or when a better option is clearly open
        const press = nearestOpp < 58;
        const t = this.bestTarget(p, 0, 0, false, true);
        if (t && ((press && Math.random() < 0.7) || (Math.random() < 0.11 && Math.abs(t.x - goalX) < Math.abs(p.x - goalX) - 80))) {
          this.passBall(p, 0, 0, false, t);
          return null;
        }
        // blocked in front and nothing else: hit it long
        if (nearestOpp < 30 && Math.random() < 0.3) {
          this.shoot(p, dir, (H / 2 - p.y) * 0.002, 0.45, false);
          return null;
        }
        p.tx = goalX;
        p.ty = H / 2 + (p.y - H / 2) * 0.55 + rnd(-60, 60);
        // dodge the nearest defender
        for (const o of this.players) {
          if (o.team === p.team) continue;
          const d = hyp(o.x - p.x, o.y - p.y);
          if (d < 90 && (o.x - p.x) * dir > 0) p.ty += (p.y - o.y >= 0 ? 1 : -1) * (90 - d) * 1.6;
        }
        p.ty = clamp(p.ty, 40, H - 40);
      }
      void toGoal;
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = hyp(dx, dy) || 1;
      return { x: (dx / d) * 200, y: (dy / d) * 200, sprint: p.stamina > 0.35 && Math.abs(goalX - p.x) > 280 };
    }

    const iAmChaser = chasers[p.team][0] === p.id;
    const second = chasers[p.team][1] === p.id;
    const myBall = teamBall[p.team];
    const oppBall = teamBall[1 - p.team];

    // loose ball
    if (this.owner < 0) {
      if (iAmChaser || (second && hyp(b.x - p.x, b.y - p.y) < 160)) {
        const t = clamp(hyp(b.x - p.x, b.y - p.y) / 260, 0, 0.7);
        const ix = b.x + b.vx * t, iy = b.y + b.vy * t;
        // kick it first time when it is at the feet
        if (this.canKick(p) && p.think <= 0) {
          p.think = 0.2;
          const near = Math.abs(goalX - p.x) < 330 && Math.random() < 0.5;
          if (near) {
            const aim = Math.atan2(H / 2 + rnd(-60, 60) - p.y, goalX - p.x);
            this.shoot(p, Math.cos(aim), Math.sin(aim), rnd(0.6, 0.95), false);
            return null;
          }
          if (Math.random() < 0.35) { this.passBall(p, 0, 0, false); return null; }
        }
        return this.toward(p, ix, iy, 230, true);
      }
    } else if (oppBall) {
      const o = this.players[this.owner];
      if (iAmChaser || (second && hyp(o.x - p.x, o.y - p.y) < 130)) {
        // press and tackle
        const tx = o.x + Math.cos(angOpp(o)) * 0 + o.vx * 0.18;
        const ty = o.y + o.vy * 0.18;
        const d = hyp(o.x - p.x, o.y - p.y);
        if (d < 44 && p.tackleCd <= 0 && p.think <= 0) {
          p.think = rnd(0.2, 0.5);
          if (Math.random() < dif.tackle * 0.8) { this.startTackle(p); return null; }
        }
        // stay goal side
        const gx = ownGoalX;
        const side = Math.atan2(H / 2 - o.y, gx - o.x);
        const hold = second ? 60 : 24;
        return this.toward(p, tx + Math.cos(side) * hold * 0.0 + (iAmChaser ? 0 : Math.cos(side) * hold), ty + (iAmChaser ? 0 : Math.sin(side) * hold), 220, d > 70);
      }
    }
    // team shape
    let [sx, sy] = this.shapeTarget(p, myBall);
    // marking: defenders take the closest attacker in their zone
    if (oppBall && (p.role === "DL" || p.role === "DR")) {
      let m: Player | null = null;
      let md = 1e9;
      for (const o of this.players) {
        if (o.team === p.team || o.role === "GK") continue;
        const d = hyp(o.x - sx, o.y - sy);
        if (d < md && d < 280) { md = d; m = o; }
      }
      if (m) {
        const a = Math.atan2(H / 2 - m.y, ownGoalX - m.x);
        sx = m.x + Math.cos(a) * 55;
        sy = m.y + Math.sin(a) * 55;
      }
    }
    // attacking run
    if (myBall && p.role === "ST") {
      sx = goalX - dir * (170 + Math.sin(this.time * 0.9 + p.runPhase) * 40);
      sy = H / 2 + Math.sin(this.time * 0.7 + p.runPhase) * 150;
    }
    const d = hyp(sx - p.x, sy - p.y);
    return this.toward(p, sx, sy, d > 160 ? 200 : 150, d > 260 && p.stamina > 0.4);
    void dt;
  }

  private toward(p: Player, tx: number, ty: number, speed: number, sprint: boolean) {
    const dx = tx - p.x, dy = ty - p.y;
    const d = hyp(dx, dy);
    if (d < 4) return { x: 0, y: 0, sprint: false };
    const k = Math.min(1, d / 60);
    return { x: (dx / d) * speed * k, y: (dy / d) * speed * k, sprint };
  }
}

function angOpp(o: Player) {
  return o.face;
}
