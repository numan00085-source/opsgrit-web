import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Editorial policy: how OpsGrit articles are made",
  description:
    "How OpsGrit researches, writes, reviews and corrects articles, how we use AI, how we handle sponsors and what to do if you spot an error.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <PolicyPage title="Editorial policy" updated="October 11, 2026">
      <p>
        Readers should know how the articles they rely on are made. This page explains who writes at OpsGrit, how we use
        AI, how we check facts and what we do when we get something wrong.
      </p>

      <h2>Who is the OpsGrit Research Desk?</h2>
      <p>
        Articles are published under the byline <strong>OpsGrit Research Desk</strong>. That is a team byline, not a
        named individual, and we do not invent personal profiles or credentials. The desk is responsible for every
        article, and every article is reviewed by the OpsGrit editor before it goes live. If you disagree with
        something, the <Link href="/contact">contact page</Link> reaches the same person.
      </p>

      <h2>How we use AI</h2>
      <p>
        We use AI tools to help research and draft. We say so plainly because it matters. The process looks like this:
      </p>
      <ol>
        <li><strong>Research.</strong> Current facts are collected from primary sources such as vendor documentation, standards bodies, regulators and published research.</li>
        <li><strong>Drafting.</strong> A draft is written to answer a specific operating question, with an original framework or worked example rather than a summary of other articles.</li>
        <li><strong>Editing.</strong> The draft is edited for clarity and plain language.</li>
        <li><strong>Human review.</strong> The editor reads the article, checks claims against the cited sources and decides whether it is ready to publish.</li>
      </ol>
      <p>
        AI-assisted drafting does not change who is accountable. We publish it only if we would stand behind it.
      </p>

      <h2>Sources and evidence</h2>
      <ul>
        <li>Facts that can be checked link to the source. Each article ends with a sources section where we used any.</li>
        <li>Worked examples with numbers are <strong>illustrations</strong> and are labeled as such. They are never presented as real customer data.</li>
        <li>We do not invent statistics, quotes, studies or customers.</li>
        <li>Prices, plan limits and features change often. Where we mention them, check the vendor&rsquo;s current page before you buy. We state the date an article was last reviewed.</li>
        <li>We do not claim hands-on testing unless the article says exactly what was tested and when.</li>
      </ul>

      <h2>Legal, tax and security topics</h2>
      <p>
        Some articles touch on regulation, data protection, contracts or employment practices. They are general
        information, not legal, tax or compliance advice. Confirm requirements for your situation with a qualified
        professional.
      </p>

      <h2>Independence, sponsors and affiliate links</h2>
      <p>
        Editorial decisions are made independently of advertisers and sponsors. Sponsored articles carry a visible
        &ldquo;Sponsored content&rdquo; notice, and links in them are marked as sponsored. If an article ever contains
        affiliate links, we will say so on that page. See <Link href="/advertise">Advertise</Link> for how sponsorship
        works and the <Link href="/affiliate-disclosure">affiliate and sponsorship disclosure</Link> for how OpsGrit earns money.
      </p>

      <h2>Updates and corrections</h2>
      <p>
        When facts change, we update the article and revise its review date. If we make a mistake that affects what a
        reader would do, we correct it in the text and note the correction here.
      </p>
      <h3>Corrections log</h3>
      <p>No corrections have been published yet.</p>
      <p>
        To report an error, use the <Link href="/contact">contact page</Link> and include the article link and what
        looks wrong.
      </p>
    </PolicyPage>
  );
}
