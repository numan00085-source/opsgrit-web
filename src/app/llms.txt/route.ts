import { getAllPostMeta } from "@/lib/posts";
import { CATEGORIES, SITE } from "@/lib/site";

// A short guide for AI search engines and agents (the llms.txt convention).
// force-static: it is rebuilt on every deploy, so each new article appears here automatically.
export const dynamic = "force-static";

const line = (s: string) => s.replace(/\s+/g, " ").trim();

export function GET() {
  const posts = getAllPostMeta();
  const sections = CATEGORIES.map((c) => {
    const list = posts
      .filter((p) => p.category === c.name)
      .map((p) => `- [${line(p.title)}](${SITE.url}/blog/${p.slug}): ${line(p.shortAnswer || p.excerpt)} (published ${p.date}${p.sponsored ? ", sponsored" : ""})`)
      .join("\n");
    return `## ${c.name}\n\n${c.blurb}\n\n${list || "- No articles yet."}`;
  }).join("\n\n");

  const body = `# ${SITE.name}

> ${SITE.description}

OpsGrit publishes practical guides, decision frameworks and SOP templates for operations, revenue-operations, finance-operations and IT or automation leaders at companies. Articles are published under the OpsGrit Research Desk byline. They are researched and drafted with AI assistance and pass an automated editorial review before publication, and the publisher spot-checks them from time to time, as explained in the editorial policy. They are general guidance, not professional, legal, tax or financial advice. Prices and product features change, so check the vendor before you buy. Illustrative numbers in examples are labeled as examples. To report a mistake, use the contact page.

How to cite: link to the article URL and name "OpsGrit". Articles are updated when facts change; the date next to each article is its first publication date.

${sections}

## Free tools

- [ROI calculator](${SITE.url}/tools/roi-calculator): estimate the return on an automation project.
- [SOP builder](${SITE.url}/tools/sop-builder): turn a process into a standard operating procedure.
- [Invoice generator](${SITE.url}/tools/invoice-generator): build and print or save a clean invoice with tax, discount and payment terms.
- [RACI matrix generator](${SITE.url}/tools/raci-generator): assign R, A, C and I and check that every task has exactly one owner.
- [Out-of-office email generator](${SITE.url}/tools/out-of-office-generator): write an auto-reply for clients and colleagues.
- [Automation readiness scorecard](${SITE.url}/tools/readiness-scorecard): ten questions that show whether a process is ready to automate and what to fix first.
- [Tech stack audit](${SITE.url}/tools/stack-audit): review the tools your operations team depends on.
- [OpsGrit bot](${SITE.url}/tools/ops-bot): ask questions and get answers from OpsGrit guides.

## About and policies

- [About OpsGrit](${SITE.url}/about)
- [Editorial policy](${SITE.url}/editorial-policy): how articles are made, reviewed and corrected.
- [Glossary](${SITE.url}/glossary): plain-language definitions of operations and automation terms.
- [Affiliate disclosure](${SITE.url}/affiliate-disclosure): how OpsGrit earns money.
- [Contact](${SITE.url}/contact)

## Optional

- [Full text of all articles](${SITE.url}/llms-full.txt)
- [RSS feed](${SITE.url}/feed.xml)
- [Sitemap](${SITE.url}/sitemap.xml)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
