import type { Metadata } from "next";
import Link from "next/link";
import { TERMS } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Operations and automation glossary",
  description:
    "Plain-language definitions of the terms operations teams run into: SOP, system of record, webhook, iPaaS, idempotency, human-in-the-loop, RPA and more.",
  alternates: { canonical: "/glossary" },
};

export default function GlossaryPage() {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "OpsGrit operations and automation glossary",
    hasDefinedTerm: sorted.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.def })),
  };
  return (
    <div className="container-page py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Glossary</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink-900">Operations and automation terms, in plain language</h1>
        <p className="mt-4 text-lg text-ink-600">Short definitions of terms used across OpsGrit, with links to the articles that go deeper.</p>
        <dl className="mt-10 divide-y divide-cream-300">
          {sorted.map((t) => (
            <div key={t.term} className="py-5" id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <dt className="text-lg font-bold text-ink-900">{t.term}</dt>
              <dd className="mt-1 leading-relaxed text-ink-600">
                {t.def}
                {t.read && (
                  <>
                    {" "}
                    <Link href={t.read.href} className="font-semibold text-gold-700 underline underline-offset-2">{t.read.label} →</Link>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
