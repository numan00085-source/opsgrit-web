import { analyticsConfigured, dayKey, pipeline, visitorId } from "@/lib/analytics";

export const runtime = "nodejs";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http/i;
const PATH = /^\/(blog(\/[a-z0-9][a-z0-9-]{0,100})?|about|contact|privacy-policy|terms-of-service)?$/;
const HOST = /^[a-z0-9][a-z0-9.-]{0,98}$/i;

const empty = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!analyticsConfigured()) return empty();

  // Only accept beacons sent from this site's own pages.
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.get("host")) return empty();
    } catch {
      return empty();
    }
  }

  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return empty();

  let body: { path?: unknown; ref?: unknown; ping?: unknown };
  try {
    const text = await req.text();
    if (text.length > 1000) return empty();
    body = JSON.parse(text);
  } catch {
    return empty();
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0";
  const day = dayKey();
  const vid = visitorId(ip, ua, day);
  const now = Date.now();

  // "Live now" = visitors seen in the last few minutes (heartbeats keep them in the set).
  const cmds: (string | number)[][] = [
    ["ZADD", "og:live", now, vid],
    ["ZREMRANGEBYSCORE", "og:live", 0, now - 5 * 60 * 1000],
    ["EXPIRE", "og:live", 900],
  ];

  if (!body.ping) {
    const path = typeof body.path === "string" ? body.path : "";
    if (!PATH.test(path)) return empty();
    cmds.push(
      ["INCR", "og:total"],
      ["HINCRBY", "og:days", day, 1],
      ["HINCRBY", "og:paths", path, 1],
      ["PFADD", `og:uv:${day}`, vid],
      ["EXPIRE", `og:uv:${day}`, 60 * 60 * 24 * 120],
    );
    const ref = typeof body.ref === "string" ? body.ref.toLowerCase() : "";
    if (ref && HOST.test(ref)) cmds.push(["HINCRBY", "og:ref", ref, 1]);
    const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
    if (/^[A-Z]{2}$/.test(country)) cmds.push(["HINCRBY", "og:country", country, 1]);
  }

  try {
    await pipeline(cmds);
  } catch {
    /* analytics must never break the site */
  }
  return empty();
}
