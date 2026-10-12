// Site settings that the admin panel edits. They live in content/settings.json (committed to GitHub by the admin),
// so changing one rebuilds the site automatically and no Vercel dashboard step is needed.
// Environment variables still work as a fallback for the values that used to be env-only.
import fs from "node:fs";
import path from "node:path";

export interface SiteSettings {
  adsense: { client: string; slotArticle: string; slotSidebar: string; enabled: boolean };
  googleVerification: string;
  contactEmail: string;
  social: { x: string; linkedin: string };
  announcement: { enabled: boolean; text: string; link: string };
  home: {
    heroEyebrow: string;
    heroTitle: string; // wrap one word in *asterisks* to make it gold
    heroSubtitle: string;
    featuredSlugs: string[];
    showSponsorBand: boolean;
    sponsorTitle: string;
    sponsorText: string;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  adsense: { client: "", slotArticle: "", slotSidebar: "", enabled: true },
  googleVerification: "",
  contactEmail: "opsgrit.com@gmail.com",
  social: { x: "https://x.com/OpsGrit", linkedin: "" },
  announcement: { enabled: false, text: "", link: "" },
  home: {
    heroEyebrow: "B2B Operations · AI Workflows · Enterprise Automation",
    heroTitle: "Run operations with *grit*, not guesswork.",
    heroSubtitle:
      "OpsGrit publishes practical guides, decision frameworks and SOP templates for the people who keep operations running, with free tools you can use today.",
    featuredSlugs: [],
    showSponsorBand: true,
    sponsorTitle: "Reach the people who run operations",
    sponsorText:
      "Sponsor an evergreen guide, a display placement or the weekly brief. Every placement is clearly labeled and kept separate from our editorial.",
  },
};

const str = (v: unknown, fallback: string, max = 400) => (typeof v === "string" ? v.trim().slice(0, max) : fallback);
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

/** Clean untrusted input into a complete settings object. Used by the site and by the admin API. */
export function normalizeSettings(raw: unknown): SiteSettings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const d = DEFAULT_SETTINGS;
  const ad = r.adsense ?? {};
  const so = r.social ?? {};
  const an = r.announcement ?? {};
  const h = r.home ?? {};
  return {
    adsense: {
      client: str(ad.client, d.adsense.client, 40),
      slotArticle: str(ad.slotArticle, d.adsense.slotArticle, 30),
      slotSidebar: str(ad.slotSidebar, d.adsense.slotSidebar, 30),
      enabled: bool(ad.enabled, d.adsense.enabled),
    },
    googleVerification: str(r.googleVerification, d.googleVerification, 120),
    contactEmail: str(r.contactEmail, d.contactEmail, 120),
    social: { x: str(so.x, d.social.x, 200), linkedin: str(so.linkedin, d.social.linkedin, 200) },
    announcement: { enabled: bool(an.enabled, false), text: str(an.text, "", 200), link: str(an.link, "", 300) },
    home: {
      heroEyebrow: str(h.heroEyebrow, d.home.heroEyebrow, 120),
      heroTitle: str(h.heroTitle, d.home.heroTitle, 140) || d.home.heroTitle,
      heroSubtitle: str(h.heroSubtitle, d.home.heroSubtitle, 400) || d.home.heroSubtitle,
      featuredSlugs: Array.isArray(h.featuredSlugs)
        ? h.featuredSlugs.filter((s: unknown): s is string => typeof s === "string" && /^[a-z0-9-]{1,120}$/.test(s)).slice(0, 6)
        : [],
      showSponsorBand: bool(h.showSponsorBand, true),
      sponsorTitle: str(h.sponsorTitle, d.home.sponsorTitle, 120) || d.home.sponsorTitle,
      sponsorText: str(h.sponsorText, d.home.sponsorText, 300) || d.home.sponsorText,
    },
  };
}

let cached: SiteSettings | null = null;

export function getSettings(): SiteSettings {
  if (cached && process.env.NODE_ENV === "production") return cached;
  let raw: unknown = {};
  try {
    raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "settings.json"), "utf8"));
  } catch {
    /* no file yet: use defaults */
  }
  const s = normalizeSettings(raw);
  // Environment variables fill any value that is still empty in the file.
  s.adsense.client ||= process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  s.adsense.slotArticle ||= process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE || "";
  s.adsense.slotSidebar ||= process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "";
  s.googleVerification ||= process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";
  if (process.env.NEXT_PUBLIC_CONTACT_EMAIL && s.contactEmail === DEFAULT_SETTINGS.contactEmail) {
    s.contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  }
  cached = s;
  return s;
}

/** The AdSense publisher id, only when ads are switched on and the id looks valid. */
export function adsenseClient(s: SiteSettings = getSettings()): string {
  return s.adsense.enabled && /^ca-pub-\d{8,20}$/.test(s.adsense.client) ? s.adsense.client : "";
}
