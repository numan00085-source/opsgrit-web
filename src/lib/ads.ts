// Personal sponsor ads, managed from the admin panel (Admin > Sponsor ads) and stored in content/ads.json.
// Every ad is shown with a visible "Sponsored" label and a rel="sponsored" link.
import adsFile from "../../content/ads.json";

export const PLACEMENTS = ["sidebar", "article-top", "article-end", "home"] as const;
export type Placement = (typeof PLACEMENTS)[number];

export interface AdImage {
  src: string; // /images/... or https://...
  alt: string;
  w: number; // pixel size, used to match an image to a place; 0 if unknown
  h: number;
}

export interface SponsorAdData {
  id: string;
  name: string; // internal name, never shown
  sponsor: string; // shown in the "Sponsored by" label
  images: AdImage[]; // one or more pictures; several rotate gently
  link: string; // https://...
  placements: Placement[];
  enabled: boolean;
  start: string; // YYYY-MM-DD or ""
  end: string; // YYYY-MM-DD or ""
}

const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const day = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

/** Clean untrusted input into valid ads. Used by the site and by the admin API. */
export function normalizeAds(raw: unknown): SponsorAdData[] {
  const list = Array.isArray((raw as { ads?: unknown })?.ads) ? ((raw as { ads: unknown[] }).ads as unknown[]) : [];
  const out: SponsorAdData[] = [];
  for (const r of list.slice(0, 60)) {
    const a = (r ?? {}) as Record<string, unknown>;
    const id = s(a.id, 40);
    const link = s(a.link, 600);
    if (!/^[a-z0-9][a-z0-9-]{3,39}$/.test(id) || !/^https:\/\/[^\s]+$/.test(link)) continue;
    // Older ads stored a single "image" and "alt"; they are read as a one-picture list.
    const rawImages = Array.isArray(a.images) ? a.images : a.image ? [{ src: a.image, alt: a.alt }] : [];
    const images: AdImage[] = [];
    for (const ri of rawImages.slice(0, 6)) {
      const im = (ri ?? {}) as Record<string, unknown>;
      const src = s(im.src, 400);
      if (!/^(\/images\/[^\s]+|https:\/\/[^\s]+)$/.test(src)) continue;
      const dim = (v: unknown) => (typeof v === "number" && v > 0 && v < 20000 ? Math.round(v) : 0);
      images.push({ src, alt: s(im.alt, 160), w: dim(im.w), h: dim(im.h) });
    }
    if (images.length === 0) continue;
    const placements = (Array.isArray(a.placements) ? a.placements : []).filter((p): p is Placement => (PLACEMENTS as readonly string[]).includes(p as string));
    out.push({
      id,
      name: s(a.name, 80) || s(a.sponsor, 80) || id,
      sponsor: s(a.sponsor, 80),
      images,
      link,
      placements: Array.from(new Set(placements)),
      enabled: a.enabled !== false,
      start: day(a.start),
      end: day(a.end),
    });
  }
  return out;
}

export function allAds(): SponsorAdData[] {
  return normalizeAds(adsFile);
}

export function isLive(ad: SponsorAdData, today = new Date().toISOString().slice(0, 10)): boolean {
  return ad.enabled && (!ad.start || ad.start <= today) && (!ad.end || ad.end >= today);
}

/** One ad for a placement. With several candidates the choice depends on the seed (for example the article slug), so pages vary. */
export function pickAd(placement: Placement, seed = ""): SponsorAdData | null {
  const live = allAds().filter((a) => isLive(a) && a.placements.includes(placement));
  if (live.length === 0) return null;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return live[h % live.length];
}

export function getAd(id: string): SponsorAdData | null {
  return allAds().find((a) => a.id === id) ?? null;
}

/** The pictures of an ad that suit a place: wide banners for wide places, box shapes for the sidebar. Falls back to all of them. */
export function imagesFor(ad: SponsorAdData, placement: Placement): AdImage[] {
  const wantWide = placement !== "sidebar";
  const fits = ad.images.filter((im) => (im.w && im.h ? (im.w / im.h >= 1.8) === wantWide : true));
  return fits.length ? fits : ad.images;
}
