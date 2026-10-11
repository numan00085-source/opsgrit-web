"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack === "1" || nav.globalPrivacyControl === true;
}

function send(body: Record<string, unknown>) {
  try {
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// Privacy-friendly view counter: no cookies, nothing stored on the device,
// and visitors who send Do Not Track or Global Privacy Control are not counted.
export default function PageViewTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (optedOut()) return;
    let ref = "";
    if (first.current) {
      first.current = false;
      try {
        const u = new URL(document.referrer);
        if (u.hostname && u.hostname !== window.location.hostname) ref = u.hostname.replace(/^www\./, "");
      } catch {
        /* no referrer */
      }
    }
    send({ path: pathname, ref });
  }, [pathname]);

  useEffect(() => {
    if (optedOut()) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") send({ ping: true });
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
