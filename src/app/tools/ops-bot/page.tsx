import type { Metadata } from "next";
import Link from "next/link";
import OpsBot from "./OpsBot";

export const metadata: Metadata = {
  title: "OpsGrit Bot: free AI assistant for operations and automation",
  description:
    "Ask OpsGrit Bot about automation, SOPs, tool choices and AI at work. A free AI assistant that points you to the right OpsGrit guide.",
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
        Your free AI sidekick for operations. Ask a question, get a clear next step and the right OpsGrit guide to go deeper.
      </p>
      <div className="mx-auto max-w-3xl">
        <OpsBot />
        <div className="prose mt-10 max-w-none">
          <h2>Good to know</h2>
          <ul>
            <li>OpsGrit Bot is an <strong>AI assistant</strong>, not a person. It can be wrong, so verify anything important, especially prices and legal or tax points.</li>
            <li>Your messages are sent to an AI service to write the reply. OpsGrit does not save your chats. Please do not paste passwords, customer data or other confidential information.</li>
            <li>There are daily limits so the tool stays free for everyone.</li>
            <li>It recommends OpsGrit articles first. OpsGrit may earn from ads, sponsors or affiliate links, as explained in our <Link href="/affiliate-disclosure">disclosure</Link>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
