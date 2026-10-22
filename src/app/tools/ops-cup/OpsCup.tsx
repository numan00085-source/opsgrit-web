"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Match, blankInput, type Difficulty, type Input } from "./engine";
import { Renderer, TEAM_NAMES } from "./render";
import { Sfx } from "./audio";
import { lerpView, packView, unpackView, viewOf, type View } from "./view";
import { hostGame, joinGame, type HostHandle, type Link as NetLink } from "./net";

type Screen = "closed" | "menu" | "hosting" | "joining" | "connecting" | "playing" | "result" | "error";
type Mode = "solo" | "host" | "guest";

interface Session {
  mode: Mode;
  match: Match | null;
  link: NetLink | null;
  snaps: { t: number; v: View }[];
  myTeam: 0 | 1;
  paused: boolean;
  fullT: number;
  remote: Input;
  lastSnapSent: number;
  lastInputSent: number;
  difficulty: Difficulty;
  resultShown: boolean;
}

const NAMES = TEAM_NAMES;
const fsEnter = (el: HTMLElement) => {
  const f = el.requestFullscreen || (el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen;
  try {
    const r = f?.call(el) as Promise<void> | undefined;
    r?.catch(() => {});
  } catch {
    /* ignore */
  }
  try {
    const o = screen.orientation as unknown as { lock?: (m: string) => Promise<void> };
    o?.lock?.("landscape")?.catch(() => {});
  } catch {
    /* ignore */
  }
};
const fsExit = () => {
  try {
    if (document.fullscreenElement) void document.exitFullscreen();
  } catch {
    /* ignore */
  }
};

export default function OpsCup({ autoJoin }: { autoJoin?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rend = useRef<Renderer | null>(null);
  const sfx = useRef<Sfx>(new Sfx());
  const screenRef = useRef<Screen>("closed");
  const sess = useRef<Session>({
    mode: "solo", match: null, link: null, snaps: [], myTeam: 0, paused: false, fullT: 0, remote: blankInput(),
    lastSnapSent: 0, lastInputSent: 0, difficulty: "normal", resultShown: false,
  });
  const attract = useRef<Match | null>(null);
  const hostHandle = useRef<HostHandle | null>(null);
  const inp = useRef<Input & { tx: number; ty: number; kx: number; ky: number }>({ ...blankInput(), tx: 0, ty: 0, kx: 0, ky: 0 });
  const keys = useRef<Set<string>>(new Set());
  const touchRef = useRef(false);
  const padPrev = useRef<boolean[]>([]);

  const [screen, setScreenState] = useState<Screen>("closed");
  const [code, setCode] = useState("");
  const [codeIn, setCodeIn] = useState(autoJoin ?? "");
  const [error, setError] = useState("");
  const [diff, setDiff] = useState<Difficulty>("normal");
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [leaveAsk, setLeaveAsk] = useState(false);
  const [touch, setTouch] = useState(false);
  const [portrait, setPortrait] = useState(false);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ v: View; myTeam: number; mode: Mode } | null>(null);
  const [rematchAsk, setRematchAsk] = useState(false);
  const [fs, setFs] = useState(false);

  const setScreen = useCallback((s: Screen) => {
    screenRef.current = s;
    setScreenState(s);
  }, []);

  /* ---------- opening and closing ---------- */
  const open = useCallback((to: Screen = "menu") => {
    sfx.current.unlock();
    setScreen(to);
    if (rootRef.current) fsEnter(rootRef.current);
  }, [setScreen]);

  const leaveLink = useCallback(() => {
    const s = sess.current;
    if (s.link) {
      s.link.sendCtl({ t: "leave" });
      const l = s.link;
      s.link = null;
      setTimeout(() => l.close(), 150);
    }
    hostHandle.current?.cancel();
    hostHandle.current = null;
  }, []);

  const toMenu = useCallback(() => {
    leaveLink();
    sess.current.match = null;
    sess.current.snaps = [];
    sess.current.paused = false;
    setPaused(false);
    setLeaveAsk(false);
    setResult(null);
    setRematchAsk(false);
    setError("");
    setScreen("menu");
  }, [leaveLink, setScreen]);

  const close = useCallback(() => {
    leaveLink();
    sess.current.match = null;
    setPaused(false);
    setScreen("closed");
    fsExit();
  }, [leaveLink, setScreen]);

  /* ---------- starting games ---------- */
  const beginMatch = useCallback((mode: Mode, myTeam: 0 | 1, match: Match | null) => {
    const s = sess.current;
    s.mode = mode;
    s.myTeam = myTeam;
    s.match = match;
    s.snaps = [];
    s.paused = false;
    s.fullT = 0;
    s.resultShown = false;
    s.remote = blankInput();
    rend.current?.resetEvents();
    setPaused(false);
    setResult(null);
    setRematchAsk(false);
    setLeaveAsk(false);
    setScreen("playing");
    sfx.current.start();
  }, [setScreen]);

  const startSolo = useCallback((d: Difficulty = diff) => {
    sess.current.difficulty = d;
    sess.current.link = null;
    beginMatch("solo", 0, new Match({ humans: [true, false], difficulty: d }));
  }, [beginMatch, diff]);

  const wireLink = useCallback((link: NetLink, role: "host" | "guest") => {
    const s = sess.current;
    s.link = link;
    link.onClose = () => {
      if (!sess.current.link) return;
      sess.current.link = null;
      sess.current.match = null;
      setError("Your opponent left the match.");
      setScreen("error");
    };
    if (role === "host") {
      link.onFast = (t) => {
        if (t[0] === "I") {
          try {
            const o = JSON.parse(t.slice(1)) as Input;
            sess.current.remote = { mx: +o.mx || 0, my: +o.my || 0, sprint: !!o.sprint, shoot: !!o.shoot, pass: o.pass | 0, tackle: o.tackle | 0, sw: o.sw | 0 };
          } catch { /* ignore */ }
        }
      };
      link.onCtl = (m) => {
        if (m.t === "rematch") setRematchAsk(true);
        if (m.t === "leave") link.onClose();
      };
    } else {
      link.onFast = (t) => {
        if (t[0] === "S") {
          const v = unpackView(t.slice(1));
          if (v) {
            const arr = sess.current.snaps;
            arr.push({ t: performance.now(), v });
            if (arr.length > 10) arr.shift();
          }
        }
      };
      link.onCtl = (m) => {
        if (m.t === "start") beginMatch("guest", 1, null);
        if (m.t === "leave") link.onClose();
      };
    }
  }, [beginMatch, setScreen]);

  const doHost = useCallback(async () => {
    sfx.current.click();
    setError("");
    setScreen("connecting");
    try {
      const h = await hostGame();
      hostHandle.current = h;
      setCode(h.code);
      setScreen("hosting");
      const link = await h.ready;
      hostHandle.current = null;
      wireLink(link, "host");
      link.sendCtl({ t: "start" });
      beginMatch("host", 0, new Match({ humans: [true, true], difficulty: "normal" }));
    } catch (e) {
      if (e instanceof Error && e.message === "cancelled") return;
      hostHandle.current = null;
      setError(e instanceof Error ? e.message : "Could not start online play.");
      setScreen("error");
    }
  }, [beginMatch, setScreen, wireLink]);

  const doJoin = useCallback(async () => {
    const c = codeIn.trim().toUpperCase();
    if (!/^[A-HJ-NP-Z2-9]{5}$/.test(c)) {
      setError("Enter the 5-character code your friend sees.");
      return;
    }
    sfx.current.click();
    setError("");
    setScreen("connecting");
    try {
      const link = await joinGame(c);
      wireLink(link, "guest");
      // wait for the host to start; show a waiting state
      setNote("Connected. Waiting for kick-off…");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join.");
      setScreen("error");
    }
  }, [codeIn, setScreen, wireLink]);

  const rematch = useCallback(() => {
    const s = sess.current;
    if (s.mode === "solo") startSolo(s.difficulty);
    else if (s.mode === "host" && s.link) {
      s.link.sendCtl({ t: "start" });
      beginMatch("host", 0, new Match({ humans: [true, true], difficulty: "normal" }));
    } else if (s.mode === "guest" && s.link) {
      s.link.sendCtl({ t: "rematch" });
      setNote("Rematch requested. Waiting for the host…");
    }
  }, [beginMatch, startSolo]);

  /* ---------- environment ---------- */
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const upd = () => {
      setTouch(coarse.matches || touchRef.current);
      setPortrait(window.innerHeight > window.innerWidth * 1.05);
    };
    upd();
    window.addEventListener("resize", upd);
    const onFs = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("resize", upd);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    if (autoJoin) {
      setCodeIn(autoJoin);
      setScreen("joining");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (screen === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [screen]);

  useEffect(() => {
    try {
      const m = window.localStorage.getItem("opsgrit-cup-muted") === "1";
      setMuted(m);
      sfx.current.muted = m;
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (screenRef.current === "closed") return;
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA")) return;
      const c = e.code;
      const playing = screenRef.current === "playing";
      if (c === "Escape" && playing) {
        e.preventDefault();
        if (sess.current.mode === "solo") togglePause();
        else setLeaveAsk((v) => !v);
        return;
      }
      if (!playing) return;
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(c)) e.preventDefault();
      if (e.repeat) { keys.current.add(c); return; }
      keys.current.add(c);
      if (c === "KeyJ" || c === "KeyF" || c === "KeyX") inp.current.pass++;
      if (c === "KeyK" || c === "KeyE" || c === "KeyC") inp.current.tackle++;
      if (c === "KeyL" || c === "KeyQ" || c === "KeyV") inp.current.sw++;
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    const s = sess.current;
    if (s.mode !== "solo") return;
    s.paused = !s.paused;
    setPaused(s.paused);
  };

  /* ---------- main loop ---------- */
  useEffect(() => {
    const cv = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const r = new Renderer(cv);
    rend.current = r;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let size = { w: 0, h: 0, dpr: 0 };
    let lastView: View | null = null;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const scr = screenRef.current;
      if (scr === "closed") { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // size
      const w = root.clientWidth || window.innerWidth;
      const h = root.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4_200_000 / Math.max(1, w * h)));
      if (size.w !== w || size.h !== h || size.dpr !== dpr) {
        size = { w, h, dpr };
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
        cv.style.width = `${w}px`;
        cv.style.height = `${h}px`;
      }

      const s = sess.current;
      const playing = scr === "playing" || scr === "result";
      let view: View | null = null;
      let flip = false;

      if (playing && s.mode !== "guest" && s.match) {
        const m = s.match;
        readInput();
        const i = inp.current;
        const base: Input = { mx: i.kx || i.tx, my: i.ky || i.ty, sprint: i.sprint, shoot: i.shoot, pass: i.pass, tackle: i.tackle, sw: i.sw };
        if (i.tx || i.ty) { base.mx = i.tx; base.my = i.ty; }
        m.setInput(0, base);
        if (s.mode === "host") m.setInput(1, s.remote);
        if (!s.paused && scr === "playing") {
          acc += dt;
          let n = 0;
          while (acc >= 1 / 60 && n < 5) { m.step(1 / 60); acc -= 1 / 60; n++; }
          if (n === 5) acc = 0;
        }
        view = viewOf(m);
        if (s.mode === "host" && s.link && now - s.lastSnapSent > 48) {
          s.lastSnapSent = now;
          s.link.sendFast("S" + packView(view));
        }
        if (s.link && Date.now() - s.link.lastRx > 7000) {
          const l = s.link;
          s.link = null;
          l.close();
          setError("The connection to your opponent was lost.");
          setScreen("error");
        }
      } else if (playing && s.mode === "guest") {
        readInput();
        const i = inp.current;
        flip = true;
        if (s.link && now - s.lastInputSent > 30) {
          s.lastInputSent = now;
          const mx = i.tx || i.kx, my = i.ty || i.ky;
          s.link.sendFast("I" + JSON.stringify({ mx: -mx, my: -my, sprint: i.sprint, shoot: i.shoot, pass: i.pass, tackle: i.tackle, sw: i.sw }));
        }
        const sn = s.snaps;
        if (sn.length) {
          const rt = now - 110;
          let a = sn[0], b = sn[0];
          for (let k = 0; k < sn.length; k++) {
            if (sn[k].t <= rt) a = sn[k];
            if (sn[k].t >= rt) { b = sn[k]; break; }
            b = sn[k];
          }
          const span = b.t - a.t;
          view = span > 1 ? lerpView(a.v, b.v, Math.min(1, Math.max(0, (rt - a.t) / span))) : b.v;
        }
        if (s.link && Date.now() - s.link.lastRx > 7000) {
          const l = s.link;
          s.link = null;
          l.close();
          setError("The connection to the host was lost.");
          setScreen("error");
        }
      } else {
        // attract mode behind the menus
        if (!attract.current || attract.current.phase === "full") attract.current = new Match({ humans: [false, false], difficulty: "normal" });
        acc += dt;
        let n = 0;
        while (acc >= 1 / 60 && n < 5) { attract.current.step(1 / 60); acc -= 1 / 60; n++; }
        if (n === 5) acc = 0;
        view = viewOf(attract.current);
      }

      if (!view) {
        // guest waiting for the first snapshot
        r.ctx.setTransform(1, 0, 0, 1, 0, 0);
        r.ctx.fillStyle = "#05070d";
        r.ctx.fillRect(0, 0, cv.width, cv.height);
        return;
      }
      lastView = view;
      const isAttract = !(playing && (s.mode === "guest" || s.match));
      if (!isAttract) {
        const fresh = r.ingest(view.events, NAMES);
        for (const e of fresh) playSound(e.k, e.a);
        crowdFor(view);
      }
      r.draw(view, { flip, myTeam: s.myTeam, online: s.mode !== "solo", w, h, names: NAMES, touch: touchRef.current || window.matchMedia("(pointer: coarse)").matches, attract: isAttract }, dt);

      // full time
      if (playing && view.phase === "full" && !s.resultShown) {
        s.fullT += dt;
        if (s.fullT > 2.2) {
          s.resultShown = true;
          setResult({ v: view, myTeam: s.myTeam, mode: s.mode });
          setScreen("result");
        }
      }
    };

    const crowdFor = (v: View) => {
      const near = Math.min(v.ball.x, 1400 - v.ball.x) < 260;
      sfx.current.crowd(v.phase === "play" ? (near ? 0.14 : 0.09) : 0.1, 0.8);
    };
    const playSound = (k: string, a?: number) => {
      const f = sfx.current;
      switch (k) {
        case "kick": f.kick(a ?? 0.4); break;
        case "shot": f.kick(a ?? 0.8); break;
        case "pass": f.pass(); break;
        case "tackle": f.tackle(); break;
        case "slide": f.slide(); break;
        case "bounce": f.bounce(a ?? 0.4); break;
        case "post": f.post(); break;
        case "save": f.save(); break;
        case "net": f.net(); break;
        case "goal": f.goal(); break;
        case "whistle": f.whistle(false); break;
        case "half": f.whistle(true); break;
        case "full": f.whistle(true); break;
        case "throw": case "corner": case "goalkick": f.whistle(false); break;
      }
    };

    const readInput = () => {
      const k = keys.current;
      const i = inp.current;
      let mx = 0, my = 0;
      if (k.has("KeyA") || k.has("ArrowLeft")) mx -= 1;
      if (k.has("KeyD") || k.has("ArrowRight")) mx += 1;
      if (k.has("KeyW") || k.has("ArrowUp")) my -= 1;
      if (k.has("KeyS") || k.has("ArrowDown")) my += 1;
      i.kx = mx; i.ky = my;
      const tShoot = i.shoot && touchRef.current && !(k.has("Space") || k.has("KeyZ"));
      let shoot = k.has("Space") || k.has("KeyZ");
      let sprint = k.has("ShiftLeft") || k.has("ShiftRight");
      // gamepad
      try {
        const pads = navigator.getGamepads?.() ?? [];
        const gp = Array.from(pads).find((p) => p && p.connected);
        if (gp) {
          const ax = Math.abs(gp.axes[0]) > 0.18 ? gp.axes[0] : 0;
          const ay = Math.abs(gp.axes[1]) > 0.18 ? gp.axes[1] : 0;
          if (ax || ay) { i.kx = ax; i.ky = ay; }
          const b = gp.buttons.map((x) => x.pressed);
          const prev = padPrev.current;
          if (b[0]) shoot = true;
          if (b[5] || b[7] || b[4]) sprint = true;
          if (b[2] && !prev[2]) i.pass++;
          if (b[1] && !prev[1]) i.tackle++;
          if (b[3] && !prev[3]) i.sw++;
          padPrev.current = b;
        }
      } catch { /* ignore */ }
      i.shoot = shoot || tShoot || touchShoot.current;
      i.sprint = sprint || touchSprint.current;
    };

    raf = requestAnimationFrame(frame);
    void lastView;
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- touch controls ---------- */
  const touchShoot = useRef(false);
  const touchSprint = useRef(false);
  const stickBase = useRef<HTMLDivElement>(null);
  const stickKnob = useRef<HTMLDivElement>(null);
  const stickId = useRef<number | null>(null);
  const stickC = useRef({ x: 0, y: 0 });

  const onStickDown = (e: React.PointerEvent<HTMLDivElement>) => {
    touchRef.current = true;
    if (stickId.current !== null) return;
    stickId.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    stickC.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (stickBase.current) {
      stickBase.current.style.opacity = "1";
      stickBase.current.style.transform = `translate(${stickC.current.x - 56}px, ${stickC.current.y - 56}px)`;
    }
    if (stickKnob.current) stickKnob.current.style.transform = "translate(0px,0px)";
  };
  const onStickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickId.current !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let dx = e.clientX - rect.left - stickC.current.x;
    let dy = e.clientY - rect.top - stickC.current.y;
    const R = 52;
    const m = Math.hypot(dx, dy);
    if (m > R) { dx = (dx / m) * R; dy = (dy / m) * R; }
    inp.current.tx = Math.abs(dx) < 6 && Math.abs(dy) < 6 ? 0 : dx / R;
    inp.current.ty = Math.abs(dx) < 6 && Math.abs(dy) < 6 ? 0 : dy / R;
    if (stickKnob.current) stickKnob.current.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onStickUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickId.current !== e.pointerId) return;
    stickId.current = null;
    inp.current.tx = 0;
    inp.current.ty = 0;
    if (stickBase.current) stickBase.current.style.opacity = "0.35";
  };

  const btn = (label: string, cls: string, down: () => void, up?: () => void) => (
    <button
      type="button"
      aria-label={label}
      className={`absolute select-none rounded-full border border-white/25 font-extrabold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm active:scale-95 ${cls}`}
      style={{ touchAction: "none" }}
      onPointerDown={(e) => { touchRef.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); down(); }}
      onPointerUp={() => up?.()}
      onPointerCancel={() => up?.()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );

  /* ---------- helpers ---------- */
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNote(msg);
    } catch {
      setNote("Copy is blocked in this browser.");
    }
    setTimeout(() => setNote(""), 2200);
  };
  const inviteUrl = () => `${window.location.origin}/tools/ops-cup?join=${code}`;
  const shareResult = async () => {
    if (!result) return;
    const v = result.v;
    const text = `OpsGrit Cup: ${NAMES[0]} ${v.score[0]}-${v.score[1]} ${NAMES[1]}. Play free:`;
    const url = `${window.location.origin}/tools/ops-cup`;
    try {
      if (navigator.share) await navigator.share({ title: "OpsGrit Cup", text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setNote("Copied."); setTimeout(() => setNote(""), 2000); }
    } catch { /* cancelled */ }
  };
  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    sfx.current.setMuted(m);
    try { window.localStorage.setItem("opsgrit-cup-muted", m ? "1" : "0"); } catch { /* ignore */ }
  };
  const toggleFs = () => {
    if (document.fullscreenElement) fsExit();
    else if (rootRef.current) fsEnter(rootRef.current);
  };

  const inGame = screen === "playing" || screen === "result";
  const online = sess.current.mode !== "solo";

  return (
    <>
      {/* landing call to action */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" className="btn-primary px-10 py-4 text-lg" onClick={() => open("menu")}>Play now</button>
        <p className="text-sm text-ink-600">Full screen. Phone, tablet or keyboard. Free, no signup.</p>
      </div>

      {/* full screen game */}
      <div
        ref={rootRef}
        className={`fixed inset-0 z-[300] overflow-hidden bg-night-950 text-white ${screen === "closed" ? "hidden" : ""}`}
        style={{ height: "100dvh" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block" />

        {/* top-left controls */}
        <div className="absolute left-3 top-3 z-20 flex gap-2">
          {inGame && (
            <button type="button" className="rounded-lg bg-black/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/70" onClick={() => (online ? setLeaveAsk(true) : togglePause())}>
              {online ? "Menu" : paused ? "Resume" : "Pause"}
            </button>
          )}
          <button type="button" className="rounded-lg bg-black/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/70" onClick={toggleMute} aria-pressed={muted}>
            Sound {muted ? "off" : "on"}
          </button>
          <button type="button" className="hidden rounded-lg bg-black/50 px-3 py-1.5 text-xs font-bold text-white hover:bg-black/70 sm:block" onClick={toggleFs}>
            {fs ? "Exit full screen" : "Full screen"}
          </button>
        </div>
        {!inGame && (
          <button type="button" aria-label="Close game" className="absolute right-3 top-3 z-20 rounded-lg bg-black/50 px-3 py-1.5 text-sm font-bold text-white hover:bg-black/70" onClick={close}>
            Close
          </button>
        )}

        {/* touch controls */}
        {screen === "playing" && touch && (
          <>
            <div
              className="absolute bottom-0 left-0 z-10 h-[70%] w-1/2"
              style={{ touchAction: "none" }}
              onPointerDown={onStickDown}
              onPointerMove={onStickMove}
              onPointerUp={onStickUp}
              onPointerCancel={onStickUp}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div ref={stickBase} className="pointer-events-none absolute left-0 top-0 h-28 w-28 rounded-full border-2 border-white/40 bg-white/10 opacity-35" style={{ transform: "translate(40px, 120px)" }}>
                <div ref={stickKnob} className="absolute left-1/2 top-1/2 -ml-6 -mt-6 h-12 w-12 rounded-full bg-white/60" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10 h-0">
              {btn("Shoot", "bottom-6 right-6 h-24 w-24 bg-gold-500/80 text-base text-ink-900", () => { touchShoot.current = true; }, () => { touchShoot.current = false; })}
              {btn("Pass", "bottom-8 right-36 h-[4.5rem] w-[4.5rem] bg-white/20 text-sm", () => { inp.current.pass++; })}
              {btn("Tackle", "bottom-36 right-8 h-[4.25rem] w-[4.25rem] bg-rose-500/60 text-xs", () => { inp.current.tackle++; })}
              {btn("Sprint", "bottom-32 right-32 h-16 w-16 bg-emerald-500/50 text-[10px]", () => { touchSprint.current = true; }, () => { touchSprint.current = false; })}
              {btn("Switch", "bottom-6 right-[15rem] h-12 w-12 bg-sky-500/40 text-[9px]", () => { inp.current.sw++; })}
            </div>
          </>
        )}
        {screen === "playing" && touch && portrait && (
          <div className="pointer-events-none absolute inset-x-0 top-20 z-10 mx-auto w-fit rounded-xl bg-black/70 px-4 py-2 text-center text-sm font-semibold text-gold-200">Rotate your phone for the best view</div>
        )}

        {/* menu */}
        {screen === "menu" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center overflow-y-auto bg-night-950/65 px-4 py-14 backdrop-blur-[3px]">
            <div className="my-auto w-full max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300">OpsGrit Cup</p>
              <h2 className="mt-2 text-5xl font-extrabold tracking-tight sm:text-7xl"><span className="gold-text-light">Football</span></h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300 sm:text-base">6 a side. Play a friend online with a code, or take on the computer. OpsGrit FC vs Backlog United.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button type="button" onClick={doHost} className="group rounded-2xl border border-gold-400/60 bg-gradient-to-br from-gold-400/25 to-gold-600/10 p-6 text-left transition hover:border-gold-300 hover:from-gold-400/35">
                  <span className="block text-xl font-extrabold text-gold-200">Get your code</span>
                  <span className="mt-1 block text-sm text-slate-300">Host a match. Share a 5-letter code with a friend.</span>
                </button>
                <button type="button" onClick={() => { sfx.current.click(); setError(""); setScreen("joining"); }} className="group rounded-2xl border border-white/25 bg-white/5 p-6 text-left transition hover:border-white/50 hover:bg-white/10">
                  <span className="block text-xl font-extrabold text-white">Enter the code</span>
                  <span className="mt-1 block text-sm text-slate-300">Join a friend&apos;s match with the code they send you.</span>
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-white/15 bg-black/30 p-5">
                <p className="text-sm font-bold text-slate-200">Or play the computer</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {(["easy", "normal", "hard"] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setDiff(d)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${diff === d ? "bg-gold-400 text-ink-900" : "bg-white/10 text-slate-200 hover:bg-white/20"}`}>{d}</button>
                  ))}
                  <button type="button" onClick={() => startSolo(diff)} className="btn-primary ml-2 px-6">Kick off</button>
                </div>
              </div>

              <details className="mt-5 text-left text-sm text-slate-300">
                <summary className="cursor-pointer text-center font-semibold text-gold-300">How to play</summary>
                <div className="mt-3 grid gap-x-8 gap-y-1.5 rounded-xl bg-black/30 p-4 sm:grid-cols-2">
                  <p><b className="text-white">Move:</b> WASD or arrows, or the on-screen stick</p>
                  <p><b className="text-white">Shoot:</b> hold Space, release to fire. Longer hold = harder</p>
                  <p><b className="text-white">Pass:</b> J or F, aim with the move keys</p>
                  <p><b className="text-white">Tackle:</b> K or E when close to the ball carrier</p>
                  <p><b className="text-white">Sprint:</b> hold Shift. It uses stamina</p>
                  <p><b className="text-white">Switch player:</b> L or Q</p>
                  <p className="sm:col-span-2 text-xs text-slate-400">Gamepad works too: A shoot, X pass, B tackle, Y switch, bumper sprint. Online matches connect your browsers directly, so your opponent can see your network address, as with any video call.</p>
                </div>
              </details>
            </div>
          </div>
        )}

        {screen === "joining" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-950/75 px-4 backdrop-blur-[3px]">
            <div className="w-full max-w-md rounded-2xl border border-white/20 bg-night-900/90 p-7 text-center">
              <h2 className="text-2xl font-extrabold">Enter the code</h2>
              <p className="mt-2 text-sm text-slate-300">Type the 5-character code your friend sees on their screen.</p>
              <input
                value={codeIn}
                onChange={(e) => setCodeIn(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))}
                onKeyDown={(e) => { if (e.key === "Enter") void doJoin(); }}
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                placeholder="K7QX2"
                aria-label="Match code"
                className="mt-5 w-full rounded-xl border border-white/25 bg-black/40 px-4 py-4 text-center font-mono text-4xl font-bold tracking-[0.4em] text-gold-200 outline-none focus:border-gold-400"
                autoFocus
              />
              {error && <p className="mt-3 text-sm text-rose-300" role="alert">{error}</p>}
              <div className="mt-5 flex justify-center gap-3">
                <button type="button" className="btn-ghost !border-white/30 !bg-white/10 !text-white" onClick={toMenu}>Back</button>
                <button type="button" className="btn-primary px-8" onClick={() => void doJoin()}>Join match</button>
              </div>
            </div>
          </div>
        )}

        {screen === "hosting" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-950/75 px-4 backdrop-blur-[3px]">
            <div className="w-full max-w-md rounded-2xl border border-gold-400/40 bg-night-900/90 p-7 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Your match code</p>
              <p className="mt-3 font-mono text-6xl font-extrabold tracking-[0.3em] text-gold-200" aria-live="polite">{code}</p>
              <p className="mt-3 text-sm text-slate-300">Send this code to your friend. They choose <b className="text-white">Enter the code</b>. The match starts the moment they join.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className="btn-primary" onClick={() => void copy(code, "Code copied.")}>Copy code</button>
                <button type="button" className="btn-ghost !border-white/30 !bg-white/10 !text-white" onClick={() => void copy(inviteUrl(), "Invite link copied.")}>Copy invite link</button>
              </div>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-300">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" /> Waiting for your friend…
              </p>
              <p className="mt-1 h-4 text-xs text-gold-200" role="status" aria-live="polite">{note}</p>
              <button type="button" className="mt-3 text-sm font-semibold text-slate-300 underline underline-offset-2" onClick={toMenu}>Cancel</button>
            </div>
          </div>
        )}

        {screen === "connecting" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-950/75 px-4 backdrop-blur-[3px]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-gold-400" />
              <p className="mt-4 text-lg font-bold">{note || "Connecting…"}</p>
              <p className="mt-1 text-sm text-slate-300">This usually takes a few seconds.</p>
              <button type="button" className="mt-4 text-sm font-semibold text-slate-300 underline underline-offset-2" onClick={toMenu}>Cancel</button>
            </div>
          </div>
        )}

        {screen === "error" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-night-950/80 px-4 backdrop-blur-[3px]">
            <div className="w-full max-w-md rounded-2xl border border-rose-400/40 bg-night-900/90 p-7 text-center">
              <h2 className="text-xl font-extrabold">Match problem</h2>
              <p className="mt-2 text-sm text-slate-300" role="alert">{error || "Something went wrong."}</p>
              <div className="mt-5 flex justify-center gap-3">
                <button type="button" className="btn-primary" onClick={toMenu}>Back to menu</button>
              </div>
            </div>
          </div>
        )}

        {/* pause and leave */}
        {screen === "playing" && (paused || leaveAsk) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 px-4 backdrop-blur-[2px]">
            <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-night-900/95 p-6 text-center">
              <h2 className="text-2xl font-extrabold">{paused ? "Paused" : "Leave the match?"}</h2>
              {!paused && <p className="mt-2 text-sm text-slate-300">Your opponent will be told you left.</p>}
              <div className="mt-5 flex justify-center gap-3">
                <button type="button" className="btn-primary" onClick={() => { if (paused) togglePause(); setLeaveAsk(false); }}>{paused ? "Resume" : "Keep playing"}</button>
                <button type="button" className="btn-ghost !border-white/30 !bg-white/10 !text-white" onClick={toMenu}>Quit to menu</button>
              </div>
            </div>
          </div>
        )}

        {/* full time */}
        {screen === "result" && result && <ResultCard result={result} rematchAsk={rematchAsk} note={note} onRematch={rematch} onMenu={toMenu} onShare={shareResult} />}
      </div>
    </>
  );
}

function ResultCard({ result, rematchAsk, note, onRematch, onMenu, onShare }: {
  result: { v: View; myTeam: number; mode: Mode };
  rematchAsk: boolean;
  note: string;
  onRematch: () => void;
  onMenu: () => void;
  onShare: () => void;
}) {
  const { v, myTeam, mode } = result;
  const mine = v.score[myTeam], theirs = v.score[1 - myTeam];
  const headline = mine > theirs ? "You win!" : mine < theirs ? "You lose" : "It ends level";
  const st = v.stats;
  const tot = st.poss[0] + st.poss[1] || 1;
  const rows: [string, number, number, string?, string?][] = [
    ["Possession", Math.round((st.poss[0] / tot) * 100), Math.round((st.poss[1] / tot) * 100), "%", "%"],
    ["Shots", st.shots[0], st.shots[1]],
    ["On target", st.sot[0], st.sot[1]],
    ["Clean handoffs", st.passOk[0], st.passOk[1]],
    ["Tackles won", st.tackles[0], st.tackles[1]],
    ["Saves", st.saves[0], st.saves[1]],
  ];
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-[3px]">
      <div className="w-full max-w-xl rounded-2xl border border-gold-400/40 bg-night-900/95 p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">Full time</p>
        <h2 className="mt-1 text-3xl font-extrabold">{mode === "solo" && mine === theirs ? "Honours even" : headline}</h2>
        <p className="mt-2 text-5xl font-extrabold text-gold-200">{v.score[0]} <span className="text-slate-500">-</span> {v.score[1]}</p>
        <p className="mt-1 text-sm text-slate-300">{NAMES[0]} vs {NAMES[1]}</p>
        <div className="mt-5 space-y-2 text-left">
          {rows.map(([label, a, b, ua, ub]) => {
            const t = a + b || 1;
            return (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-300"><span className="font-bold text-white">{a}{ua}</span><span>{label}</span><span className="font-bold text-white">{b}{ub}</span></div>
                <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="bg-gold-400" style={{ width: `${(a / t) * 100}%` }} />
                  <div className="bg-teal-400" style={{ width: `${(b / t) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary px-7" onClick={onRematch}>{mode === "guest" ? "Ask for a rematch" : "Rematch"}</button>
          <button type="button" className="btn-ghost !border-white/30 !bg-white/10 !text-white" onClick={onShare}>Share result</button>
          <button type="button" className="btn-ghost !border-white/30 !bg-white/10 !text-white" onClick={onMenu}>Menu</button>
        </div>
        {rematchAsk && mode === "host" && <p className="mt-3 text-sm font-semibold text-emerald-300">Your opponent wants a rematch. Press Rematch.</p>}
        {note && <p className="mt-3 text-sm text-gold-200" role="status">{note}</p>}
        <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
          Good teams win on clean handoffs. Check yours at work:{" "}
          <Link className="font-semibold text-gold-300 underline underline-offset-2" href="/tools/readiness-scorecard">automation readiness scorecard</Link>{" · "}
          <Link className="font-semibold text-gold-300 underline underline-offset-2" href="/tools/raci-generator">RACI generator</Link>
        </p>
      </div>
    </div>
  );
}
