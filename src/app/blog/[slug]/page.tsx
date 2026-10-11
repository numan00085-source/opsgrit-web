import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { getAllPosts, getPost } from "@/lib/posts";
import { SITE } from "@/lib/site";
import { formatDate } from "@/components/PostCard";
import TableOfContents from "@/components/TableOfContents";
import NewsletterCard from "@/components/NewsletterCard";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate-500">
        <Link href="/" className="hover:text-white">Home</Link> / <Link href="/blog" className="hover:text-white">Articles</Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="chip">{post.category}</Link>
              <span className="chip" aria-label={`Read time ${post.readTime}`}>⏱ {post.readTime}</span>
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-slate-400">{post.excerpt}</p>}
            <p className="mt-6 text-sm text-slate-500">
              By <span className="text-slate-300">{post.author}</span> · {formatDate(post.date)}
            </p>
          </header>

          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              className="mt-10 aspect-[16/9] w-full rounded-xl border border-ink-700 object-cover"
            />
          )}

          <div className="prose prose-lg prose-invert mt-10 max-w-none prose-a:underline-offset-4 prose-pre:bg-ink-900 prose-code:before:content-none prose-code:after:content-none prose-img:rounded-xl">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
                },
              }}
            />
          </div>

          <aside
            aria-label="About the author"
            className="mt-14 flex gap-4 rounded-xl border border-ink-700 bg-ink-900 p-6"
          >
            <div
              aria-hidden
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-deep text-lg font-bold text-white"
            >
              {post.author.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-white">{post.author}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Writes about AI workflows, enterprise automation and operational excellence for {SITE.name}. Content is
                researched, edited and reviewed by our editorial team before publication.
              </p>
            </div>
          </aside>
        </article>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents headings={post.headings} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related">
          <h2 id="related" className="text-xl font-bold text-white">Keep reading</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="block rounded-xl border border-ink-700 bg-ink-900 p-5 transition hover:border-accent/60"
                >
                  <span className="text-xs text-slate-500">{r.readTime}</span>
                  <span className="mt-1 block font-semibold text-white">{r.title}</span>
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
