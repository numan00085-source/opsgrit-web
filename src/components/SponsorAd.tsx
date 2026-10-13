import { pickAd, type Placement } from "@/lib/ads";

// One personal sponsor ad. Quiet on purpose: a small "Sponsored" label, the image, no motion, no pop-ups.
// Clicks go through /api/ad/<id> so the owner can see how many clicks a sponsor got.
export default function SponsorAd({ placement, seed = "", className = "" }: { placement: Placement; seed?: string; className?: string }) {
  const ad = pickAd(placement, seed);
  if (!ad) return null;
  const sidebar = placement === "sidebar";
  return (
    <aside aria-label="Sponsored" className={`${sidebar ? "my-6" : "my-10"} ${className}`}>
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
        <span>Sponsored</span>
        {ad.sponsor && <span className="font-medium normal-case tracking-normal text-ink-500/90">· {ad.sponsor}</span>}
      </p>
      <a
        href={`/api/ad/${ad.id}`}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        className="group block overflow-hidden rounded-xl border border-cream-300 bg-white/70 shadow-[0_10px_30px_-20px_rgba(122,91,16,0.45)] transition hover:border-gold-400"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.image}
          alt={ad.alt || (ad.sponsor ? `Sponsored by ${ad.sponsor}` : "Sponsored")}
          loading="lazy"
          decoding="async"
          className={`block h-auto w-full ${sidebar ? "" : "max-h-[280px] object-contain"}`}
        />
      </a>
    </aside>
  );
}
