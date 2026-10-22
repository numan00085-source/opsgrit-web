import Link from "next/link";

export interface NextItem {
  href: string;
  title: string;
  body: string;
  tag: string;
}

/** A short "what to do next" row under a tool: related guides and tools. */
export default function ToolNext({ items, heading = "Keep going" }: { items: NextItem[]; heading?: string }) {
  return (
    <section className="mt-14" aria-labelledby="next-steps">
      <h2 id="next-steps" className="text-xl font-extrabold text-ink-900">{heading}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="card group p-5">
            <span className="chip">{i.tag}</span>
            <p className="mt-3 font-bold text-ink-900 group-hover:text-gold-700">{i.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">{i.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
