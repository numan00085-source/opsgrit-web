import { analyticsConfigured, pipeline } from "@/lib/analytics";
import { createHash, randomInt } from "node:crypto";

export const runtime = "nodejs";

/**
 * Signalling for OpsGrit Cup online matches. It only passes two short text blobs (connection details)
 * between the two players using a 5-character code. Entries expire after ten minutes.
 */
const TTL = 600;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE = /^[A-HJ-NP-Z2-9]{5}$/;
const mem = new Map<string, { v: string; exp: number }>();

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

function sameSite(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return false;
    } catch {
      return false;
    }
  }
  const site = req.headers.get("sec-fetch-site");
  return !site || site === "same-origin";
}

const dev = () => !analyticsConfigured() && process.env.NODE_ENV !== "production";

async function setNX(key: string, value: string): Promise<boolean> {
  if (dev()) {
    const now = Date.now();
    const e = mem.get(key);
    if (e && e.exp > now) return false;
    mem.set(key, { v: value, exp: now + TTL * 1000 });
    return true;
  }
  const [r] = await pipeline([["SET", key, value, "EX", TTL, "NX"]]);
  return r === "OK";
}
async function get(key: string): Promise<string | null> {
  if (dev()) {
    const e = mem.get(key);
    return e && e.exp > Date.now() ? e.v : null;
  }
  const [r] = await pipeline([["GET", key]]);
  return typeof r === "string" ? r : null;
}
async function del(...keys: string[]) {
  if (dev()) { keys.forEach((k) => mem.delete(k)); return; }
  await pipeline([["DEL", ...keys]]);
}
async function limited(ip: string): Promise<boolean> {
  if (dev()) return false;
  const h = createHash("sha256").update(`cup|${ip}`).digest("hex").slice(0, 16);
  const key = `cup:rl:${h}`;
  const [n] = await pipeline([["INCR", key], ["EXPIRE", key, 600]]);
  return Number(n) > 40;
}

const validSdp = (s: unknown): s is string => typeof s === "string" && s.length > 50 && s.length < 14000 && s.startsWith("v=0");

export async function POST(req: Request) {
  if (!sameSite(req)) return json({ error: "Not allowed." }, 403);
  if (!analyticsConfigured() && process.env.NODE_ENV === "production") return json({ error: "Online play is not available right now. You can still play the computer." }, 503);
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "0";
  let body: { action?: string; offer?: unknown; answer?: unknown; code?: unknown };
  try {
    const text = await req.text();
    if (text.length > 20000) return json({ error: "Too large." }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Bad request." }, 400);
  }
  try {
    if (await limited(ip)) return json({ error: "Too many tries. Wait a few minutes." }, 429);
    if (body.action === "create") {
      if (!validSdp(body.offer)) return json({ error: "Bad request." }, 400);
      for (let i = 0; i < 6; i++) {
        let code = "";
        for (let j = 0; j < 5; j++) code += ALPHABET[randomInt(ALPHABET.length)];
        if (await setNX(`cup:o:${code}`, body.offer)) return json({ code });
      }
      return json({ error: "Try again." }, 503);
    }
    const code = typeof body.code === "string" ? body.code.toUpperCase() : "";
    if (!CODE.test(code)) return json({ error: "Bad code." }, 400);
    if (body.action === "answer") {
      if (!validSdp(body.answer)) return json({ error: "Bad request." }, 400);
      if (!(await get(`cup:o:${code}`))) return json({ error: "That code was not found." }, 404);
      const ok = await setNX(`cup:a:${code}`, body.answer);
      return ok ? json({ ok: true }) : json({ error: "Someone already joined with that code." }, 409);
    }
    if (body.action === "close") {
      await del(`cup:o:${code}`, `cup:a:${code}`);
      return json({ ok: true });
    }
    return json({ error: "Bad request." }, 400);
  } catch {
    return json({ error: "The match service is busy. Try again." }, 503);
  }
}

export async function GET(req: Request) {
  if (!sameSite(req)) return json({ error: "Not allowed." }, 403);
  const url = new URL(req.url);
  const code = (url.searchParams.get("code") || "").toUpperCase();
  const part = url.searchParams.get("part");
  if (!CODE.test(code) || (part !== "offer" && part !== "answer")) return json({ error: "Bad request." }, 400);
  try {
    const v = await get(`cup:${part === "offer" ? "o" : "a"}:${code}`);
    if (!v) return part === "offer" ? json({ error: "That code was not found." }, 404) : json({});
    return json(part === "offer" ? { offer: v } : { answer: v });
  } catch {
    return json({ error: "The match service is busy. Try again." }, 503);
  }
}
