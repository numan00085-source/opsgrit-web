import Link from "next/link";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/blog", label: "Articles" },
  { href: "/topics/ai-automation", label: "AI Automation" },
  { href: "/topics/ops-stack", label: "Ops Stack" },
  { href: "/topics/process-sops", label: "Process SOPs" },
  { href: "/tools", label: "Free tools" },
  { href: "/about", label: "About" },
];

export function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-[9px] shadow-[0_2px_10px_-2px_rgba(212,175,79,0.5)]" />
      <span className={`${onDark ? "gold-text-light" : "gold-text"} text-xl font-extrabold tracking-tight`}>{SITE.name}</span>
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night-950/80 shadow-[0_8px_30px_-12px_rgba(11,15,23,0.6)] backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo onDark />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-medium text-slate-300 transition hover:text-gold-300">
              {n.label}
            </a>
          ))}
        </nav>
        <Link href="/#newsletter" className="btn-primary hidden sm:inline-flex">
          Subscribe
        </Link>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md border border-night-600 bg-night-800 px-3 py-1.5 text-sm font-medium text-slate-200">
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-night-700 bg-night-900 p-2 shadow-xl">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-night-800 hover:text-white"
              >
                {n.label}
              </a>
            ))}
            <Link href="/#newsletter" className="block rounded-lg px-3 py-2 text-sm font-semibold text-gold-300">
              Subscribe
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
