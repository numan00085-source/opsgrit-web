import { analyticsConfigured, pipeline } from "@/lib/analytics";
import { clientIp, ipKey, normalizeEmail, sameOrigin } from "@/lib/subscribers";

export const runtime = "nodejs";

const json = (body: object, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Request blocked." }, 403);
  let body: { email?: unknown };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return json({ error: "Invalid request." }, 400);
  }
  const email = normalizeEmail(body.email);
  if (!email) return json({ error: "Please enter a valid email address." }, 400);
  if (!analyticsConfigured()) return json({ error: "Please try again soon." }, 503);

  try {
    const key = `og:rl:unsub:${ipKey(clientIp(req))}`;
    const [count] = await pipeline([["INCR", key], ["EXPIRE", key, 3600]]);
    if (Number(count) > 5) return json({ error: "Too many attempts. Please try again later." }, 429);
    await pipeline([["HDEL", "og:subs", email]]);
  } catch {
    return json({ error: "We could not process that. Please try again." }, 502);
  }
  return json({ ok: true, message: "If that address was on our list, it has been removed." });
}
