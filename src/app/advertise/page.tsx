import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise with OpsGrit",
  description:
    "Sponsor OpsGrit to reach operations leaders, revops and automation teams. Formats, editorial standards and how to get started.",
  alternates: { canonical: "/advertise" },
};

const AUDIENCE = [
  "Operations and COO-office leaders",
  "RevOps, sales ops and finance ops teams",
  "Automation and integration engineers",
  "Founders and heads of ops at growing companies",
];

const FORMATS = [
  {
    title: "Sponsored article",
    body: "A clearly labeled, in-depth article about a problem your product solves, written with our editors so it reads like everything else we publish. Evergreen and search-friendly.",
  },
  {
    title: "Display placement",
    body: "A banner next to articles in the topics your buyers read. Clearly marked as advertising and separate from editorial content.",
  },
  {
    title: "Newsletter mention",
    body: "A short sponsor slot in the OpsGrit Brief, our weekly email to operators who asked to hear from us.",
  },
];

const STEPS = [
  { title: "Tell us about your product", body: "Who you serve and what you want readers to do. A short email is enough." },
  { title: "We propose a format", body: "We recommend what fits your goal and share current first-party traffic figures and pricing." },
  { title: "We publish and report", body: "Your campaign goes live with clear labeling, and we send a results summary afterwards." },
];

const mail = `mailto:${SITE.email}?subject=${encodeURIComponent("Sponsorship enquiry")}&body=${encodeURIComponent(
  "Company:\nWebsite:\nWhat you would like to promote:\nPreferred timing:\n",
)}`;

export default function AdvertisePage() {
  return (
    <>
      <section className="container-page py-20 text-center">
        <span className="chip">Advertise</span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-6xl">
          Reach the people who <span className="gold-text">run operations</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
          {SITE.name} is a B2B publication on AI workflows, enterprise automation and operations. Our readers are
          evaluating tools, building processes and deciding where to spend.
        </p>
        <a href={mail} className="btn-primary mt-9 !px-7 !py-3">Start a conversation</a>
      </section>

      <section className="container-page pb-16" aria-labelledby="aud">
        <div className="card p-8 sm:p-10">
          <h2 id="aud" className="text-2xl font-extrabold tracking-tight text-ink-900">Who we write for</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {AUDIENCE.map((a) => (
              <li key={a} className="flex items-start gap-3 text-ink-700">
                <span aria-hidden className="gold-fill mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-500">
            OpsGrit is a new publication. We do not publish inflated audience claims. We share real first-party analytics
            (no purchased traffic) with prospective sponsors on request, so you decide with real numbers.
          </p>
        </div>
      </section>

      <section className="container-page pb-16" aria-labelledby="formats">
        <h2 id="formats" className="text-3xl font-extrabold tracking-tight text-ink-900">Ways to partner</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {FORMATS.map((f) => (
            <div key={f.title} className="card p-7">
              <h3 className="text-lg font-bold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16" aria-labelledby="fit">
        <h2 id="fit" className="text-3xl font-extrabold tracking-tight text-ink-900">Who we work with</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card p-7">
            <h3 className="text-lg font-bold text-ink-900">A good fit</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-600">
              <li>Software and services for operations, automation, finance ops, RevOps and process management.</li>
              <li>Products with clear public pricing or documentation we can cite.</li>
              <li>Sponsors who are comfortable being labeled and who accept our editorial independence.</li>
            </ul>
          </div>
          <div className="card p-7">
            <h3 className="text-lg font-bold text-ink-900">We decline</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-600">
              <li>Gambling, adult content, get-rich-quick offers and unregulated financial products.</li>
              <li>Misleading claims, fake urgency or guaranteed-results promises.</li>
              <li>Anything that asks us to hide the sponsorship or to edit independent articles.</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-sm text-ink-500">
          Terms, pricing and dates are agreed in writing before anything goes live. See how we earn money in our{" "}
          <Link className="font-semibold text-gold-700 underline underline-offset-4" href="/affiliate-disclosure">affiliate and sponsorship disclosure</Link>{" "}
          and how we publish in our{" "}
          <Link className="font-semibold text-gold-700 underline underline-offset-4" href="/editorial-policy">editorial policy</Link>.
        </p>
      </section>

      <section className="bg-night-950 py-20" aria-labelledby="standards">
        <div className="container-page">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300">Our promise to readers and sponsors</p>
          <h2 id="standards" className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-white">
            Trust is the product. We protect it.
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Every paid placement is labeled Sponsored or Advertisement.",
              "Sponsored links carry rel=\"sponsored\", so search engines understand the relationship.",
              "Sponsorship never buys editorial coverage, favorable reviews or changes to our independent articles.",
              "We decline products we cannot stand behind, which is why readers trust the ones we accept.",
            ].map((t) => (
              <li key={t} className="rounded-2xl border border-night-700 bg-night-800 p-6 text-sm leading-relaxed text-slate-300">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="how">
        <h2 id="how" className="text-3xl font-extrabold tracking-tight text-ink-900">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card p-7">
              <span className="gold-tile grid h-9 w-9 place-items-center rounded-lg text-sm font-extrabold text-ink-900">{i + 1}</span>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="card mt-12 flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-extrabold text-ink-900">Ready to talk?</h3>
            <p className="mt-1 text-sm text-ink-600">
              Email <a className="font-semibold text-gold-700 underline underline-offset-4" href={mail}>{SITE.email}</a>. We reply within 3 business days.
            </p>
          </div>
          <a href={mail} className="btn-primary !px-7 !py-3">Email us</a>
        </div>
      </section>
    </>
  );
}
