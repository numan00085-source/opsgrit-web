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
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Topics</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <a className="hover:text-gold-300" href={`/blog?category=${encodeURIComponent(c.name)}`}>
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
