"use client";

import { useEffect, useMemo, useState } from "react";
import type { PostMeta } from "@/lib/posts";
import PostCard from "./PostCard";

// The full article list is rendered on the server (good for SEO and crawlers).
// Filtering happens in the browser; the ?category= value is read after hydration.
export default function BlogExplorer({ posts, categories }: { posts: PostMeta[]; categories: string[] }) {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("category");
    if (cat && categories.includes(cat)) setActive(cat);
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const inCat = active === "All" || p.category === active;
      const inText =
        !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      return inCat && inText;
    });
  }, [posts, active, query]);

  function setCategory(cat: string) {
    setActive(cat);
    const url = new URL(window.location.href);
    if (cat === "All") url.searchParams.delete("category");
    else url.searchParams.set("category", cat);
    window.history.replaceState(null, "", url.pathname + url.search);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                active === c
                  ? "border-gold-500 gold-fill font-semibold text-ink-900"
                  : "border-cream-400 bg-white/60 text-ink-700 hover:border-gold-500 hover:text-ink-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="w-full md:w-72">
          <label htmlFor="search" className="sr-only">Search articles</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-lg border border-cream-400 bg-white px-4 py-2 text-sm text-ink-900 placeholder:text-ink-500/70 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-300"
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-500" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "article" : "articles"}
      </p>

      {filtered.length ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-cream-400 p-12 text-center text-ink-600">
          No articles match your search yet.
        </div>
      )}
    </div>
  );
}
