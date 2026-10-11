import { analyticsConfigured, pipeline } from "@/lib/analytics";
import { clientIp, ipKey, normalizeEmail, sameOrigin } from "@/lib/subscribers";

export const runtime = "nodejs";

const json = (body: object, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Request blocked." }, 403);

  let body: { email?: unknown; website?: unknown; from?: unknown };
  try {
    const text = await req.text();
    if (text.length > 2000) return json({ error: "Request too large." }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: bots fill the hidden field. Pretend success so they learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, message: "Thanks for subscribing." });
  }

  const email = normalizeEmail(body.email);
  if (!email) return json({ error: "Please enter a valid email address." }, 400);

  if (!analyticsConfigured()) {
    return json({ error: "Subscriptions are temporarily unavailable. Please try again soon." }, 503);
  }

  try {
    // Max 5 attempts per hour per visitor.
    const key = `og:rl:sub:${ipKey(clientIp(req))}`;
    const [count] = await pipeline([["INCR", key], ["EXPIRE", key, 3600]]);
    if (Number(count) > 5) return json({ error: "Too many attempts. Please try again later." }, 429);

    const from = typeof body.from === "string" && /^\/[a-z0-9/_-]{0,120}$/i.test(body.from) ? body.from : "/";
    // HSETNX keeps the first sign-up date and silently ignores duplicates.
    await pipeline([["HSETNX", "og:subs", email, JSON.stringify({ t: Date.now(), from })]]);
  } catch {
    return json({ error: "We could not save your subscription. Please try again." }, 502);
  }

  // Same answer for new and existing addresses, so the form cannot be used to probe who is subscribed.
  return json({ ok: true, message: "Thanks for subscribing. Your first OpsGrit Brief is on its way." });
}
