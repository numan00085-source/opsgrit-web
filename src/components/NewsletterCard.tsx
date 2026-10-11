import { SITE } from "@/lib/site";

export default function NewsletterCard() {
  const action = SITE.newsletterAction;
  return (
    <section
      id="newsletter"
      className="relative overflow-hidden rounded-2xl border border-ink-600 bg-gradient-to-br from-ink-800 to-ink-900 p-8 sm:p-12"
    >
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative max-w-xl">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">The OpsGrit Brief</h2>
        <p className="mt-3 text-slate-400">
          One practical operations insight each week: AI workflows, automation teardowns and SOPs. No spam, unsubscribe
          anytime.
        </p>
        {action ? (
          <form action={action} method="post" className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="nl-email" className="sr-only">Work email</label>
            <input
              id="nl-email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="w-full rounded-lg border border-ink-600 bg-ink-950 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-slate-400">
            Subscriptions open soon. Meanwhile, write to{" "}
            <a className="text-accent-soft underline" href={`mailto:${SITE.email}?subject=Subscribe`}>
              {SITE.email}
            </a>{" "}
            to join the list.
          </p>
        )}
      </div>
    </section>
  );
}
