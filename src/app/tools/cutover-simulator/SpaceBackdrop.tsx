"use client";

import Starfield from "@/components/Starfield";
import { IconGear, IconPuzzle } from "@/components/icons/OpsIcons";

type Item = { k: "piece" | "gear"; x: string; y: string; s: number; r: string; t: string; d: string; dx: string; dy: string };

const ITEMS: Item[] = [
  { k: "piece", x: "3%", y: "9%", s: 70, r: "-12deg", t: "15s", d: "0s", dx: "14px", dy: "-24px" },
  { k: "piece", x: "90%", y: "5%", s: 52, r: "20deg", t: "18s", d: "-4s", dx: "-16px", dy: "20px" },
  { k: "gear", x: "93%", y: "34%", s: 96, r: "0deg", t: "60s", d: "0s", dx: "0px", dy: "0px" },
  { k: "piece", x: "5%", y: "48%", s: 60, r: "35deg", t: "17s", d: "-8s", dx: "12px", dy: "22px" },
  { k: "gear", x: "-3%", y: "70%", s: 120, r: "0deg", t: "75s", d: "0s", dx: "0px", dy: "0px" },
  { k: "piece", x: "86%", y: "66%", s: 64, r: "-30deg", t: "16s", d: "-2s", dx: "-12px", dy: "-18px" },
  { k: "piece", x: "46%", y: "93%", s: 48, r: "10deg", t: "19s", d: "-6s", dx: "10px", dy: "-16px" },
];

/** Full-page night sky: stars, two slow nebulas, and drifting puzzle pieces and gears. Sits behind all content. */
export default function SpaceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="cs-nebula absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(124,131,245,.34),transparent_62%)]" />
      <div className="cs-nebula absolute -right-40 top-[38%] h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(212,175,79,.22),transparent_62%)]" style={{ animationDelay: "-7s" }} />
      <div className="cs-nebula absolute -bottom-52 left-[18%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(88,101,242,.24),transparent_62%)]" style={{ animationDelay: "-12s" }} />
      <Starfield className="absolute inset-0 h-full w-full" />
      {ITEMS.map((d, i) => (
        <div
          key={i}
          className={d.k === "gear" ? "cs-spin absolute" : "cs-float absolute"}
          style={{ left: d.x, top: d.y, width: d.s, height: d.s, opacity: d.k === "gear" ? 0.16 : 0.22, ["--r" as string]: d.r, ["--t" as string]: d.k === "gear" ? d.t : d.t, ["--d0" as string]: d.d, ["--dx" as string]: d.dx, ["--dy" as string]: d.dy }}
        >
          {d.k === "piece" ? <IconPuzzle size="100%" /> : <IconGear size="100%" />}
        </div>
      ))}
    </div>
  );
}
