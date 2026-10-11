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
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
      <span
        aria-hidden
        className="grid h-7 w-7 place-items-center rounded-md bg-accent text-sm font-black text-ink-950"
      >
        O
      </span>
      {SITE.name}
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {NAV.map((n) =>
            n.href.includes("?") ? (
              <a key={n.href} href={n.href} className="text-sm text-slate-400 transition hover:text-white">
                {n.label}
              </a>
            ) : (
              <Link key={n.href} href={n.href} className="text-sm text-slate-400 transition hover:text-white">
                {n.label}
              </Link>
            ),
          )}
        </nav>
        <Link href="/#newsletter" className="btn-primary hidden sm:inline-flex">
          Subscribe
        </Link>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-ink-600 px-3 py-1.5 text-sm text-slate-200">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-ink-700 bg-ink-900 p-2 shadow-xl">
            {NAV.map((n) =>
              n.href.includes("?") ? (
                <a
                  key={n.href}
                  href={n.href}
                  className="block rounded px-3 py-2 text-sm text-slate-300 hover:bg-ink-800 hover:text-white"
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block rounded px-3 py-2 text-sm text-slate-300 hover:bg-ink-800 hover:text-white"
                >
                  {n.label}
                </Link>
              ),
            )}
            <Link href="/#newsletter" className="block rounded px-3 py-2 text-sm font-semibold text-accent-soft">
              Subscribe
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
