"use client";

import { useState } from "react";

export default function UnsubscribeForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setMsg({ ok: true, text: data.message || "Done." });
      setEmail("");
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="not-prose mt-8 max-w-md space-y-3">
      <label htmlFor="un-email" className="text-sm font-semibold text-ink-800">Email address</label>
      <input
        id="un-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink-900 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-300"
      />
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? "Working…" : "Unsubscribe"}
      </button>
      {msg && (
        <p role="status" className={`text-sm font-medium ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>
          {msg.text}
        </p>
      )}
    </form>
  );
}
