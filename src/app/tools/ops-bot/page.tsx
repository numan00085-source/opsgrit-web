import type { Metadata } from "next";
import Link from "next/link";
import OpsBot from "./OpsBot";

export const metadata: Metadata = {
  title: "OpsGrit Bot: free assistant for operations and automation",
  description:
    "Ask OpsGrit Bot about automation, SOPs, tool choices and AI at work. A free assistant that answers from OpsGrit guides and points you to the right one.",
  alternates: { canonical: "/tools/ops-bot" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / OpsGrit Bot</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">
        Meet <span className="gold-text">OpsGrit Bot</span>
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        Your free sidekick for operations. Ask a question, get a clear answer and the right OpsGrit guide to go deeper.
      </p>
      <div className="mx-auto max-w-3xl">
        <OpsBot />
      </div>
    </div>
  );
}
