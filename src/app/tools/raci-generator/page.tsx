import ToolNext from "@/components/ToolNext";
import type { Metadata } from "next";
import Link from "next/link";
import RaciGenerator from "./RaciGenerator";

export const metadata: Metadata = {
  title: "Free RACI matrix generator",
  description:
    "Free RACI matrix generator. Add tasks and roles, set R, A, C and I, and get instant checks for missing or duplicate owners. Copy as a table, download CSV or print.",
  alternates: { canonical: "/tools/raci-generator" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500 print:hidden"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / RACI matrix generator</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 print:hidden">Free RACI matrix generator</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600 print:hidden">
        List the tasks, name the roles and choose R, A, C or I for each pair. The tool flags tasks with no owner or more
        than one, and shows how much work each role carries. Copy the matrix, download it or print it.
      </p>
      <RaciGenerator />

      <section className="mt-16 max-w-3xl print:hidden">
        <h2 className="text-2xl font-bold text-ink-900">How to build a RACI matrix that works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-700">
          <li><strong>List tasks, not topics.</strong> Use actions such as &quot;approve invoices over the limit&quot;, so it is clear what is being decided.</li>
          <li><strong>Use roles, not names.</strong> Roles survive staff changes. Add the names in a separate list.</li>
          <li><strong>Give every task exactly one A.</strong> Two accountable owners means no one is accountable.</li>
          <li><strong>Keep C and I short.</strong> If everyone is consulted, nothing moves. Inform people only when they need to act on it.</li>
          <li><strong>Check the workload.</strong> A role with many A and R marks is a bottleneck and a single point of failure.</li>
        </ol>
        <p className="mt-6 text-ink-700">
          For worked examples, common mistakes and a rollout plan, read our guide to the{" "}
          <Link className="underline underline-offset-2" href="/blog/raci-matrix-operations-teams-template">RACI matrix for operations teams</Link>.
          Once the roles are clear, write the steps down with the{" "}
          <Link className="underline underline-offset-2" href="/tools/sop-builder">SOP builder</Link>, and see{" "}
          <Link className="underline underline-offset-2" href="/blog/sop-governance-ownership-versioning">SOP governance</Link>{" "}
          for keeping ownership current.
        </p>
      </section>
      <ToolNext
        items={[
          { href: "/tools/sop-builder", tag: "Builder", title: "SOP builder", body: "Write the steps once roles are clear." },
          { href: "/tools/readiness-scorecard", tag: "Scorecard", title: "Automation readiness scorecard", body: "See whether a process is ready to automate." },
          { href: "/blog/raci-matrix-operations-teams-template", tag: "Guide", title: "RACI matrix for operations teams", body: "Examples, mistakes and a rollout plan." },
        ]}
      />
    </div>
  );
}
