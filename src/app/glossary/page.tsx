import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Operations and automation glossary",
  description:
    "Plain-language definitions of the terms operations teams run into: SOP, system of record, webhook, iPaaS, idempotency, human-in-the-loop, RPA and more.",
  alternates: { canonical: "/glossary" },
};

interface Term {
  term: string;
  def: string;
  read?: { href: string; label: string };
}

const TERMS: Term[] = [
  { term: "AI agent", def: "Software that uses a language model to decide what step to take next, often by calling tools, to reach a goal. It differs from a fixed workflow, where a person has decided every step in advance.", read: { href: "/blog/ai-agents-vs-workflows-operations", label: "AI agents vs workflows" } },
  { term: "API (application programming interface)", def: "A defined way for one piece of software to ask another for data or to make it do something, using structured requests and responses.", read: { href: "/blog/webhooks-apis-ipaas-integration-patterns", label: "Webhooks, APIs and iPaaS" } },
  { term: "Audit trail", def: "A record of who did what and when, kept so that actions and approvals can be reviewed later." },
  { term: "Automation", def: "Using software to perform a task or a sequence of tasks without manual effort each time it runs." },
  { term: "Change log", def: "A short list at the end of a document that records each version, its date, the author and what changed.", read: { href: "/blog/sop-governance-ownership-versioning", label: "SOP governance" } },
  { term: "Dead letter queue", def: "A holding place for messages or tasks that could not be processed after retries, so a person can inspect and replay them instead of losing them." },
  { term: "Escalation", def: "Passing a problem to a more senior or specialized person when the first responder cannot or should not resolve it." },
  { term: "Human-in-the-loop (HITL)", def: "A design where a person reviews or approves an automated step, usually where errors are costly or the system is uncertain.", read: { href: "/blog/human-in-the-loop-ai-approvals", label: "Human-in-the-loop approvals" } },
  { term: "iPaaS (integration platform as a service)", def: "A hosted platform for building and running integrations between applications, usually with a visual builder and prebuilt connectors.", read: { href: "/blog/zapier-vs-make-vs-n8n-ops-teams", label: "Zapier vs Make vs n8n" } },
  { term: "Idempotency", def: "A property of an operation: running it twice has the same effect as running it once. It makes retries and duplicate messages safe.", read: { href: "/blog/webhooks-apis-ipaas-integration-patterns", label: "Integration patterns" } },
  { term: "Incident", def: "An unplanned event that disrupts or threatens a business service, or puts data, money or customers at risk.", read: { href: "/blog/operational-incident-response-runbook", label: "Incident response runbook" } },
  { term: "Least privilege", def: "Giving a person or system only the access it needs to do its job, and no more." },
  { term: "Low-code / no-code", def: "Tools for building workflows and simple applications with visual interfaces instead of writing most of the code by hand." },
  { term: "OCR (optical character recognition)", def: "Technology that reads text from images or scanned documents, often a first step in invoice and form processing.", read: { href: "/blog/ai-invoice-processing-accounts-payable", label: "AI invoice processing" } },
  { term: "Process owner", def: "The person accountable for how a process performs end to end and for keeping its documentation correct." },
  { term: "RPA (robotic process automation)", def: "Software that imitates user actions on screens, such as clicking and typing, to automate tasks in systems that lack good APIs." },
  { term: "Runbook", def: "A step-by-step operational guide for a specific system or situation, such as responding to an outage.", read: { href: "/blog/operational-incident-response-runbook", label: "Incident response runbook" } },
  { term: "Service level agreement (SLA)", def: "A commitment about how fast a team will respond to or resolve a request, often with consequences if missed." },
  { term: "Severity level", def: "A rating of how serious an incident is, used to decide how fast and how widely to respond." },
  { term: "SOP (standard operating procedure)", def: "A documented, repeatable way to perform a task so the result is consistent no matter who does it.", read: { href: "/blog/how-to-write-an-sop-people-follow", label: "How to write an SOP" } },
  { term: "System of record", def: "The system whose version of a piece of data is treated as correct when systems disagree.", read: { href: "/blog/system-of-record-source-of-truth", label: "System of record" } },
  { term: "Tech stack", def: "The set of software tools and platforms a team or company uses to do its work.", read: { href: "/blog/operations-tech-stack-audit", label: "Tech stack audit" } },
  { term: "Ticket triage", def: "Sorting incoming support requests by category, urgency and owner so they reach the right person quickly.", read: { href: "/blog/ai-ticket-triage-support-operations", label: "AI ticket triage" } },
  { term: "Total cost of ownership (TCO)", def: "The full cost of a tool or system over its life: licenses, implementation, integration, training, administration and exit.", read: { href: "/blog/build-vs-buy-operations-software", label: "Build vs buy" } },
  { term: "Webhook", def: "A message a system sends to another system when something happens, instead of waiting to be asked.", read: { href: "/blog/webhooks-apis-ipaas-integration-patterns", label: "Webhooks, APIs and iPaaS" } },
  { term: "Workflow", def: "A defined sequence of steps, with triggers and decisions, that moves work from start to finish." },
];

export default function GlossaryPage() {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "OpsGrit operations and automation glossary",
    hasDefinedTerm: sorted.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.def })),
  };
  return (
    <div className="container-page py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-700">Glossary</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink-900">Operations and automation terms, in plain language</h1>
        <p className="mt-4 text-lg text-ink-600">Short definitions of terms used across OpsGrit, with links to the articles that go deeper.</p>
        <dl className="mt-10 divide-y divide-cream-300">
          {sorted.map((t) => (
            <div key={t.term} className="py-5" id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <dt className="text-lg font-bold text-ink-900">{t.term}</dt>
              <dd className="mt-1 leading-relaxed text-ink-600">
                {t.def}
                {t.read && (
                  <>
                    {" "}
                    <Link href={t.read.href} className="font-semibold text-gold-700 underline underline-offset-2">{t.read.label} →</Link>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
