import { Match, type GameEvent, type Phase, type Stats } from "./engine";

/** Everything the renderer needs. The host builds it from the Match, the guest builds it from snapshots. */
export interface VPlayer {
  x: number;
  y: number;
  face: number;
  step: number;
  team: number;
  role: number; // index into ROLES
  num: number;
  flags: number; // 1 sprint, 2 tackling, 4 stunned, 8 kicking, 16 diving, 32 holding the ball
  stam: number; // 0..1
}
export interface View {
  players: VPlayer[];
  ball: { x: number; y: number; z: number; spin: number };
  owner: number;
  phase: Phase;
  phaseT: number;
  clock: number;
  half: number;
  score: [number, number];
  ctrl: [number, number]; // controlled player id per team, -1 for none
  charge: [number, number];
  restartKind: string;
  restartTeam: number;
  goalTeam: number;
  stats: Stats;
  events: GameEvent[];
  minute: number;
}

const PHASES: Phase[] = ["kickoff", "play", "goal", "restart", "half", "full"];
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

export function viewOf(m: Match): View {
  return {
    players: m.players.map((p) => ({
      x: p.x, y: p.y, face: p.face, step: p.step, team: p.team,
      role: ["GK", "DL", "DR", "ML", "MR", "ST"].indexOf(p.role), num: p.num,
      flags: (p.sprint ? 1 : 0) | (p.tackleT > 0 ? 2 : 0) | (p.stunT > 0 ? 4 : 0) | (p.kickT > 0.12 ? 8 : 0) | (p.diveT > 0 ? 16 : 0) | (m.owner === p.id && p.role === "GK" ? 32 : 0),
      stam: p.stamina,
    })),
    ball: { x: m.ball.x, y: m.ball.y, z: m.ball.z, spin: m.ball.spin },
    owner: m.owner,
    phase: m.phase,
    phaseT: m.phaseT,
    clock: m.clock,
    half: m.half,
    score: [m.score[0], m.score[1]],
    ctrl: [m.controlled(0), m.controlled(1)],
    charge: [m.charge(0), m.charge(1)],
    restartKind: m.restart?.kind ?? "",
    restartTeam: m.restart?.team ?? -1,
    goalTeam: m.goalTeam,
    stats: m.stats,
    events: m.events.slice(-12),
    minute: m.minute(),
  };
}

/** Compact JSON for the network. Positions are rounded to keep each snapshot small. */
export function packView(v: View): string {
  const o = {
    p: v.players.map((p) => [r1(p.x), r1(p.y), r2(p.face), Math.round(p.step), p.flags, Math.round(p.stam * 100), p.num]),
    b: [r1(v.ball.x), r1(v.ball.y), r1(v.ball.z), r1(v.ball.spin)],
    o: v.owner,
    ph: PHASES.indexOf(v.phase),
    pt: r2(v.phaseT),
    c: r1(v.clock),
    h: v.half,
    s: v.score,
    k: v.ctrl,
    ch: [r2(v.charge[0]), r2(v.charge[1])],
    rk: v.restartKind,
    rt: v.restartTeam,
    g: v.goalTeam,
    st: [v.stats.poss.map(Math.round), v.stats.shots, v.stats.sot, v.stats.pass, v.stats.passOk, v.stats.tackles, v.stats.saves],
    e: v.events.map((e) => [e.id, e.k, e.team ?? -1, e.a === undefined ? null : r2(e.a), e.x === undefined ? null : Math.round(e.x), e.y === undefined ? null : Math.round(e.y)]),
    m: v.minute,
  };
  return JSON.stringify(o);
}

export function unpackView(text: string): View | null {
  try {
    const o = JSON.parse(text);
    const roles = [0, 1, 2, 3, 4, 5];
    const players: VPlayer[] = o.p.map((q: number[], i: number) => ({
      x: q[0], y: q[1], face: q[2], step: q[3], flags: q[4], stam: q[5] / 100, num: q[6],
      team: i < 6 ? 0 : 1, role: roles[i % 6],
    }));
    const st = o.st;
    return {
      players,
      ball: { x: o.b[0], y: o.b[1], z: o.b[2], spin: o.b[3] },
      owner: o.o,
      phase: PHASES[o.ph] ?? "play",
      phaseT: o.pt,
      clock: o.c,
      half: o.h,
      score: o.s,
      ctrl: o.k,
      charge: o.ch,
      restartKind: o.rk,
      restartTeam: o.rt,
      goalTeam: o.g,
      stats: { poss: st[0], shots: st[1], sot: st[2], pass: st[3], passOk: st[4], tackles: st[5], saves: st[6] },
      events: o.e.map((e: (number | string | null)[]) => ({ id: e[0] as number, k: e[1] as string, team: (e[2] as number) < 0 ? undefined : (e[2] as number), a: e[3] ?? undefined, x: e[4] ?? undefined, y: e[5] ?? undefined })),
      minute: o.m,
    };
  } catch {
    return null;
  }
}

/** Linear blend of two views, used by the guest to smooth 20 Hz snapshots. */
export function lerpView(a: View, b: View, t: number): View {
  const L = (x: number, y: number) => x + (y - x) * t;
  const A = (x: number, y: number) => {
    let d = y - x;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return x + d * t;
  };
  return {
    ...b,
    players: b.players.map((p, i) => {
      const q = a.players[i];
      const jump = Math.hypot(p.x - q.x, p.y - q.y) > 300;
      return jump ? p : { ...p, x: L(q.x, p.x), y: L(q.y, p.y), face: A(q.face, p.face), step: L(q.step, p.step) };
    }),
    ball: Math.hypot(b.ball.x - a.ball.x, b.ball.y - a.ball.y) > 300 ? b.ball : { x: L(a.ball.x, b.ball.x), y: L(a.ball.y, b.ball.y), z: L(a.ball.z, b.ball.z), spin: b.ball.spin },
    clock: L(a.clock, b.clock),
  };
}
