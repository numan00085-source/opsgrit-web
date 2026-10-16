import fs from "node:fs";
import path from "node:path";
import { getAllPostMeta } from "@/lib/posts";

const DIR = path.join(process.cwd(), "content", "puzzles");

export type Tier = "best" | "risky" | "bad";
export interface Puzzle {
  id: string; // slug:index
  slug: string;
  article: string; // article title
  scenario: string;
  question: string;
  options: { text: string; tier: Tier }[];
  why: string;
}

function valid(p: unknown): p is Omit<Puzzle, "id" | "slug" | "article"> {
  const x = p as Puzzle;
  if (!x || typeof x.scenario !== "string" || typeof x.question !== "string" || typeof x.why !== "string") return false;
  if (!Array.isArray(x.options) || x.options.length !== 3) return false;
  const tiers = x.options.map((o) => o?.tier).sort().join(",");
  return tiers === "bad,best,risky" && x.options.every((o) => typeof o.text === "string" && o.text.trim());
}

/** All puzzles whose source article still exists, newest article first. */
export function getAllPuzzles(): Puzzle[] {
  if (!fs.existsSync(DIR)) return [];
  const posts = getAllPostMeta();
  const out: Puzzle[] = [];
  for (const post of posts) {
    const file = path.join(DIR, `${post.slug}.json`);
    if (!fs.existsSync(file)) continue;
    try {
      const rows = JSON.parse(fs.readFileSync(file, "utf8"));
      if (!Array.isArray(rows)) continue;
      rows.forEach((r, i) => {
        if (valid(r)) out.push({ ...r, id: `${post.slug}:${i}`, slug: post.slug, article: post.title });
      });
    } catch {
      /* skip a broken file instead of failing the build */
    }
  }
  return out;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Today's date in New York, so the puzzle changes at the same moment for every visitor. */
export function todayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/**
 * Rendezvous hashing: each puzzle gets a score from (date + id) and the top N win.
 * Adding a new article's puzzles never reshuffles which old puzzles are picked on past days
 * more than necessary, and the pick is the same for everyone on a given date.
 */
export function pickDaily(all: Puzzle[], date: string, n = 3): Puzzle[] {
  return [...all].sort((a, b) => hash(`${date}|${b.id}`) - hash(`${date}|${a.id}`)).slice(0, n);
}

export function latestArticlePuzzles(all: Puzzle[]): { title: string; slug: string; puzzles: Puzzle[] } | null {
  if (!all.length) return null;
  const slug = all[0].slug; // getAllPostMeta is newest first
  return { title: all[0].article, slug, puzzles: all.filter((p) => p.slug === slug) };
}
