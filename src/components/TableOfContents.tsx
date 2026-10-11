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
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">On this page</p>
      <ul className="space-y-2 border-l border-ink-700">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-7" : "pl-4"}>
            <a
              href={`#${h.id}`}
              className={`block leading-snug transition ${
                active === h.id ? "text-accent-soft" : "text-slate-400 hover:text-white"
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
