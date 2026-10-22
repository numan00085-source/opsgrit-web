import type { Metadata } from "next";
import Link from "next/link";
import OpsRunner from "./OpsRunner";
import ToolNext from "@/components/ToolNext";

export const metadata: Metadata = {
  title: "Ops Runner: a free endless runner game",
  description:
    "A free browser arcade game. Jump over Reply All, spreadsheets and sync meetings, collect the hours you save and see how high you can rank. No signup.",
  alternates: { canonical: "/tools/ops-runner" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Ops Runner</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Ops Runner</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        A tiny bot is running from the busywork. Jump it, grab the clocks and see how many hours you can save before it
        catches you. Works on your phone and keyboard, no signup.
      </p>
      <OpsRunner />
      <ToolNext
        heading="Now save real hours"
        items={[
          { href: "/tools/roi-calculator", tag: "Calculator", title: "Automation ROI calculator", body: "Turn a real repetitive task into hours saved and payback time." },
          { href: "/tools/readiness-scorecard", tag: "Scorecard", title: "Automation readiness scorecard", body: "Ten questions to see if a process is ready to automate." },
          { href: "/blog/what-to-automate-first-process-prioritization", tag: "Guide", title: "What to automate first", body: "Rank your busywork by value, effort and risk." },
        ]}
      />
    </div>
  );
}
