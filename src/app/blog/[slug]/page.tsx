import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllPosts, getPost, getTakeaways } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { formatDate } from "@/components/PostCard";
import TableOfContents from "@/components/TableOfContents";
import NewsletterCard from "@/components/NewsletterCard";
import AdUnit from "@/components/AdUnit";
import SponsorAd from "@/components/SponsorAd";
import { adsenseClient, getSettings } from "@/lib/settings";
import ReadingProgress from "@/components/ReadingProgress";
import ShareBar from "@/components/ShareBar";

function SponsoredLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = typeof props.href === "string" && /^https?:\/\//i.test(props.href);
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return external ? <a {...props} rel="sponsored noopener noreferrer" target="_blank" /> : <a {...props} />;
}

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.seoTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.metaDescription,
      publishedTime: post.date,
      authors: [post.author],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = getAllPosts().filter((p) => p.slug !== post.slug);
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 4);
  const takeaways = getTakeaways(post.content);
  const topicSlug = post.category.toLowerCase().replace(/\s+/g, "-");
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: post.category, item: `${SITE.url}/topics/${topicSlug}` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE.url}/blog/${post.slug}` },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated,
    author: { "@type": "Organization", name: post.author, url: `${SITE.url}/editorial-policy` },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    image: post.coverImage
      ? post.coverImage.startsWith("/")
        ? `${SITE.url}${post.coverImage}`
        : post.coverImage
      : undefined,
  };

  return (
    <div className="container-page py-12">
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }} />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink-500">
        <Link href="/" className="hover:text-gold-700">Home</Link> / <Link href={`/topics/${topicSlug}`} className="hover:text-gold-700">{post.category}</Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/topics/${topicSlug}`} className="chip">{post.category}</Link>
              <span className="chip" aria-label={`Read time ${post.readTime}`}>⏱ {post.readTime}</span>
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-ink-600">{post.excerpt}</p>}
            <p className="mt-6 text-sm text-ink-500">
              By <Link href="/editorial-policy" className="font-medium text-ink-800 underline decoration-gold-500 underline-offset-2">{post.author}</Link> · Published {formatDate(post.date)}
              {post.updated !== post.date && <> · Updated {formatDate(post.updated)}</>}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              AI-assisted research and drafting, checked by automated editorial review.{" "}
              <Link href="/editorial-policy" className="underline underline-offset-2">How we make articles</Link>
            </p>
          </header>

          {post.sponsored && (
            <aside
              aria-label="Sponsored content notice"
              className="mt-8 rounded-xl border border-gold-400/60 bg-gold-100/60 p-4 text-sm leading-relaxed text-ink-700"
            >
              <strong className="text-ink-900">Sponsored content.</strong>{" "}
              {post.sponsor ? `This article was sponsored by ${post.sponsor}. ` : "This article was sponsored. "}
              Sponsors do not influence our independent coverage. <a className="font-semibold underline decoration-gold-500 underline-offset-2" href="/advertise">Learn more</a>.
            </aside>
          )}

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={`Illustration for ${post.title}`}
              className="mt-10 aspect-[16/9] w-full rounded-2xl border border-cream-300 object-cover shadow-[0_18px_40px_-24px_rgba(122,91,16,0.5)]"
            />
          )}

          {takeaways.length > 0 && (
            <aside aria-label="In short" className="mt-10 rounded-2xl border border-gold-400/50 bg-gold-100/50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">In short</p>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-800">
                {takeaways.map((t) => (
                  <li key={t} className="flex gap-3"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" /><span>{t}</span></li>
                ))}
              </ul>
            </aside>
          )}

          <SponsorAd placement="article-top" seed={post.slug} />

          <div id="article-body" className="prose prose-lg mt-10 max-w-none prose-a:underline-offset-4 prose-pre:bg-ink-900 prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl">
            <MDXRemote
              source={post.content}
              components={post.sponsored ? { a: SponsoredLink } : undefined}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
                },
              }}
            />
          </div>

          <ShareBar url={`${SITE.url}/blog/${post.slug}`} title={post.title} />

          <SponsorAd placement="article-end" seed={post.slug} />

          <AdUnit client={adsenseClient()} slot={getSettings().adsense.slotArticle} />

          <aside
            aria-label="About the author"
            className="card mt-14 flex gap-4 p-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-xl shadow-[0_2px_10px_-2px_rgba(212,175,79,0.5)]" />
            <div>
              <p className="font-semibold text-ink-900">{post.author}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">
                A team byline, not an individual. Articles are researched and drafted with AI assistance and checked
                by our automated editorial review before publication. Prices and features change, so check the vendor before
                you buy. See our <Link className="font-semibold underline decoration-gold-500 underline-offset-2" href="/editorial-policy">editorial policy</Link>{" "}
                or <Link className="font-semibold underline decoration-gold-500 underline-offset-2" href="/contact">report an error</Link>.
              </p>
            </div>
          </aside>
        </article>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={post.headings} />
            <SponsorAd placement="sidebar" seed={post.slug} />
            <AdUnit client={adsenseClient()} slot={getSettings().adsense.slotSidebar} className="!my-6" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-xl font-extrabold text-ink-900">Keep reading</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="card block p-5"
                >
                  <span className="text-xs text-ink-500">{r.readTime}</span>
                  <span className="mt-1 block font-semibold text-ink-900">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16">
        <NewsletterCard />
      </div>
    </div>
  );
}
