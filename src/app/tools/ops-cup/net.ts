/**
 * Online play without a game server: the two browsers connect directly (WebRTC).
 * A tiny signalling API (/api/match) swaps the connection details using a short code.
 * Nothing is stored for longer than ten minutes.
 */
const ICE: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }],
};

export interface Link {
  /** Unreliable, unordered: snapshots and inputs. */
  sendFast(text: string): void;
  /** Reliable: start, rematch, leave. */
  sendCtl(msg: Record<string, unknown>): void;
  onFast: (text: string) => void;
  onCtl: (msg: Record<string, unknown>) => void;
  onClose: () => void;
  close(): void;
  lastRx: number;
}

async function api<T>(init: RequestInit & { query?: string }): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(`/api/match${init.query ?? ""}`, { ...init, cache: "no-store", headers: { "Content-Type": "application/json" } });
  let data: T | null = null;
  try {
    data = (await res.json()) as T;
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

function gathered(pc: RTCPeerConnection, ms = 3500): Promise<void> {
  return new Promise((res) => {
    if (pc.iceGatheringState === "complete") return res();
    const done = () => res();
    const t = setTimeout(done, ms);
    pc.addEventListener("icegatheringstatechange", () => {
      if (pc.iceGatheringState === "complete") {
        clearTimeout(t);
        done();
      }
    });
  });
}

function makeLink(pc: RTCPeerConnection, fast: RTCDataChannel, ctl: RTCDataChannel): Link {
  const link: Link = {
    sendFast: (t) => { if (fast.readyState === "open") fast.send(t); },
    sendCtl: (m) => { if (ctl.readyState === "open") ctl.send(JSON.stringify(m)); },
    onFast: () => {},
    onCtl: () => {},
    onClose: () => {},
    close: () => { try { fast.close(); ctl.close(); pc.close(); } catch { /* ignore */ } },
    lastRx: Date.now(),
  };
  fast.onmessage = (e) => { link.lastRx = Date.now(); link.onFast(String(e.data)); };
  ctl.onmessage = (e) => {
    link.lastRx = Date.now();
    try { link.onCtl(JSON.parse(String(e.data))); } catch { /* ignore */ }
  };
  let closed = false;
  const closeOnce = () => { if (!closed) { closed = true; link.onClose(); } };
  ctl.onclose = closeOnce;
  fast.onclose = closeOnce;
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed" || pc.connectionState === "closed") closeOnce();
  };
  return link;
}

function waitOpen(chs: RTCDataChannel[], ms: number): Promise<void> {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("The connection timed out. Try again, or play on the same Wi-Fi.")), ms);
    const check = () => {
      if (chs.every((c) => c.readyState === "open")) { clearTimeout(t); res(); }
    };
    chs.forEach((c) => c.addEventListener("open", check));
    check();
  });
}

export interface HostHandle {
  code: string;
  /** Resolves when a friend has joined and the channels are open. */
  ready: Promise<Link>;
  cancel(): void;
}

export async function hostGame(): Promise<HostHandle> {
  const pc = new RTCPeerConnection(ICE);
  const fast = pc.createDataChannel("g", { ordered: false, maxRetransmits: 0 });
  const ctl = pc.createDataChannel("c");
  await pc.setLocalDescription(await pc.createOffer());
  await gathered(pc);
  const offer = pc.localDescription?.sdp ?? "";
  const r = await api<{ code?: string; error?: string }>({ method: "POST", body: JSON.stringify({ action: "create", offer }) });
  if (!r.ok || !r.data?.code) {
    pc.close();
    throw new Error(r.data?.error || "Online play is not available right now.");
  }
  const code = r.data.code;
  let cancelled = false;
  const ready = new Promise<Link>((resolve, reject) => {
    const started = Date.now();
    const poll = async () => {
      if (cancelled) return reject(new Error("cancelled"));
      if (Date.now() - started > 5 * 60_000) { pc.close(); return reject(new Error("Nobody joined in time. Get a new code.")); }
      try {
        const a = await api<{ answer?: string }>({ method: "GET", query: `?code=${code}&part=answer` });
        if (a.ok && a.data?.answer) {
          await pc.setRemoteDescription({ type: "answer", sdp: a.data.answer });
          await waitOpen([fast, ctl], 25_000);
          void api({ method: "POST", body: JSON.stringify({ action: "close", code }) });
          return resolve(makeLink(pc, fast, ctl));
        }
      } catch (e) {
        if (!cancelled && e instanceof Error && e.message.includes("timed out")) { pc.close(); return reject(e); }
      }
      setTimeout(poll, 2200);
    };
    setTimeout(poll, 1500);
  });
  return {
    code,
    ready,
    cancel: () => {
      cancelled = true;
      try { pc.close(); } catch { /* ignore */ }
      void api({ method: "POST", body: JSON.stringify({ action: "close", code }) });
    },
  };
}

export async function joinGame(rawCode: string): Promise<Link> {
  const code = rawCode.trim().toUpperCase();
  const o = await api<{ offer?: string; error?: string }>({ method: "GET", query: `?code=${encodeURIComponent(code)}&part=offer` });
  if (!o.ok || !o.data?.offer) throw new Error(o.status === 404 ? "That code was not found. Check it, or ask for a new one." : o.data?.error || "Could not reach the match service.");
  const pc = new RTCPeerConnection(ICE);
  const chs: Record<string, RTCDataChannel> = {};
  const both = new Promise<void>((res, rej) => {
    const t = setTimeout(() => rej(new Error("The connection timed out. Try again, or play on the same Wi-Fi.")), 25_000);
    pc.ondatachannel = (e) => {
      chs[e.channel.label] = e.channel;
      if (chs.g && chs.c) {
        const go = () => { if (chs.g.readyState === "open" && chs.c.readyState === "open") { clearTimeout(t); res(); } };
        chs.g.addEventListener("open", go);
        chs.c.addEventListener("open", go);
        go();
      }
    };
  });
  await pc.setRemoteDescription({ type: "offer", sdp: o.data.offer });
  await pc.setLocalDescription(await pc.createAnswer());
  await gathered(pc);
  const a = await api<{ error?: string }>({ method: "POST", body: JSON.stringify({ action: "answer", code, answer: pc.localDescription?.sdp ?? "" }) });
  if (!a.ok) { pc.close(); throw new Error(a.data?.error || "Could not join. The code may have been used already."); }
  try {
    await both;
  } catch (e) {
    pc.close();
    throw e;
  }
  return makeLink(pc, chs.g, chs.c);
}
