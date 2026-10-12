import Link from "next/link";
import { getSettings } from "@/lib/settings";

// Optional one-line notice above the header. Switch it on and edit the text in Admin > Homepage.
export default function AnnouncementBar() {
  const a = getSettings().announcement;
  if (!a.enabled || !a.text) return null;
  const inner = <span className="font-medium">{a.text}{a.link ? " →" : ""}</span>;
  return (
    <div className="bg-gold-300 px-4 py-2 text-center text-sm text-ink-900">
      {a.link ? (
        a.link.startsWith("/") ? (
          <Link href={a.link} className="hover:underline">{inner}</Link>
        ) : (
          <a href={a.link} target="_blank" rel="noopener noreferrer" className="hover:underline">{inner}</a>
        )
      ) : (
        inner
      )}
    </div>
  );
}
