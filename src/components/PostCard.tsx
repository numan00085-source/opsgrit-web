import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 transition hover:border-accent/60">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        <div className="aspect-[16/9] w-full overflow-hidden bg-ink-800">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-ink-700 via-ink-800 to-accent-deep/40" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-3">
            <span className="chip">{post.category}</span>
            <span className="text-xs text-slate-500">{post.readTime}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug text-white group-hover:text-accent-soft">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
          <p className="mt-auto pt-4 text-xs text-slate-500">
            {post.author} · {formatDate(post.date)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export { formatDate };
