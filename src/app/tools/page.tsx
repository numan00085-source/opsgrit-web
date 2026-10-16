import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free operations tools",
  description:
    "Free, no-signup tools for operations teams: OpsGrit Bot, a migration cutover simulator, an automation ROI calculator, an SOP builder and a technology stack audit worksheet.",
  alternates: { canonical: "/tools" },
};

const TOOLS = [
  {
    href: "/tools/cutover-simulator",
    title: "Cutover Simulator",
    body: "A three-minute game. Make six migration decisions and see if your cutover is clean or ends in a rollback.",
    tag: "Game",
  },
  {
    href: "/tools/daily-puzzle",
    title: "Daily Ops Puzzle",
    body: "Three operations scenarios a day, drawn from our articles. Pick the best call, see why, and share your score.",
    tag: "Game",
  },
  {
    href: "/tools/ops-bot",
    title: "OpsGrit Bot",
    body: "A free assistant for operations and automation. Ask a question, get a clear answer from OpsGrit guides and a link to read more.",
    tag: "Assistant",
  },
  {
    href: "/tools/roi-calculator",
    title: "Automation ROI calculator",
    body: "Estimate hours saved, monthly and first-year savings and payback time for an automation, using your own numbers.",
    tag: "Calculator",
  },
  {
    href: "/tools/sop-builder",
    title: "SOP builder",
    body: "Fill in a short form and get a clean, structured procedure with purpose, scope, roles, steps and a change log. Copy it or download it.",
    tag: "Template",
  },
  {
    href: "/tools/stack-audit",
    title: "Tech stack audit worksheet",
    body: "List every tool, owner, cost and user count, flag overlap and see what the stack costs. Export to CSV for your spreadsheet.",
    tag: "Worksheet",
  },
];

export default function ToolsPage() {
  return (
    <div className="container-page py-14">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Free tools</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">Tools you can use today</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">
        No signup, no email gate. The calculator, SOP builder and audit worksheet run in your browser and nothing you type
        is stored on a server. OpsGrit Bot has its own privacy note on its page.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="card group p-7">
            <span className="chip">{t.tag}</span>
            <h2 className="mt-4 text-xl font-bold text-ink-900 group-hover:text-gold-700">{t.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.body}</p>
            <span className="mt-5 inline-block text-sm font-semibold text-gold-700">Open tool →</span>
          </Link>
        ))}
      </div>
      <p className="mt-10 text-sm text-ink-500">
        Want the thinking behind them? Read{" "}
        <Link className="underline underline-offset-2" href="/blog/how-to-write-an-sop-people-follow">how to write an SOP people follow</Link>
        {" "}and{" "}
        <Link className="underline underline-offset-2" href="/blog/operations-tech-stack-audit">how to audit your operations tech stack</Link>.
      </p>
    </div>
  );
}
