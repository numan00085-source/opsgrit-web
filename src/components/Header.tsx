import Link from "next/link";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/blog", label: "Articles" },
  { href: "/blog?category=AI%20Automation", label: "AI Automation" },
  { href: "/blog?category=Ops%20Stack", label: "Ops Stack" },
  { href: "/blog?category=Process%20SOPs", label: "Process SOPs" },
  { href: "/about", label: "About" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="gold-tile grid h-8 w-8 place-items-center rounded-lg text-base font-extrabold text-ink-900"
      >
        O
      </span>
      <span className="gold-text text-xl font-extrabold tracking-tight">{SITE.name}</span>
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-ink-600 transition hover:text-ink-900">
              {n.label}
            </a>
          ))}
        </nav>
        <Link href="/#newsletter" className="btn-primary hidden sm:inline-flex">
          Subscribe
        </Link>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-ink-900/20 bg-white/60 px-3 py-1.5 text-sm font-medium text-ink-800">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-cream-300 bg-cream-50 p-2 shadow-xl">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-cream-200 hover:text-ink-900"
              >
                {n.label}
              </a>
            ))}
            <Link href="/#newsletter" className="block rounded-lg px-3 py-2 text-sm font-semibold text-gold-700">
              Subscribe
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
