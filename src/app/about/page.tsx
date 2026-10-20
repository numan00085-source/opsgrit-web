import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "OpsGrit is an independent B2B publication on AI workflows, business automation and operations. Practical playbooks, tool breakdowns, SOPs and free tools for operators.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PolicyPage title="About OpsGrit">
      <p>
        {SITE.name} is an independent B2B publication for the people who keep companies running: operations leaders,
        revops and finance-ops teams, automation engineers and the founders who still do all of the above on Fridays.
      </p>
      <h2>What we cover</h2>
      <ul>
        <li><strong>AI Automation:</strong> agents, copilots and LLM-powered workflows, with an honest view of what works and what breaks.</li>
        <li><strong>Ops Stack:</strong> comparisons, integrations and architecture for the tools operations teams depend on.</li>
        <li><strong>Process SOPs:</strong> documented, repeatable procedures you can adapt for your own team.</li>
      </ul>
      <h2>Our editorial standards</h2>
      <p>
        Every article is written to be useful first. We cite primary sources where they exist, state our assumptions,
        and update articles when facts change. We use AI tools to help research and draft, and every article passes an
        automated editorial review before it is published. The OpsGrit Research Desk takes responsibility for what
        we publish and corrects errors when readers report them.
      </p>
      <h2>Independence and sponsorship</h2>
      <p>
        Editorial decisions are made independently of advertisers. If an article contains affiliate links or sponsored
        content, we say so clearly in the article. Advertising, where present, is shown separately from editorial
        content.
      </p>
      <h2>Corrections</h2>
      <p>
        Found an error? Tell us through the <Link href="/contact">contact page</Link> and we will review and correct
        it promptly.
      </p>
    </PolicyPage>
  );
}
