import type { Metadata } from "next";
import Link from "next/link";
import Scorecard from "./Scorecard";
import ToolNext from "@/components/ToolNext";

export const metadata: Metadata = {
  title: "Automation readiness scorecard",
  description:
    "Free scorecard: answer ten questions about a process and see whether it is ready to automate, which areas are weakest and what to fix first.",
  alternates: { canonical: "/tools/readiness-scorecard" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Automation readiness scorecard</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Automation readiness scorecard</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        Think of one process you want to automate. Answer ten questions about it. You get a score, the areas that need work
        and links to what to read or use next. Nothing you choose is stored on a server.
      </p>
      <Scorecard />
      <div className="prose mt-12 max-w-3xl">
        <h2>How the score works</h2>
        <p>
          There are five areas, each with two questions: process clarity, inputs and systems, volume and value, risk and control,
          and ownership and monitoring. Each answer is worth 0, 1 or 2 points, so the total is out of 20 and is shown out of 100.
        </p>
        <p>
          If the risk and control area scores 1 or less, the result is held at &quot;Partly ready&quot; however high the total is,
          because a well-documented process that cannot be undone is still a risky thing to automate.
        </p>
        <p className="text-sm text-ink-500">
          This is a self-assessment built from common operating practice. It is a conversation starter, not a prediction of
          results. To size the benefit, use the <Link href="/tools/roi-calculator">automation ROI calculator</Link>.
        </p>
      </div>
      <ToolNext
        items={[
          { href: "/tools/roi-calculator", tag: "Calculator", title: "Automation ROI calculator", body: "Estimate savings and payback once the process is ready." },
          { href: "/blog/what-to-automate-first-process-prioritization", tag: "Guide", title: "What to automate first", body: "Rank candidate processes by value, effort and risk." },
          { href: "/blog/human-in-the-loop-ai-approvals", tag: "Guide", title: "Human-in-the-loop design", body: "Where an automation should stop and ask a person." },
        ]}
      />
    </div>
  );
}
