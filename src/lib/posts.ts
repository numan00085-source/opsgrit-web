import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import GithubSlugger from "github-slugger";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  /** Shorter title for search results (about 60 characters including the site name). */
  seoTitle: string;
  excerpt: string;
  /** Description for search results, 160 characters or fewer. */
  metaDescription: string;
  category: string;
  date: string;
  updated: string;
  author: string;
  coverImage: string;
  readTime: string;
  featured: boolean;
  sponsored: boolean;
  sponsor: string;
  /** Two or three plain sentences that answer the article's main question. Shown at the top and read by search and AI tools. */
  shortAnswer: string;
  /** Questions and answers shown at the end of the article and published as FAQ data. */
  faq: { q: string; a: string }[];
}

export interface Post extends PostMeta {
  content: string;
  headings: { id: string; text: string; level: 2 | 3 }[];
}

function listFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((f) => /\.mdx?$/.test(f));
}

function extractHeadings(content: string): Post["headings"] {
  const slugger = new GithubSlugger();
  const out: Post["headings"] = [];
  let inFence = false;
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[`*_]/g, "");
    out.push({ id: slugger.slug(text), text, level: m[1].length as 2 | 3 });
  }
  return out;
}

/** Search results cut titles at about 60 characters, and the site name is added after the title. */
export function makeSeoTitle(custom: string, title: string): string {
  if (custom.trim()) return custom.trim();
  if (title.length <= 50) return title;
  const head = title.split(":")[0].trim();
  if (head.length >= 24 && head.length <= 50) return head;
  const cut = title.slice(0, 50);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 30)).replace(/[,:;\s-]+$/, "");
}

/** Keep descriptions to 160 characters so Google does not cut them mid-sentence. */
export function makeMetaDescription(custom: string, excerpt: string): string {
  const t = (custom.trim() || excerpt.trim()).replace(/\s+/g, " ");
  if (t.length <= 160) return t;
  const cut = t.slice(0, 157);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > 90) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,:;\s-]+$/, "") + "...";
}

function parseFaq(raw: unknown): { q: string; a: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { q: string; a: string }[] = [];
  for (const item of raw) {
    const q = String((item as { q?: unknown })?.q ?? "").trim();
    const a = String((item as { a?: unknown })?.a ?? "").trim();
    if (q && a) out.push({ q, a });
  }
  return out.slice(0, 8);
}

function parse(file: string): Post {
  const slug = file.replace(/\.mdx?$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const date =
    data.date instanceof Date
      ? data.date.toISOString().slice(0, 10)
      : String(data.date ?? new Date().toISOString().slice(0, 10));
  return {
    slug: String(data.slug || slug),
    title: String(data.title ?? slug),
    seoTitle: makeSeoTitle(String(data.seoTitle ?? ""), String(data.title ?? slug)),
    excerpt: String(data.excerpt ?? ""),
    metaDescription: makeMetaDescription(String(data.metaDescription ?? ""), String(data.excerpt ?? "")),
    category: String(data.category ?? "Ops Stack"),
    date,
    updated:
      data.updated instanceof Date ? data.updated.toISOString().slice(0, 10) : String(data.updated ?? date),
    author: String(data.author ?? "OpsGrit Research Desk"),
    coverImage: String(data.coverImage ?? ""),
    readTime: readingTime(content).text.replace("read", "").trim(),
    featured: Boolean(data.featured),
    sponsored: Boolean(data.sponsored),
    sponsor: String(data.sponsor ?? ""),
    shortAnswer: String(data.shortAnswer ?? "").trim(),
    faq: parseFaq(data.faq),
    content,
    headings: extractHeadings(content),
  };
}

export function getAllPosts(): Post[] {
  return listFiles()
    .map(parse)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostMeta(): PostMeta[] {
  return getAllPosts().map(({ content: _c, headings: _h, ...meta }) => meta);
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getFeaturedPosts(limit = 3): PostMeta[] {
  const all = getAllPostMeta();
  const featured = all.filter((p) => p.featured);
  return (featured.length >= limit ? featured : [...featured, ...all.filter((p) => !p.featured)]).slice(0, limit);
}

/** Bullets from the "Key takeaways" section, shown as a summary at the top of the article. */
export function getTakeaways(content: string): string[] {
  const m = /^##\s+Key takeaways\s*$/im.exec(content);
  if (!m) return [];
  const rest = content.slice(m.index + m[0].length);
  const end = rest.search(/^##\s+/m);
  const block = end === -1 ? rest : rest.slice(0, end);
  return block
    .split("\n")
    .map((l) => /^\s*[-*]\s+(.*)$/.exec(l)?.[1]?.trim())
    .filter((x): x is string => Boolean(x))
    .map((x) => x.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\(.+?\)/g, "$1").replace(/`/g, ""))
    .slice(0, 5);
}
