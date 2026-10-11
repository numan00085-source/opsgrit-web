import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, SITE, TOPIC_INTROS } from "@/lib/site";
import { getAllPostMeta } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import NewsletterCard from "@/components/NewsletterCard";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const info = TOPIC_INTROS[slug];
  if (!cat || !info) return {};
  return {
    title: `${cat.name}: guides and playbooks`,
    description: info.intro.slice(0, 158),
    alternates: { canonical: `/topics/${slug}` },
  };
}

export default async function TopicPage({ params }: { params: Params }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const info = TOPIC_INTROS[slug];
  if (!cat || !info) notFound();

  const posts = getAllPostMeta().filter((p) => p.category === cat.name);
  const start = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== start?.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.name} | ${SITE.name}`,
    description: info.intro,
    url: `${SITE.url}/topics/${slug}`,
    hasPart: posts.map((p) => ({ "@type": "Article", headline: p.title, url: `${SITE.url}/blog/${p.slug}` })),
  };

  return (
    <div className="container-page py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink-500">
        <Link href="/" className="hover:text-gold-700">Home</Link> / {cat.name}
      </nav>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">{cat.name}</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">{info.headline}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink-600">{info.intro}</p>

      {start && (
        <section className="mt-12" aria-labelledby="start-here">
          <h2 id="start-here" className="text-sm font-bold uppercase tracking-[0.18em] text-ink-500">Start here</h2>
          <Link href={`/blog/${start.slug}`} className="card mt-4 block p-7 sm:p-9">
            <span className="chip">{start.readTime}</span>
            <span className="mt-4 block text-2xl font-extrabold tracking-tight text-ink-900">{start.title}</span>
            <span className="mt-3 block max-w-3xl leading-relaxed text-ink-600">{start.excerpt}</span>
            <span className="mt-4 inline-block text-sm font-semibold text-gold-700">Read the guide →</span>
          </Link>
        </section>
      )}

      {rest.length > 0 && (
        <section className="mt-12" aria-labelledby="all-guides">
          <h2 id="all-guides" className="text-sm font-bold uppercase tracking-[0.18em] text-ink-500">More in {cat.name}</h2>
          <div className="mt-4 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </section>
      )}

      <section className="mt-12 rounded-2xl bg-night-950 p-7 text-white" aria-label="Related free tool">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Free tool</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {info.tools.map((t) => (
            <Link key={t.href} href={t.href} className="btn-primary">{t.label}</Link>
          ))}
          <Link href="/glossary" className="btn-ghost !border-white/20 !text-white">Glossary</Link>
        </div>
      </section>

      <div className="mt-14"><NewsletterCard /></div>
    </div>
  );
}
