import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/site";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="mt-28 bg-night-950 text-slate-400">
      <div className="gold-rule" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo onDark />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {SITE.tagline} {SITE.description}
          </p>
          <Link
            href="/#newsletter"
            className="mt-6 inline-flex items-center rounded-lg border border-gold-400/50 px-5 py-2.5 text-sm font-semibold text-gold-300 transition hover:bg-gold-300/10"
          >
            Get the weekly brief
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://x.com/OpsGrit"
              target="_blank"
              rel="noopener noreferrer me"
              aria-label="OpsGrit on X"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-night-700 text-slate-300 transition hover:border-gold-400/60 hover:text-gold-300"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Topics</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <a className="hover:text-gold-300" href={`/topics/${c.slug}`}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Company</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-gold-300" href="/tools">Free tools</Link></li>
            <li><Link className="hover:text-gold-300" href="/glossary">Glossary</Link></li>
            <li><Link className="hover:text-gold-300" href="/about">About</Link></li>
            <li><Link className="hover:text-gold-300" href="/editorial-policy">Editorial policy</Link></li>
            <li><Link className="hover:text-gold-300" href="/advertise">Advertise</Link></li>
            <li><Link className="hover:text-gold-300" href="/affiliate-disclosure">Affiliate disclosure</Link></li>
            <li><Link className="hover:text-gold-300" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-gold-300" href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link className="hover:text-gold-300" href="/terms-of-service">Terms of Service</Link></li>
            <li><Link className="hover:text-gold-300" href="/unsubscribe">Unsubscribe</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-night-700 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
