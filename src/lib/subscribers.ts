// Server-only helpers shared by the subscribe / unsubscribe endpoints.
import { createHash } from "node:crypto";

export const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "0";
}

/** One-way hash so rate-limit keys never contain a raw IP address. */
export function ipKey(ip: string): string {
  return createHash("sha256").update(`${process.env.ANALYTICS_SALT || "opsgrit"}|sub|${ip}`).digest("hex").slice(0, 24);
}

export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
