import { getSettings } from "@/lib/settings";

export const SITE = {
  name: "OpsGrit",
  tagline: "Operational clarity for teams that run on systems.",
  description:
    "OpsGrit is an independent B2B publication on AI workflows, business automation and operations. Practical playbooks, tool breakdowns, SOPs and free tools for operators.",
  // Canonical site URL. An env var can override it (handy for previews); otherwise the real domain is used.
  url: (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://www.getopsgrit.com").replace(/\/$/, ""),
  email: getSettings().contactEmail,
  updated: "October 11, 2026",
};

export const CATEGORIES = [
  {
    name: "AI Automation",
    slug: "ai-automation",
    blurb: "Agents, copilots and LLM workflows that remove manual work.",
  },
  {
    name: "Ops Stack",
    slug: "ops-stack",
    blurb: "Tool comparisons, integrations and architecture for modern ops.",
  },
  {
    name: "Process SOPs",
    slug: "process-sops",
    blurb: "Repeatable, documented procedures you can adopt today.",
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];

export function categorySlug(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.slug ?? name.toLowerCase().replace(/\s+/g, "-");
}

export const TOPIC_INTROS: Record<string, { headline: string; intro: string; tools: { href: string; label: string }[] }> = {
  "ai-automation": {
    headline: "AI automation for operations, without the hype",
    intro:
      "Where AI agents, copilots and LLM workflows genuinely remove manual work in operations, and where they add risk. These guides focus on choosing the right level of autonomy, keeping a human in the loop where it matters and measuring results honestly.",
    tools: [{ href: "/tools/roi-calculator", label: "Automation ROI calculator" }],
  },
  "ops-stack": {
    headline: "The operations stack: tools, data and integrations",
    intro:
      "How to choose, connect and govern the software operations teams depend on. Expect decision frameworks for automation platforms, systems of record, integrations and build versus buy, with the trade-offs spelled out.",
    tools: [{ href: "/tools/stack-audit", label: "Tech stack audit worksheet" }],
  },
  "process-sops": {
    headline: "Process and SOPs that people actually follow",
    intro:
      "Templates and methods for procedures that survive contact with real work: how to write them, test them, roll them out and keep them current. Includes onboarding, vendor, incident and governance playbooks.",
    tools: [{ href: "/tools/sop-builder", label: "SOP builder" }],
  },
};
