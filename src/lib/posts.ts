import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import GithubSlugger from "github-slugger";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  coverImage: string;
  readTime: string;
  featured: boolean;
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
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? "Ops Stack"),
    date,
    author: String(data.author ?? "OpsGrit Editorial"),
    coverImage: String(data.coverImage ?? ""),
    readTime: readingTime(content).text.replace("read", "").trim(),
    featured: Boolean(data.featured),
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
