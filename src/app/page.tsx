import Link from "next/link";
import { CATEGORIES, SITE } from "@/lib/site";
import { getAllPostMeta, getFeaturedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import NewsletterCard from "@/components/NewsletterCard";

const PILLARS = [
  {
    title: "Built for operators",
    body: "Every piece starts from a real operating problem: a broken handoff, a manual report, a tool that does not talk to the rest of the stack.",
  },
  {
    title: "Sourced and dated",
    body: "We cite primary sources, state our assumptions and update articles when the facts change, so you know what you are relying on.",
  },
  {
    title: "Reviewed before it ships",
    body: "We use AI to help research and draft, and say so. An editor reviews every article before it goes live. See how we work in our editorial policy.",
  },
];

export default function HomePage() {
  const featured = getFeaturedPosts(3);
  const all = getAllPostMeta();
  const latest = all.filter((p) => !featured.some((f) => f.slug === p.slug)).slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(212,175,79,0.22),transparent)]"
        />
        <div className="container-page relative py-24 text-center sm:py-32">
          <span className="chip">B2B Operations · AI Workflows · Enterprise Automation</span>
          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-7xl">
            Run operations with <span className="gold-text">grit</span>, not guesswork.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-600 sm:text-xl">
            {SITE.name} publishes practical guides, decision frameworks and SOP templates for the people who keep
            operations running, with free tools you can use today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/blog" className="btn-primary !px-7 !py-3">Read the latest</Link>
            <Link href="/tools" className="btn-ghost !px-7 !py-3">Try the free tools</Link>
          </div>
        </div>
        <div className="gold-rule" />
      </section>

      <section className="container-page py-20" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Start here</p>
            <h2 id="featured-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">
              Featured articles
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-semibold text-gold-700 hover:underline">View all →</Link>
        </div>
        {featured.length ? (
          <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-ink-600">New articles are on the way.</p>
        )}
      </section>

      {latest.length > 0 && (
        <section className="container-page pb-20" aria-labelledby="latest-heading">
          <div className="flex items-end justify-between gap-4">
            <h2 id="latest-heading" className="text-3xl font-extrabold tracking-tight text-ink-900">Latest guides</h2>
            <Link href="/blog" className="text-sm font-semibold text-gold-700 hover:underline">All {all.length} articles →</Link>
          </div>
          <div className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}

      <section className="bg-night-950 py-20" aria-labelledby="why-heading">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">The OpsGrit standard</p>
          <h2 id="why-heading" className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-white">
            Useful first. Everything else second.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <div key={p.title} className="rounded-2xl border border-night-700 bg-night-800 p-7 transition hover:border-gold-400/60">
                <span className="gold-tile grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold text-ink-900">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-4" aria-labelledby="tools-heading">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Free tools</p>
        <h2 id="tools-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">Use it today, no signup</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/tools/ops-bot", t: "OpsGrit Bot", d: "A free assistant that answers operations and automation questions from our guides." },
            { href: "/tools/roi-calculator", t: "Automation ROI calculator", d: "Hours saved, payback and first-year ROI from your own numbers." },
            { href: "/tools/sop-builder", t: "SOP builder", d: "Answer a few prompts, get a structured procedure to copy or download." },
            { href: "/tools/stack-audit", t: "Tech stack audit worksheet", d: "Inventory your tools, see total cost and what to merge or retire." },
          ].map((x) => (
            <Link key={x.href} href={x.href} className="card group p-6">
              <h3 className="text-lg font-bold text-ink-900 group-hover:text-gold-700">{x.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{x.d}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-gold-700">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="topics-heading">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Topics</p>
        <h2 id="topics-heading" className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">Browse by topic</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/topics/${c.slug}`}
              className="card group p-7"
            >
              <h3 className="text-lg font-bold text-ink-900 group-hover:text-gold-700">{c.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{c.blurb}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-gold-700">Explore →</span>
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
