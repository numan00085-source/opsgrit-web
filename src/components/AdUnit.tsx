"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Renders one Google AdSense unit. Renders nothing until AdSense is configured, so there are no empty gaps before approval.
export default function AdUnit({ slot, className = "" }: { slot?: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);

  useEffect(() => {
    if (!client || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers or script failures must never break the page */
    }
  }, [client, slot]);

  if (!client || !slot) return null;
  return (
    <aside aria-label="Advertisement" className={`my-10 ${className}`}>
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Advertisement</p>
      <ins
        className="adsbygoogle block min-h-[100px] overflow-hidden rounded-xl bg-cream-200/60"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
