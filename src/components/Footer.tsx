import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/site";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="mt-28 bg-cream-200/60">
      <div className="gold-rule" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
            {SITE.tagline} {SITE.description}
          </p>
          <Link href="/#newsletter" className="btn-ghost mt-6">Get the weekly brief</Link>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Topics</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <a className="hover:text-gold-700" href={`/blog?category=${encodeURIComponent(c.name)}`}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li><Link className="hover:text-gold-700" href="/about">About</Link></li>
            <li><Link className="hover:text-gold-700" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-gold-700" href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link className="hover:text-gold-700" href="/terms-of-service">Terms of Service</Link></li>
            <li><Link className="hover:text-gold-700" href="/unsubscribe">Unsubscribe</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-300 py-6 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
