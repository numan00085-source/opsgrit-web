// Server-only helpers for the first-party page-view counter (stored in Upstash Redis via its REST API).
import { createHash } from "node:crypto";

const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const TZ = process.env.ANALYTICS_TZ || "America/Detroit";

export const analyticsConfigured = () => Boolean(REST_URL && REST_TOKEN);

export async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
  if (!REST_URL || !REST_TOKEN) return [];
  const res = await fetch(`${REST_URL.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis request failed (${res.status})`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => r.result);
}

/** Calendar day (YYYY-MM-DD) in the reporting time zone. */
export function dayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/**
 * Anonymous visitor id: a one-way hash of IP + user agent + the current day.
 * Nothing is stored on the visitor's device and the IP itself is never saved.
 */
export function visitorId(ip: string, ua: string, day: string): string {
  const salt = process.env.ANALYTICS_SALT || "opsgrit";
  return createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 16);
}

/**
 * Visit id: one-way hash of IP + user agent (no day). The same person is counted as ONE visitor
 * for 24 hours, no matter how many pages they open. The IP itself is never stored.
 */
export function visitId(ip: string, ua: string): string {
  const salt = process.env.ANALYTICS_SALT || "opsgrit";
  return createHash("sha256").update(`${salt}|visit|${ip}|${ua}`).digest("hex").slice(0, 20);
}

export const VISIT_WINDOW_SECONDS = 24 * 60 * 60;
