import { getAd } from "@/lib/ads";
import { analyticsConfigured, dayKey, pipeline } from "@/lib/analytics";

export const runtime = "nodejs";

// Counts a sponsor click, then sends the visitor to the sponsor's page. Only links saved in the admin are ever used,
// so this cannot be turned into an open redirect.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = getAd(id);
  if (!ad) return new Response("Not found", { status: 404 });

  const ua = req.headers.get("user-agent") || "";
  const bot = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless/i.test(ua);
  if (!bot && analyticsConfigured()) {
    try {
      await pipeline([
        ["HINCRBY", "og:adclicks", id, 1],
        ["HINCRBY", `og:adclicks:${dayKey()}`, id, 1],
        ["EXPIRE", `og:adclicks:${dayKey()}`, 60 * 60 * 24 * 120],
      ]);
    } catch {
      /* counting must never stop the visitor from reaching the sponsor */
    }
  }
  return new Response(null, {
    status: 302,
    headers: { Location: ad.link, "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
