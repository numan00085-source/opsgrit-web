import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/site";
import { getFeaturedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import NewsletterCard from "@/components/NewsletterCard";

export default function HomePage() {
  const featured = getFeaturedPosts(3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-700">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(124,131,245,0.16),transparent)]"
        />
        <div className="container-page relative py-24 text-center sm:py-32">
          <span className="chip">B2B Operations · AI Workflows · Enterprise Automation</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
            Run operations with <span className="text-accent-soft">grit</span>, not guesswork.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            {SITE.name} publishes practical playbooks, tool teardowns and SOPs for operators who automate the work
            around the work.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/blog" className="btn-primary">Read the latest</Link>
            <Link href="/#newsletter" className="btn-ghost">Get the weekly brief</Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between">
          <h2 id="featured-heading" className="text-2xl font-bold tracking-tight text-white">Featured articles</h2>
          <Link href="/blog" className="text-sm text-accent-soft hover:underline">View all →</Link>
        </div>
        {featured.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-slate-400">New articles are on the way.</p>
        )}
      </section>

      <section className="container-page pb-16" aria-labelledby="topics-heading">
        <h2 id="topics-heading" className="text-2xl font-bold tracking-tight text-white">Browse by topic</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/blog?category=${encodeURIComponent(c.name)}`}
              className="group rounded-xl border border-ink-700 bg-ink-900 p-6 transition hover:border-accent/60"
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-accent-soft">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.blurb}</p>
              <span className="mt-4 inline-block text-sm text-accent-soft">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page">
        <NewsletterCard />
      </section>
    </>
  );
}
