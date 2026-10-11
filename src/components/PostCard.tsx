import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="card group flex flex-col overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        <div className="aspect-[16/9] w-full overflow-hidden bg-cream-200">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="gold-fill h-full w-full opacity-60" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-3">
            <span className="chip">{post.category}</span>
            <span className="text-xs text-ink-500">{post.readTime}</span>
          </div>
          <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight text-ink-900 group-hover:text-gold-700">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">{post.excerpt}</p>
          <p className="mt-auto pt-5 text-xs text-ink-500">
            {post.author} · {formatDate(post.date)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export { formatDate };
