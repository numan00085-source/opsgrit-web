/**
 * OpsGrit's own icon set. Every symbol on the site that would otherwise be an emoji is drawn here as SVG,
 * so it looks identical on every phone, browser and operating system (no Android / Apple emoji).
 * Gradients use fixed ids: identical definitions repeated in the page are harmless.
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number | string };

function Base({ size = "1em", children, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false" {...rest}>
      <defs>
        <linearGradient id="og-gold" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbeeb8" /><stop offset=".5" stopColor="#d9b04a" /><stop offset="1" stopColor="#a67c1c" />
        </linearGradient>
        <linearGradient id="og-steel" x1="8" y1="3" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset=".55" stopColor="#d8def0" /><stop offset="1" stopColor="#8e98c4" />
        </linearGradient>
        <linearGradient id="og-flame" x1="16" y1="22" x2="16" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff3b0" /><stop offset=".5" stopColor="#ffb23f" /><stop offset="1" stopColor="#ff5a36" stopOpacity=".1" />
        </linearGradient>
        <linearGradient id="og-green" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7cf2c0" /><stop offset="1" stopColor="#10a374" />
        </linearGradient>
        <linearGradient id="og-amber" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe08a" /><stop offset="1" stopColor="#e08a0b" />
        </linearGradient>
        <linearGradient id="og-red" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff9a8a" /><stop offset="1" stopColor="#d3262f" />
        </linearGradient>
        <linearGradient id="og-indigo" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b4b9ff" /><stop offset="1" stopColor="#5a63e0" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

export function IconRocket(p: P) {
  return (
    <Base {...p}>
      <path d="M16 23c.6 3 1.2 5 2.4 7.5-1.5.4-3.3.4-4.8 0C14.8 28 15.4 26 16 23z" fill="url(#og-flame)" />
      <path d="M10.2 15.2 6 20.5l1.7 3.6 4.1-1.9z" fill="url(#og-gold)" />
      <path d="M21.8 15.2 26 20.5l-1.7 3.6-4.1-1.9z" fill="url(#og-gold)" />
      <path d="M16 2.2c4.4 3.1 6.4 8 6.4 13.2 0 2.6-.5 4.8-1.3 6.8h-10c-.8-2-1.3-4.2-1.3-6.8 0-5.2 2-10.1 6.2-13.2z" fill="url(#og-steel)" stroke="#6f7aa8" strokeWidth=".6" />
      <path d="M16 2.2c-1.6 1.3-2.9 3-3.8 4.9 2.4-.9 5.2-.9 7.6 0C18.9 5.2 17.6 3.5 16 2.2z" fill="url(#og-gold)" />
      <circle cx="16" cy="12.6" r="2.9" fill="#0b1220" stroke="url(#og-gold)" strokeWidth="1.4" />
      <circle cx="15.1" cy="11.7" r=".9" fill="#9fb2ff" />
      <path d="M11.6 22.2h8.8" stroke="url(#og-gold)" strokeWidth="1.2" strokeLinecap="round" />
    </Base>
  );
}

export function IconPlanet(p: P) {
  return (
    <Base {...p}>
      <path d="M5.5 22c-2.6-1.3-3.4-3-2.4-4.9 1.5-2.9 7.3-4.5 14.2-4" stroke="url(#og-gold)" strokeWidth="1.6" strokeLinecap="round" opacity=".9" />
      <circle cx="16" cy="16" r="8.2" fill="url(#og-indigo)" />
      <path d="M9.4 12.4c3.2-1.8 8.6-1.4 13.2 1.2M8.2 17.8c4 1.2 9.8.8 15.4-1.8" stroke="#ffffff" strokeOpacity=".28" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="12.6" cy="11.8" rx="3.2" ry="2" fill="#fff" opacity=".28" transform="rotate(-28 12.6 11.8)" />
      <path d="M26.5 10.2c2.7 1.3 3.5 3 2.5 4.9-1.7 3.2-8.6 4.9-16 4.2" stroke="url(#og-gold)" strokeWidth="1.8" strokeLinecap="round" />
    </Base>
  );
}

export function IconPuzzle(p: P) {
  return (
    <Base {...p}>
      <path d="M6 7h6.2a3.3 3.3 0 1 1 6.6 0H25v6.2a3.3 3.3 0 1 1 0 6.6V26h-6.2a3.3 3.3 0 1 0-6.6 0H6V7z" fill="url(#og-gold)" stroke="#8a6410" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M8 9h4.6M8 9v4.6" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
    </Base>
  );
}

export function IconCheck(p: P) {
  return (
    <Base {...p}>
      <circle cx="16" cy="16" r="12.5" fill="url(#og-green)" />
      <circle cx="16" cy="16" r="12.5" stroke="#fff" strokeOpacity=".35" />
      <path d="M9.6 16.6 14 21l8.6-9.6" stroke="#06382a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Base>
  );
}

export function IconWarn(p: P) {
  return (
    <Base {...p}>
      <path d="M16 3.6c.6 0 1.2.3 1.5.9l11 19.2c.7 1.2-.2 2.7-1.5 2.7H5c-1.3 0-2.2-1.5-1.5-2.7L14.5 4.5c.3-.6.9-.9 1.5-.9z" fill="url(#og-amber)" />
      <path d="M16 11v7" stroke="#4a2a00" strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="16" cy="22" r="1.7" fill="#4a2a00" />
    </Base>
  );
}

export function IconCross(p: P) {
  return (
    <Base {...p}>
      <circle cx="16" cy="16" r="12.5" fill="url(#og-red)" />
      <circle cx="16" cy="16" r="12.5" stroke="#fff" strokeOpacity=".35" />
      <path d="M11 11l10 10M21 11 11 21" stroke="#4d0710" strokeWidth="3" strokeLinecap="round" />
    </Base>
  );
}

export function IconGear(p: P) {
  return (
    <Base {...p}>
      <circle cx="16" cy="16" r="10.2" stroke="url(#og-gold)" strokeWidth="5" strokeDasharray="3.2 3.2" />
      <circle cx="16" cy="16" r="8" stroke="url(#og-gold)" strokeWidth="1.6" />
      <circle cx="16" cy="16" r="3" fill="url(#og-gold)" />
    </Base>
  );
}

/** A jewel-like tile for round results (replaces the green / yellow / red square emoji). */
export function Pip({ p, size = 22 }: { p: number; size?: number }) {
  const fill = p === 3 ? "url(#og-green)" : p === 1 ? "url(#og-amber)" : "url(#og-red)";
  return (
    <Base size={size} className="inline-block align-middle" role="img" aria-label={p === 3 ? "Best practice" : p === 1 ? "Risky" : "Dangerous"}>
      <rect x="3" y="3" width="26" height="26" rx="7" fill={fill} />
      <rect x="3.5" y="3.5" width="25" height="25" rx="6.5" stroke="#fff" strokeOpacity=".4" />
      <path d="M8 10c2-2.6 6-3.4 10-3" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
    </Base>
  );
}
