import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/site";
import { Logo } from "./Header";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-700 bg-ink-950">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{SITE.tagline} {SITE.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Topics</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <a className="hover:text-white" href={`/blog?category=${encodeURIComponent(c.name)}`}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
            <li><Link className="hover:text-white" href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link className="hover:text-white" href="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-700 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
