import Link from "next/link";
import { CATEGORIES } from "@/lib/site";
import { getAllPostMeta, getFeaturedPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import NewsletterCard from "@/components/NewsletterCard";
import HeroScene from "@/components/HeroScene";
import SponsorAd from "@/components/SponsorAd";
import { getSettings } from "@/lib/settings";

// "Run *grit*" style markup: the word between asterisks is shown in gold.
function GoldTitle({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <span key={i} className="gold-text-light">{part.slice(1, -1)}</span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

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
    body: "We use AI to help research and draft, and say so. Every article goes through an automated editorial review before it goes live. See how we work in our editorial policy.",
  },
];

export default function HomePage() {
  const home = getSettings().home;
  const all = getAllPostMeta();
  const picked = home.featuredSlugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const featured = picked.length ? picked.slice(0, 3) : getFeaturedPosts(3);
  const latest = all.filter((p) => !featured.some((f) => f.slug === p.slug)).slice(0, 6);

  return (
    <>
      <HeroScene>
        <span className="inline-flex items-center rounded-full border border-gold-400/40 bg-white/5 px-3 py-1 text-xs font-semibold text-gold-200">
          {home.heroEyebrow}
        </span>
        <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl">
          <GoldTitle text={home.heroTitle} />
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
          {home.heroSubtitle}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/blog" className="btn-primary !px-7 !py-3">Read the latest</Link>
          <Link
            href="/tools"
            className="inline-flex items-center justify-center rounded-lg border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:border-gold-300/70 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            Try the free tools
          </Link>
        </div>
      </HeroScene>

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

      <div className="container-page">
        <SponsorAd placement="home" className="mx-auto max-w-3xl !mt-0 !mb-16" />
      </div>

      <section className="bg-night-950 py-20" aria-labelledby="why-heading">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">The OpsGrit standard</p>
          <h2 id="why-heading" className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-white">
            Operations guides that are useful first
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

      {home.showSponsorBand && (
      <section className="container-page pb-20 pt-6" aria-labelledby="partner-heading">
        <div className="card flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">For vendors and partners</p>
            <h2 id="partner-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900">
              {home.sponsorTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              {home.sponsorText}
            </p>
          </div>
          <Link href="/advertise" className="btn-primary !px-6 !py-3 shrink-0">See sponsor options</Link>
        </div>
      </section>
      )}
    </>
  );
}
