import type { Metadata } from "next";
import Link from "next/link";
import StackAudit from "./StackAudit";
import ToolNext from "@/components/ToolNext";

export const metadata: Metadata = {
  title: "Tech stack audit worksheet",
  description:
    "Free worksheet to inventory your operations tools: owner, cost, users, overlap and decision. See total cost and cost per user, and export to CSV.",
  alternates: { canonical: "/tools/stack-audit" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Tech stack audit worksheet</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Tech stack audit worksheet</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        One row per tool. Fill in what you know, mark what to do with it and see what the stack costs. The method is
        explained in{" "}
        <Link className="underline underline-offset-2" href="/blog/operations-tech-stack-audit">how to audit your operations tech stack</Link>.
      </p>
      <StackAudit />

      <div className="prose mt-12 max-w-3xl">
        <h2>How to use this worksheet</h2>
        <ol>
          <li><strong>List every tool that costs money or holds company data.</strong> Check your card statements and your single sign-on or admin console so you catch the ones nobody mentions.</li>
          <li><strong>Fill in the owner first.</strong> A tool with no named owner is the first to be forgotten and the last to be cancelled.</li>
          <li><strong>Add cost, seats paid and active users.</strong> Active users come from the vendor&apos;s admin page, usually the last 30 or 90 days of sign-ins.</li>
          <li><strong>Mark a decision.</strong> Keep, Review, Merge or Retire. Use the &ldquo;Look here first&rdquo; and overlap boxes to choose where to start.</li>
          <li><strong>Copy the summary</strong> or download the CSV and share it with finance and the tool owners.</li>
        </ol>
        <p>
          Do not cancel anything on the strength of this page alone. Check contract dates, notice periods and what data would need to move first.
          The full method, including how to run the review with your team, is in{" "}
          <Link href="/blog/operations-tech-stack-audit">how to audit your operations tech stack</Link>.
        </p>
      </div>
      <ToolNext
        items={[
          { href: "/blog/operations-tech-stack-audit", tag: "Guide", title: "How to audit your operations tech stack", body: "The step-by-step method behind this worksheet." },
          { href: "/blog/system-of-record-source-of-truth", tag: "Guide", title: "System of record and source of truth", body: "Decide which tool owns which data before you merge anything." },
          { href: "/tools/roi-calculator", tag: "Calculator", title: "Automation ROI calculator", body: "Estimate what an automation would save, using your own numbers." },
        ]}
      />
    </div>
  );
}
