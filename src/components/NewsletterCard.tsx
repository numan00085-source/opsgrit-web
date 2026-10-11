"use client";

import { useState } from "react";

type State = "idle" | "loading" | "done" | "error";

export default function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    const form = new FormData(e.currentTarget);
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: form.get("website") || "", from: window.location.pathname }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
      setMessage(data.message || "You're subscribed.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <section
      id="newsletter"
      aria-labelledby="newsletter-title"
      className="relative overflow-hidden rounded-3xl border border-gold-400/50 bg-gradient-to-br from-cream-50 via-white to-gold-100/70 p-8 shadow-[0_20px_50px_-28px_rgba(156,118,24,0.55)] sm:p-12"
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-300/25 blur-3xl" />
      <div className="relative grid gap-8 md:grid-cols-[1.1fr_1fr] md:items-center">
        <div>
          <span className="chip">Free · Weekly · One email</span>
          <h2 id="newsletter-title" className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            The <span className="gold-text">OpsGrit</span> Brief
          </h2>
          <p className="mt-3 leading-relaxed text-ink-600">
            One practical operations insight each week: an AI workflow that works, an automation teardown or a ready-to-use
            SOP. No spam, no selling your address, unsubscribe in one click.
          </p>
        </div>

        <div>
          {state === "done" ? (
            <div role="status" className="rounded-2xl border border-gold-400/60 bg-white p-6">
              <p className="text-lg font-bold text-ink-900">You&apos;re in. ✓</p>
              <p className="mt-1 text-sm text-ink-600">{message}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-3">
              <label htmlFor="nl-email" className="text-sm font-semibold text-ink-800">Work email</label>
              <input
                id="nl-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-500/70 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-300"
              />
              {/* Honeypot: real people never see or fill this. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <button type="submit" disabled={state === "loading"} className="btn-primary w-full !py-3">
                {state === "loading" ? "Subscribing…" : "Subscribe for free"}
              </button>
              {state === "error" && (
                <p role="alert" className="text-sm font-medium text-red-700">
                  {message}
                </p>
              )}
              <p className="text-xs text-ink-500">
                By subscribing you agree to our <a className="underline decoration-gold-500 underline-offset-2" href="/privacy-policy">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
