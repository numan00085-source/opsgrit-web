import type { Metadata } from "next";
import Link from "next/link";
import OutOfOfficeGenerator from "./OutOfOfficeGenerator";

export const metadata: Metadata = {
  title: "Free out-of-office email generator",
  description:
    "Free out-of-office message generator. Pick a tone, add your dates and who covers for you, and copy a ready subject line and auto-reply for clients and colleagues.",
  alternates: { canonical: "/tools/out-of-office-generator" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Out-of-office generator</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Free out-of-office email generator</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        Answer a few questions and get an auto-reply with a subject line, one version for clients and one for colleagues.
        Copy it into Gmail, Outlook or any mail tool. Nothing you type leaves your browser.
      </p>
      <OutOfOfficeGenerator />

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-ink-900">What a good out-of-office message says</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-700">
          <li><strong>That you are away, and when you are back.</strong> People can then decide whether to wait.</li>
          <li><strong>Who to contact instead.</strong> Name one person for urgent matters, with a way to reach them. A message with no alternative leaves people stuck.</li>
          <li><strong>What to expect.</strong> Say whether you will check email, and when you will reply after you return.</li>
          <li><strong>Nothing more than needed.</strong> You do not have to say where you are or why. Details such as travel plans are best kept out of messages that reach people outside your company.</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-ink-900">Before you go</h2>
        <p className="mt-3 text-ink-700">
          An auto-reply only works if someone is actually covering. Agree the handover first: who picks up urgent work, which
          decisions they can make, and where the open items are written down. A written{" "}
          <Link className="underline underline-offset-2" href="/tools/raci-generator">RACI matrix</Link>{" "}
          makes it clear who is responsible while you are away, and our guide to the{" "}
          <Link className="underline underline-offset-2" href="/blog/raci-matrix-operations-teams-template">RACI matrix for operations teams</Link>{" "}
          explains how to set one up. If you are leaving the company rather than going on leave, use the{" "}
          <Link className="underline underline-offset-2" href="/blog/employee-offboarding-sop-deprovisioning-assets-audit">offboarding SOP</Link>{" "}
          instead.
        </p>
      </section>
    </div>
  );
}
