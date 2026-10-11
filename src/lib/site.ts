export const SITE = {
  name: "OpsGrit",
  tagline: "Operational clarity for teams that run on systems.",
  description:
    "OpsGrit is a B2B publication on AI workflows, enterprise automation and operations. Practical playbooks, tool breakdowns and SOPs for operators.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://opsgrit.com").replace(/\/$/, ""),
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@opsgrit.com",
  newsletterAction: process.env.NEXT_PUBLIC_NEWSLETTER_ACTION || "",
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
