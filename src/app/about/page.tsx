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
      <h2 id="sam">Who is Sam?</h2>
      <div className="not-prose my-4 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/sam-avatar.webp" alt="Default profile picture for Sam, the OpsGrit byline" width={72} height={72} className="h-[72px] w-[72px] rounded-full border border-cream-300 object-cover" />
        <p className="text-sm text-ink-600"><strong className="text-ink-900">Sam</strong>, OpsGrit editorial byline</p>
      </div>
      <p>
        <strong>Sam</strong> is the OpsGrit editorial byline. Guides are researched from primary sources such as vendor
        documentation and standards bodies, drafted with AI assistance, checked by an automated editorial review and
        spot-checked by the publisher. We do not claim professional credentials for the byline. Read exactly how this works in our{" "}
        <Link href="/editorial-policy">editorial policy</Link>, or <Link href="/contact">tell Sam</Link> about a mistake.
      </p>
      <h2>About the founder</h2>
      <p>
        OpsGrit was started by a founder who has chosen to stay private for now and prefers not to share personal details.
        The founder took the initiative to build OpsGrit to help people who run operations: practical guides, templates and
        free tools that anyone can use without signing up. The publication stands on the quality of its work, which is
        why the <Link href="/editorial-policy">editorial policy</Link> explains openly how every article is made.
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
        automated editorial review before it is published, and the publisher spot-checks articles from time to time. Sam, the OpsGrit byline, takes responsibility for what
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
