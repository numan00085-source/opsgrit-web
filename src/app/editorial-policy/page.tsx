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

      <h2>Who is Sam?</h2>
      <p>
        Articles are published under the byline <strong>Sam</strong>, the editorial byline of OpsGrit. It stands for the
        OpsGrit editorial process, and we do not invent personal profiles or professional credentials for it. Sam is responsible for every
        article. Every article passes an automated editorial review before it goes live, the publisher checks articles
        from time to time, and Sam reads reader reports and corrects or removes content when it is wrong. If you disagree with something, the{" "}
        <Link href="/contact">contact page</Link> reaches Sam.
      </p>

      <h2>Who runs OpsGrit?</h2>
      <p>
        OpsGrit was started by a founder who prefers to stay private for now. The founder took the initiative to build a
        free resource that helps people who run operations. Nothing here depends on a personal profile: the way every article is
        researched, checked and corrected is described on this page.
      </p>

      <h2>How we use AI</h2>
      <p>
        We use AI tools to help research and draft. We say so plainly because it matters. The process looks like this:
      </p>
      <ol>
        <li><strong>Research.</strong> Current facts are collected from primary sources such as vendor documentation, standards bodies, regulators and published research.</li>
        <li><strong>Drafting.</strong> A draft is written to answer a specific operating question, with an original framework or worked example rather than a summary of other articles.</li>
        <li><strong>Editing.</strong> The draft is edited for clarity and plain language.</li>
        <li><strong>Automated editorial review.</strong> A separate AI editor scores the article for business relevance, depth, originality, clarity and trust. It rewrites or removes weak or unsupported passages, and an article that does not meet our minimum standard is not published. This review is performed by AI, so it can miss mistakes.</li>
        <li><strong>Publisher spot-checks.</strong> The publisher of OpsGrit reads and checks articles from time to time and acts on what is found. Not every article is read by a person before it goes live, which is why the automated review and reader reports matter.</li>
        <li><strong>Corrections.</strong> People can read and report problems at any time. The desk reviews every report and corrects or removes content.</li>
      </ol>
      <p>
        AI-assisted drafting does not change who is accountable. We publish only what passes our review and correct what does not hold up. Articles are guidance, not professional, legal or financial advice.
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
