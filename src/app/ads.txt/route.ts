// Serves /ads.txt for Google AdSense once NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX) is set.
export const dynamic = "force-dynamic";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const m = /^ca-(pub-\d{8,20})$/.exec(client);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(`google.com, ${m[1]}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
