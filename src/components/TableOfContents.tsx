"use client";

import { useEffect, useState } from "react";

export default function TableOfContents({ headings }: { headings: { id: string; text: string; level: 2 | 3 }[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-2xl border border-night-700 bg-night-900 p-5 text-sm shadow-[0_18px_40px_-24px_rgba(11,15,23,0.8)]">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-300">On this page</p>
      <ul className="space-y-2 border-l border-night-600">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-7" : "pl-4"}>
            <a
              href={`#${h.id}`}
              className={`block leading-snug transition ${
                active === h.id ? "font-semibold text-gold-300" : "text-slate-400 hover:text-white"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
