import Link from "next/link";
import RaciGenerator from "@/app/tools/raci-generator/RaciGenerator";

/** Inline interactive RACI builder for use inside articles. */
export function RaciEmbed() {
  return (
    <div className="not-prose my-10 rounded-2xl border border-gold-300 bg-white/80 p-4 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Try it here</p>
      <p className="mt-1 text-sm text-ink-600">
        Build your own RACI matrix below. It runs in your browser, nothing is uploaded. Full-page version:{" "}
        <Link href="/tools/raci-generator" className="font-semibold underline decoration-gold-500 underline-offset-2">RACI generator</Link>.
      </p>
      <div className="mt-4"><RaciGenerator /></div>
    </div>
  );
}

/** A link card to one of the free tools. */
export function ToolCard({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-gold-300 bg-gold-50/60 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Free tool</p>
      <Link href={href} className="mt-1 block text-lg font-extrabold text-ink-900 underline decoration-gold-500 underline-offset-4">{title}</Link>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">{children}</p>
    </div>
  );
}

/** A downloadable template card (file lives in /public/downloads). */
export function Download({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 flex items-start gap-4 rounded-2xl border border-cream-300 bg-white/80 p-5">
      <span aria-hidden className="mt-1 text-2xl text-gold-600">&#8681;</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Free template download</p>
        <a href={href} download className="mt-1 block text-lg font-extrabold text-ink-900 underline decoration-gold-500 underline-offset-4">{title}</a>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">{children}</p>
      </div>
    </div>
  );
}

/** An affiliate partner card with a clear button. The link is marked sponsored. */
export function PartnerCard({ href, name, children }: { href: string; name: string; children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 flex flex-col gap-4 rounded-2xl border border-gold-300 bg-gold-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gold-700">Tool option (affiliate link)</p>
        <p className="mt-1 text-lg font-extrabold text-ink-900">{name}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-600">{children}</p>
      </div>
      <a href={href} target="_blank" rel="sponsored noopener noreferrer" className="btn-primary shrink-0 text-center">
        Explore {name}
      </a>
    </div>
  );
}
