import type { Metadata } from "next";
import Link from "next/link";
import StackAudit from "./StackAudit";

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
    </div>
  );
}
