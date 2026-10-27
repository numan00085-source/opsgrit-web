import { useEffect } from "react";

/**
 * Like useEffect, but starts after the page has loaded and the browser is idle.
 * Used for decorative canvas animation so it never competes with first paint or early taps.
 */
export function useIdleEffect(fn: () => void | (() => void), deps: React.DependencyList) {
  useEffect(() => {
    let cleanup: void | (() => void);
    let cancelled = false;
    let t: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      if (!cancelled) cleanup = fn();
    };
    const go = () => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
      if (ric) ric(run, { timeout: 2500 });
      else setTimeout(run, 1200);
    };
    const onLoad = () => {
      t = setTimeout(go, 800);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", onLoad);
      if (t) clearTimeout(t);
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
