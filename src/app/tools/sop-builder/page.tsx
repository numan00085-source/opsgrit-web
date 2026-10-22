import type { Metadata } from "next";
import Link from "next/link";
import SopBuilder from "./SopBuilder";
import ToolNext from "@/components/ToolNext";

export const metadata: Metadata = {
  title: "SOP builder",
  description:
    "Free SOP builder: fill in a short form and get a clean standard operating procedure with purpose, scope, roles, steps, exceptions and a change log. Copy or download it.",
  alternates: { canonical: "/tools/sop-builder" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / SOP builder</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">SOP builder</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        Write the steps, one per line. The builder numbers them and wraps everything in a standard structure. Then test
        the result with someone who has never done the task, as described in our guide to{" "}
        <Link className="underline underline-offset-2" href="/blog/how-to-write-an-sop-people-follow">writing an SOP people follow</Link>.
      </p>
      <SopBuilder />
      <ToolNext
        items={[
          { href: "/blog/sop-templates-every-ops-team-needs", tag: "Guide", title: "10 SOP templates for ops teams", body: "Checklist, runbook, handoff note, access request and more." },
          { href: "/blog/sop-governance-ownership-versioning", tag: "Guide", title: "SOP governance", body: "Ownership, versioning and review cycles so documents stay current." },
          { href: "/tools/raci-generator", tag: "Generator", title: "RACI matrix generator", body: "Decide who does, approves, is consulted and is informed." },
        ]}
      />
    </div>
  );
}
