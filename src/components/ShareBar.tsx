"use client";

import { useState } from "react";

export default function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const link = "rounded-full border border-cream-400 bg-white/70 px-4 py-1.5 text-sm font-medium text-ink-700 transition hover:border-gold-500 hover:text-ink-900";
  return (
    <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-cream-300 pt-6" aria-label="Share this article">
      <span className="mr-1 text-sm font-semibold text-ink-900">Share</span>
      <a className={link} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}>LinkedIn</a>
      <a className={link} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`}>X</a>
      <a className={link} href={`mailto:?subject=${t}&body=${u}`}>Email</a>
      <button
        type="button"
        className={link}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard unavailable */
          }
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
