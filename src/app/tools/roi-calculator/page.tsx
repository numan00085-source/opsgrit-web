import type { Metadata } from "next";
import Link from "next/link";
import RoiCalculator from "./RoiCalculator";
import ToolNext from "@/components/ToolNext";

export const metadata: Metadata = {
  title: "Automation ROI calculator",
  description:
    "Free calculator: estimate hours saved, monthly savings, payback period and first-year ROI of an automation using your own numbers.",
  alternates: { canonical: "/tools/roi-calculator" },
};

export default function Page() {
  return (
    <div className="container-page py-14">
      <nav className="mb-6 text-sm text-ink-500"><Link href="/tools" className="hover:text-gold-700">Tools</Link> / Automation ROI calculator</nav>
      <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">Automation ROI calculator</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-600">
        Put real numbers in, get a defensible estimate out. Change any input to see how sensitive the result is.
      </p>
      <RoiCalculator />
      <div className="prose mt-12 max-w-3xl">
        <h2>How the numbers work</h2>
        <ul>
          <li><strong>Hours saved per month</strong> = tasks per month × minutes per task × share automated ÷ 60.</li>
          <li><strong>Monthly benefit</strong> = hours saved × loaded hourly cost, plus any monthly error cost you avoid.</li>
          <li><strong>Monthly running cost</strong> = tool or platform fees plus maintenance hours × hourly cost.</li>
          <li><strong>Payback</strong> = one-time build cost ÷ monthly net benefit.</li>
        </ul>
        <p>
          Be conservative. Use the time people actually spend today, not the time they think they spend, and include the
          maintenance an automation needs. If the case only works with optimistic inputs, it is not a strong case. For
          more on choosing between approaches, read <Link href="/blog/build-vs-buy-operations-software">Build vs. Buy for operations software</Link>.
        </p>
        <p className="text-sm text-ink-500">
          This is an estimating aid, not financial advice. Savings in time are only real savings if the freed hours are
          redirected to valuable work or reduce paid hours.
        </p>
      </div>
      <ToolNext
        items={[
          { href: "/tools/readiness-scorecard", tag: "Scorecard", title: "Is the process ready to automate?", body: "Ten quick questions. See what to fix before you spend on a build." },
          { href: "/blog/what-to-automate-first-process-prioritization", tag: "Guide", title: "What to automate first", body: "A way to rank processes by value, effort and risk." },
          { href: "/blog/ai-workflow-cost-budget-control", tag: "Guide", title: "What an AI workflow really costs", body: "Budget the running cost, not only the build." },
        ]}
      />
    </div>
  );
}
