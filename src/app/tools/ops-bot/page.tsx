import type { Metadata } from "next";
import Link from "next/link";
import OpsBot from "./OpsBot";
import Starfield from "@/components/Starfield";

export const metadata: Metadata = {
  title: "OpsGrit Bot: free assistant for operations and automation",
  description:
    "Ask OpsGrit Bot about automation, SOPs, tool choices and AI at work. A free assistant that answers from OpsGrit guides and points you to the right one.",
  alternates: { canonical: "/tools/ops-bot" },
};

export default function Page() {
  return (
    // Night-sky stage. The negative bottom margin closes the gap above the footer so the dark area is seamless.
    <div
      className="relative isolate -mb-28 overflow-hidden bg-night-950 pb-40"
      style={{
        backgroundImage:
          "radial-gradient(60% 45% at 80% 0%, rgba(212,175,79,0.14), transparent 70%), radial-gradient(55% 50% at 8% 30%, rgba(88,101,242,0.16), transparent 70%), radial-gradient(70% 60% at 50% 110%, rgba(40,52,110,0.35), transparent 70%)",
      }}
    >
      <Starfield className="absolute inset-0 -z-10 h-full w-full" />
      <div className="container-page relative py-14">
        <nav className="mb-6 text-sm text-slate-400">
          <Link href="/tools" className="hover:text-gold-300">Tools</Link> / OpsGrit Bot
        </nav>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Meet <span className="gold-text-light">OpsGrit Bot</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-300">
          Your free sidekick for operations. Ask a question, get a clear answer and the right OpsGrit guide to go deeper.
        </p>
        <div className="mx-auto max-w-3xl">
          <OpsBot />
        </div>
      </div>
    </div>
  );
}
