// Serves /ads.txt for Google AdSense once the publisher id (ca-pub-XXXX) is saved in Admin > Settings.
import { getSettings } from "@/lib/settings";

export const dynamic = "force-static";

export function GET() {
  const client = getSettings().adsense.client;
  const m = /^ca-(pub-\d{8,20})$/.exec(client);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${m[1]}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
