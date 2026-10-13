"use client";

import { useEffect, useState } from "react";

type Img = { src: string; alt: string; w: number; h: number };

// Shows one picture, or gently fades between several every 7 seconds. It pauses while the pointer is over the ad,
// and with "reduce motion" it stays on the first picture. The box keeps the first picture's shape so the page never jumps.
export default function AdImages({ images, fit }: { images: Img[]; fit: "contain" | "natural" }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const many = images.length > 1;

  useEffect(() => {
    if (!many || hold) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % images.length), 7000);
    return () => clearInterval(id);
  }, [many, hold, images.length]);

  const first = images[0];
  const ratio = first.w && first.h ? `${first.w} / ${first.h}` : undefined;

  if (!many) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={first.src}
        alt={first.alt}
        loading="lazy"
        decoding="async"
        width={first.w || undefined}
        height={first.h || undefined}
        className={`block h-auto w-full ${fit === "contain" ? "max-h-[280px] object-contain" : ""}`}
      />
    );
  }
  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: ratio ?? "970 / 250" }}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
    >
      {images.map((im, n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={im.src}
          src={im.src}
          alt={n === i ? im.alt : ""}
          aria-hidden={n === i ? undefined : true}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700"
          style={{ opacity: n === i ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
