import Anthropic from "@anthropic-ai/sdk";
import { analyticsConfigured, dayKey, pipeline } from "@/lib/analytics";
import { clientIp, ipKey, sameOrigin } from "@/lib/subscribers";
import { BOT_RULES, knowledgeIndex } from "@/lib/botKnowledge";
import { reply as kbReply, knowledgeSummary } from "@/lib/botEngine";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.BOT_MODEL || "claude-haiku-5-5";
const DAILY_CAP = Number(process.env.BOT_DAILY_LIMIT || 300); // total bot messages per day across all visitors
// AI mode costs money per message, so its limits are tight. Knowledge-base mode is free, so limits only stop abuse.
const AI_LIMITS = { per10: 10, perDay: 40, total: DAILY_CAP };
const KB_LIMITS = { per10: 40, perDay: 300, total: 1_000_000 };

/** AI answers when an API key is set (and BOT_MODE is not "kb"); otherwise the free knowledge-base engine. */
const botMode = (): "ai" | "kb" => (process.env.ANTHROPIC_API_KEY && process.env.BOT_MODE !== "kb" ? "ai" : "kb");

export async function GET() {
  return json({ mode: botMode(), ...knowledgeSummary() });
}
const MAX_USER_CHARS = 600;
const MAX_TURNS = 8;

const json = (body: object, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

// Dev-only fallback limiter (production requires Redis so limits survive across serverless instances).
const mem = new Map<string, { n: number; t: number }>();
function memHit(key: string, ttlMs: number): number {
  const now = Date.now();
  const cur = mem.get(key);
  if (!cur || now - cur.t > ttlMs) {
    mem.set(key, { n: 1, t: now });
    return 1;
  }
  cur.n += 1;
  return cur.n;
}

type Msg = { role: "user" | "assistant"; content: string };

function clean(raw: unknown): Msg[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: Msg[] = [];
  for (const m of raw.slice(-MAX_TURNS)) {
    if (!m || typeof m !== "object") return null;
    const role = (m as Msg).role;
    const content = (m as Msg).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, role === "user" ? MAX_USER_CHARS : 2500);
    if (!text) return null;
    out.push({ role, content: text });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return null;
  // Roles must alternate for the API; collapse neighbours of the same role.
  const merged: Msg[] = [];
  for (const m of out) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += `\n${m.content}`;
    else merged.push({ ...m });
  }
  return merged;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Request blocked." }, 403);

  let body: { messages?: unknown };
  try {
    const text = await req.text();
    if (text.length > 14000) return json({ error: "Request too large." }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const messages = clean(body.messages);
  if (!messages) return json({ error: "Please type a short question." }, 400);

  const mode = botMode();
  const LIM = mode === "ai" ? AI_LIMITS : KB_LIMITS;
  const prod = process.env.NODE_ENV === "production";
  if (mode === "ai" && prod && !analyticsConfigured()) {
    return json({ error: "OpsGrit Bot is temporarily unavailable. Please try again soon." }, 503);
  }

  // Rate limits: per visitor (10 min and 1 day) and a global daily cap, so costs can never run away.
  try {
    const ip = ipKey(clientIp(req));
    const day = dayKey();
    let short: number, daily: number, total: number;
    if (analyticsConfigured()) {
      const r = await pipeline([
        ["INCR", `og:rl:bot10:${ip}`],
        ["EXPIRE", `og:rl:bot10:${ip}`, 600],
        ["INCR", `og:rl:botd:${ip}:${day}`],
        ["EXPIRE", `og:rl:botd:${ip}:${day}`, 90000],
        ["INCR", `og:bot:total:${day}`],
        ["EXPIRE", `og:bot:total:${day}`, 172800],
      ]);
      short = Number(r[0]);
      daily = Number(r[2]);
      total = Number(r[4]);
    } else {
      short = memHit(`s:${ip}`, 600_000);
      daily = memHit(`d:${ip}`, 86_400_000);
      total = memHit(`t:${day}`, 86_400_000);
    }
    if (short > LIM.per10) return json({ error: "You are moving fast! Please wait a few minutes and try again." }, 429);
    if (daily > LIM.perDay) return json({ error: "That is the daily limit for one visitor. Come back tomorrow, and meanwhile explore the articles." }, 429);
    if (total > LIM.total) return json({ error: "OpsGrit Bot has reached today's limit. Please try again tomorrow." }, 429);
  } catch {
    return json({ error: "OpsGrit Bot is temporarily unavailable. Please try again." }, 502);
  }

  if (mode === "kb") {
    const r = kbReply(messages);
    return json({ mode: "kb", text: r.text, suggestions: r.suggestions });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1 });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = client.messages.stream({
          model: MODEL,
          max_tokens: 700,
          system: [
            { type: "text", text: BOT_RULES },
            { type: "text", text: knowledgeIndex(), cache_control: { type: "ephemeral" } },
          ],
          messages,
        });
        s.on("text", (t) => controller.enqueue(encoder.encode(t)));
        await s.finalMessage();
      } catch {
        controller.enqueue(encoder.encode("\n\n[Sorry, something went wrong. Please try again.]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
