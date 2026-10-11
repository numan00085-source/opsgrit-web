// Curated Q&A for OpsGrit Bot (part 2: automation, AI, tools, integrations, ROI, stack, incidents, data).
import type { Faq } from "./botFaq1";

export const FAQ2: Faq[] = [
  // ---------- Automation strategy ----------
  {
    q: "Where should a small team start with automation?",
    k: "begin first automation start small beginner pilot quick win which process",
    a: "Pick one repetitive, rule-based task that people dislike and that happens often, such as moving data between two tools. Map the steps by hand first, automate only what is stable, measure hours saved, then repeat. Small wins build trust faster than a big project.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/tools/roi-calculator"],
  },
  {
    q: "Which processes are good candidates for automation?",
    k: "candidates choose select prioritize use cases score criteria suitable",
    a: "High-volume, rule-based, stable processes with clear inputs and outputs and a measurable cost. Score candidates on frequency, time per run, error cost, data readiness and risk, then start with the high-value, low-risk ones.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive"],
  },
  {
    q: "Should I map a process before automating it?",
    k: "map process flow document first before automate bad process",
    a: "Yes. Automating a messy process just makes mess faster. Write down the real steps, owners, inputs, exceptions and handoffs first. You will often find steps to remove entirely before any tool is involved.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/blog/how-to-write-an-sop-people-follow"],
  },
  {
    q: "What does a 90-day automation rollout look like?",
    k: "rollout plan roadmap timeline phases 90 day implementation schedule",
    a: "Roughly: the first weeks for mapping, prioritizing and picking one pilot; the middle for building with guardrails and testing on real cases; the last for staged rollout, measuring results and deciding what to scale. Keep each stage small and reversible.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/blog/ai-invoice-processing-accounts-payable"],
  },
  {
    q: "What are the most common automation mistakes?",
    k: "mistakes pitfalls failures why automation projects fail errors avoid",
    a: "Automating a broken process, skipping guardrails, no owner for the automation, no measurement, trusting AI output without checks and building complicated things that nobody can maintain. Start simple and name an owner from day one.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/blog/zapier-vs-make-vs-n8n-ops-teams"],
  },
  {
    q: "How do I measure automation ROI honestly?",
    k: "roi return on investment savings payback calculate measure benefit hours saved worth it worthwhile justify business case value is automation worth",
    a: "Use the time people actually spend today, not what they guess. Benefit is hours saved times loaded hourly cost plus avoided error cost. Subtract running costs and maintenance time, then divide the build cost by monthly net benefit for payback. Be conservative.",
    l: ["/tools/roi-calculator", "/blog/ai-workflow-automation-operations-deep-dive"],
  },
  {
    q: "Are the time savings from automation real savings?",
    k: "real savings hours redirected headcount value freed time",
    a: "Only if the freed time is redirected to valuable work or reduces paid hours. Ten saved hours that vanish into other busywork produce no business value. Decide in advance where the time goes.",
    l: ["/tools/roi-calculator"],
  },
  {
    q: "Who should maintain automations?",
    k: "maintenance owner monitoring technical debt documentation break fix",
    a: "Every automation needs a named owner, documentation of what it does and alerts when it fails. Treat automations like small products: they break when apps change, so someone must be responsible.",
    l: ["/blog/zapier-vs-make-vs-n8n-ops-teams", "/blog/sop-governance-ownership-versioning"],
  },

  // ---------- AI ----------
  {
    q: "What is the difference between an AI agent and a workflow?",
    k: "agent vs workflow difference agentic autonomous fixed steps decide",
    a: "In a workflow, people decide every step in advance and software just runs them. In an agent, a language model decides what to do next, often by calling tools. Workflows are cheaper, faster and easier to test, so make them your default.",
    l: ["/blog/ai-agents-vs-workflows-operations", "/glossary"],
  },
  {
    q: "When should I use an AI agent?",
    k: "when agent worth it use case needed open-ended unpredictable",
    a: "When the path cannot be written down in advance: open-ended research, messy inputs or tasks needing judgment across tools. Even then, add guardrails and a human check on consequential actions. If steps are known, use a workflow.",
    l: ["/blog/ai-agents-vs-workflows-operations"],
  },
  {
    q: "What guardrails do AI agents need?",
    k: "guardrails safety limits permissions budget logging stop controls risk",
    a: "Limited permissions, spending and step limits, logging of every action, approval for consequential steps, tested evaluation cases and a stop button. Give an agent only the access its job needs.",
    l: ["/blog/ai-agents-vs-workflows-operations", "/blog/human-in-the-loop-ai-approvals"],
  },
  {
    q: "What does human-in-the-loop mean?",
    k: "hitl human in the loop approval review oversight meaning",
    a: "A design where a person reviews or approves an automated step, usually where mistakes are costly or the system is uncertain. The skill is deciding which steps need a person, so reviewers are not buried in trivial approvals.",
    l: ["/blog/human-in-the-loop-ai-approvals", "/glossary"],
  },
  {
    q: "Where should AI ask a human before acting?",
    k: "approval consequence irreversible money customer legal risk classify actions",
    a: "Classify every action by consequence. Reversible, low-impact actions can run automatically. Anything touching money, customers, legal commitments, security or personal data should be reviewed, at least until you have evidence it performs well.",
    l: ["/blog/human-in-the-loop-ai-approvals"],
  },
  {
    q: "What is approval fatigue?",
    k: "approval fatigue rubber stamp too many reviews reviewer overload clicks",
    a: "When reviewers get so many approval requests that they click through without reading, which defeats the control. Fix it by routing only risky or uncertain items to people and making each review quick to judge.",
    l: ["/blog/human-in-the-loop-ai-approvals"],
  },
  {
    q: "How do I know when to loosen human review?",
    k: "reduce review trust autonomy evidence metrics accuracy error rate relax",
    a: "Loosen controls only with evidence: track how often reviewers change the AI's output and how severe errors are, then reduce review step by step for the categories that prove reliable. Keep sampling checks and a way to stop.",
    l: ["/blog/human-in-the-loop-ai-approvals"],
  },
  {
    q: "How do I manage AI risk in my company?",
    k: "ai risk governance nist framework policy compliance trust responsible",
    a: "A useful starting point is the NIST AI Risk Management Framework, which organizes the work into Govern, Map, Measure and Manage. In practice: set owners and policies, know where AI is used, test its performance and monitor it after launch.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/blog/human-in-the-loop-ai-approvals"],
  },
  {
    q: "Is my data safe when using AI tools?",
    k: "data privacy confidential security leak training vendor terms sensitive",
    a: "It depends on the tool and its contract. Before sending company or customer data, check the vendor's data retention, training and security terms, limit what you share and prefer approved tools. When unsure, do not paste confidential data.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/blog/vendor-onboarding-sop-procurement"],
  },
  {
    q: "How do I make sure AI output is accurate enough?",
    k: "accuracy evaluation test set quality measure errors benchmark validate",
    a: "Build an evaluation set of real examples with known correct answers, measure the system against it before launch and again over time. Validate critical fields with rules, not with another model, and track error rates by category.",
    l: ["/blog/ai-ticket-triage-support-operations", "/blog/ai-invoice-processing-accounts-payable"],
  },

  // ---------- Support triage ----------
  {
    q: "How does AI ticket triage work?",
    k: "ticket triage support routing classify priority categories helpdesk inbox",
    a: "The system reads each incoming request, assigns a category and priority, routes it to the right queue and can draft a reply or summary for the agent. Success depends on a clear taxonomy, an evaluation set and rules for cases that must go to a human immediately.",
    l: ["/blog/ai-ticket-triage-support-operations"],
  },
  {
    q: "Which support tickets should always go to a human?",
    k: "escalate human urgent legal safety angry vip security cases sensitive",
    a: "Anything involving safety, legal threats, security incidents, payments disputes, vulnerable customers or high-value accounts, plus anything the system is not confident about. Define these cases explicitly before launch.",
    l: ["/blog/ai-ticket-triage-support-operations"],
  },
  {
    q: "What metrics show that ticket triage works?",
    k: "metrics kpi first response time routing accuracy resolution reassign csat",
    a: "Routing accuracy, reassignment rate, time to first response, time to resolution, escalation accuracy and agent edit rate on drafted replies. Compare against your baseline before the rollout.",
    l: ["/blog/ai-ticket-triage-support-operations"],
  },
  {
    q: "Is it safe to let AI draft customer replies?",
    k: "draft replies customer communication safe review brand tone risk",
    a: "Yes, with a person reviewing before sending, approved knowledge sources, a tone guide and rules against promising refunds or legal outcomes. Treat drafts as suggestions that save time, not as final messages.",
    l: ["/blog/ai-ticket-triage-support-operations", "/blog/human-in-the-loop-ai-approvals"],
  },

  // ---------- Invoices ----------
  {
    q: "How do I automate invoice processing without losing control?",
    k: "invoice accounts payable ap automation ocr capture approval finance control",
    a: "Map the lifecycle first. Use AI for capture and coding suggestions, validate with rules, match to purchase orders and receipts, and keep approvals, segregation of duties and an audit trail. Measure accuracy before trusting it.",
    l: ["/blog/ai-invoice-processing-accounts-payable"],
  },
  {
    q: "What is three-way matching?",
    k: "three way match purchase order receipt invoice po goods received",
    a: "Checking that the invoice agrees with the purchase order and with proof that goods or services were received before paying. It catches overbilling, duplicates and unauthorized purchases.",
    l: ["/blog/ai-invoice-processing-accounts-payable"],
  },
  {
    q: "What is OCR?",
    k: "ocr optical character recognition scan read text document extraction",
    a: "Optical character recognition: technology that reads text from images or scanned documents. In invoice work it is often the first step, turning a PDF into data that rules can then validate.",
    l: ["/glossary", "/blog/ai-invoice-processing-accounts-payable"],
  },
  {
    q: "Which controls must I keep when automating accounts payable?",
    k: "controls segregation duties approval limits audit trail fraud duplicates",
    a: "Segregation of duties, approval limits, duplicate detection, vendor master change control and a complete audit trail. Automation should add speed without removing the checks that protect money.",
    l: ["/blog/ai-invoice-processing-accounts-payable"],
  },

  // ---------- Tools & integrations ----------
  {
    q: "Zapier vs Make vs n8n: how do I choose?",
    k: "zapier make n8n compare choose platform automation tool difference best which",
    a: "Judge them on who will build and maintain workflows, how pricing scales with your usage, how complex your logic is, error handling, governance, security and hosting, and the integrations you need. Then pilot two for two weeks. Zapier tends to suit non-technical builders, Make suits visual multi-branch logic, and n8n suits technical teams wanting control, including self-hosting.",
    l: ["/blog/zapier-vs-make-vs-n8n-ops-teams"],
  },
  {
    q: "How do Zapier, Make and n8n count usage?",
    k: "pricing meter tasks credits executions operations billing cost scale usage",
    a: "They meter differently: Zapier counts tasks, Make counts credits and n8n's pricing is based on workflow executions. That is why the cheapest plan on a pricing page may not be cheapest for your workflow. Check each vendor's current pricing page because plans change.",
    l: ["/blog/zapier-vs-make-vs-n8n-ops-teams"],
  },
  {
    q: "Should I self-host n8n?",
    k: "self host n8n hosting data residency security control maintenance server",
    a: "Self-hosting gives control over data location and can reduce per-run costs, but you take on maintenance, updates, security and uptime. Choose it when you have technical capacity and a real data-control need. Check n8n's current licensing terms.",
    l: ["/blog/zapier-vs-make-vs-n8n-ops-teams"],
  },
  {
    q: "How do I avoid lock-in with automation platforms?",
    k: "lock in vendor portability exit documentation standard migrate technical debt",
    a: "Document every workflow, keep business logic readable, avoid stuffing critical logic into one tool's quirks, store important data in your own systems and keep an exit plan. Review the stack on a schedule.",
    l: ["/blog/zapier-vs-make-vs-n8n-ops-teams", "/blog/operations-tech-stack-audit"],
  },
  {
    q: "What is a webhook?",
    k: "webhook definition meaning callback event notify http push",
    a: "A message one system sends to another when something happens, instead of waiting to be asked. For example, a payment tool pings your system the moment a payment succeeds.",
    l: ["/blog/webhooks-apis-ipaas-integration-patterns", "/glossary"],
  },
  {
    q: "What is an API?",
    k: "api application programming interface definition meaning endpoint request",
    a: "A defined way for one piece of software to ask another for data or make it do something, using structured requests and responses. APIs are how most modern tools connect to each other.",
    l: ["/blog/webhooks-apis-ipaas-integration-patterns", "/glossary"],
  },
  {
    q: "Webhooks or polling: which should I use?",
    k: "webhook vs polling difference notify real time check interval",
    a: "Prefer webhooks when the source supports them: they are faster and cheaper because the source tells you when something changes. Use polling when no webhook exists or you need a simple fallback, accepting some delay and extra calls.",
    l: ["/blog/webhooks-apis-ipaas-integration-patterns"],
  },
  {
    q: "What is idempotency and why does it matter?",
    k: "idempotent idempotency duplicate retry safe twice repeated messages",
    a: "An operation is idempotent when running it twice has the same effect as running it once. It matters because retries and duplicate messages happen, and without it you can double-charge a customer or create two records.",
    l: ["/blog/webhooks-apis-ipaas-integration-patterns", "/glossary"],
  },
  {
    q: "What makes an integration dependable?",
    k: "reliable integration retries error handling monitoring dead letter queue logging alerts",
    a: "Retries with backoff, idempotent operations, error alerts, a dead letter queue for failed items, logging and clear documentation of who owns it and what happens on failure.",
    l: ["/blog/webhooks-apis-ipaas-integration-patterns"],
  },
  {
    q: "What is iPaaS?",
    k: "ipaas integration platform as a service definition connectors hosted",
    a: "Integration platform as a service: a hosted platform for building and running integrations between applications, usually with a visual builder and prebuilt connectors. Zapier, Make and n8n are commonly grouped here.",
    l: ["/glossary", "/blog/zapier-vs-make-vs-n8n-ops-teams"],
  },
  {
    q: "What is RPA and when should I use it?",
    k: "rpa robotic process automation screen bots legacy ui clicks",
    a: "Robotic process automation imitates user actions on screens, such as clicking and typing. It is a workaround for systems without good APIs. If an API exists, integrate through it instead: it is more stable than screen scraping.",
    l: ["/glossary"],
  },

  // ---------- Stack, data, build vs buy ----------
  {
    q: "How do I audit my operations tech stack?",
    k: "audit tech stack inventory tools software review overlap cost week",
    a: "Run it in about a week: build the list from several sources (finance, SSO, team surveys), fill in owner, cost and usage, map data flows, assess overlap and risk, then decide and communicate what to keep, merge or retire. Our free worksheet structures it.",
    l: ["/blog/operations-tech-stack-audit", "/tools/stack-audit"],
  },
  {
    q: "How do I find tools my company is paying for but not using?",
    k: "unused shelfware licenses subscriptions waste savings cancel redundant spend",
    a: "Cross-check the finance records, single sign-on logs and a short team survey against your tool list, then compare licenses with active users. Anything with an owner nobody can name is a retirement candidate.",
    l: ["/blog/operations-tech-stack-audit", "/tools/stack-audit"],
  },
  {
    q: "What is a system of record?",
    k: "system of record source of truth sor definition master data which tool owns",
    a: "The system whose version of a piece of data is treated as correct when systems disagree. Decide one per data domain, such as customers, products or employees, and let other tools read from it.",
    l: ["/blog/system-of-record-source-of-truth", "/glossary"],
  },
  {
    q: "How do I choose a system of record?",
    k: "choose decide select source of truth data domain ownership sync rules",
    a: "List your data domains, map where each lives today, then choose one owning system per domain based on who creates the data, data quality and integration support. Define ownership and sync rules, and handle duplicates deliberately.",
    l: ["/blog/system-of-record-source-of-truth"],
  },
  {
    q: "Should we build or buy operations software?",
    k: "build vs buy custom software decide make or buy low code tco",
    a: "Start with strategic fit: build what is core and differentiating, buy what is context. Then compare total cost of ownership, risks, vendor questions and team capacity. Low-code platforms are a real middle path.",
    l: ["/blog/build-vs-buy-operations-software"],
  },
  {
    q: "What is total cost of ownership?",
    k: "tco total cost ownership hidden costs licenses implementation training",
    a: "The full cost of a tool over its life: licenses, implementation, integration, training, administration, support and the cost of leaving. It is almost always higher than the sticker price.",
    l: ["/blog/build-vs-buy-operations-software", "/glossary"],
  },
  {
    q: "What should I ask a software vendor before buying?",
    k: "vendor questions demo evaluation security pricing roadmap references contract exit",
    a: "Ask about security and compliance, data ownership and export, pricing at your expected scale, integration options, support levels, the roadmap and what happens if you leave. Always request references from similar teams.",
    l: ["/blog/build-vs-buy-operations-software", "/blog/vendor-onboarding-sop-procurement"],
  },

  // ---------- Incidents ----------
  {
    q: "What is an incident runbook?",
    k: "runbook incident response playbook outage guide steps procedure template",
    a: "A step-by-step guide for responding to an unplanned disruption: severity levels, roles, the response flow, communication rules and escalation. It is written in advance so people do not improvise under pressure.",
    l: ["/blog/operational-incident-response-runbook", "/glossary"],
  },
  {
    q: "How do I set incident severity levels?",
    k: "severity sev1 sev2 priority levels classify impact urgency",
    a: "Define a small number of levels based on customer impact, data or money at risk and how many people are affected, and say what response each level triggers. Keep definitions concrete so people do not argue during an incident.",
    l: ["/blog/operational-incident-response-runbook"],
  },
  {
    q: "What roles do I need during an incident?",
    k: "roles incident commander communications lead responder scribe owner",
    a: "At minimum a lead who coordinates, people doing the technical or operational fixes and someone handling communication. Naming the roles in advance prevents duplicated effort and silence.",
    l: ["/blog/operational-incident-response-runbook"],
  },
  {
    q: "What is a blameless review?",
    k: "blameless postmortem retrospective review learn root cause after incident",
    a: "A review after an incident that focuses on how the system and process allowed the problem, not on who to blame. It produces fixes people will actually report, because nobody fears being punished for honesty.",
    l: ["/blog/operational-incident-response-runbook"],
  },
  {
    q: "How should we communicate during an incident?",
    k: "communication updates status stakeholders customers cadence message",
    a: "Share what is known, what is not, what you are doing and when the next update will come, on a regular cadence. One channel and one voice for outside updates avoids confusing messages.",
    l: ["/blog/operational-incident-response-runbook"],
  },

  {
    q: "Will AI replace my operations team?",
    k: "replace jobs ai replace ops team headcount layoffs future of work automation people",
    a: "AI automates tasks, not whole roles. It works best on repetitive, rule-based steps, which frees people for exceptions, judgment, vendor and stakeholder work and improving the process. Keep humans accountable for consequential decisions and plan how freed-up time gets used.",
    l: ["/blog/human-in-the-loop-ai-approvals", "/blog/ai-workflow-automation-operations-deep-dive"],
  },
  {
    q: "What are the risks of building software in-house instead of buying?",
    k: "risks build in house custom development maintenance key person cost overrun bus factor",
    a: "Building brings maintenance forever, dependence on the few people who understand it, slower delivery than expected and hidden costs such as security, upgrades and support. It pays off when the capability is core to your advantage. For everything else, compare against buying or a low-code platform.",
    l: ["/blog/build-vs-buy-operations-software"],
  },
  {
    q: "How do I design a ticket taxonomy?",
    k: "taxonomy categories labels tags ticket types design structure classify",
    a: "Keep it small, mutually exclusive and based on how tickets are actually routed, not on how you wish customers described problems. Start from real past tickets, test whether two people would label the same ticket the same way, and revisit it regularly.",
    l: ["/blog/ai-ticket-triage-support-operations"],
  },
  {
    q: "How do I deal with duplicate records in my data?",
    k: "duplicates duplicate records dedupe data quality merge customers matching clean",
    a: "Decide the system of record, define matching rules, merge duplicates in one place and prevent new ones at the point of entry. Assign an owner for data quality so cleanup does not decay.",
    l: ["/blog/system-of-record-source-of-truth"],
  },

  // ---------- General ops ----------
  {
    q: "What is an SLA?",
    k: "sla service level agreement response time commitment resolution",
    a: "A service level agreement is a commitment about how fast a team will respond to or resolve a request, often with consequences if missed. Internal teams use them too, to set expectations between departments.",
    l: ["/glossary"],
  },
  {
    q: "What is a process owner?",
    k: "process owner accountable end to end responsible role",
    a: "The person accountable for how a process performs end to end and for keeping its documentation correct. Every important process needs exactly one.",
    l: ["/glossary", "/blog/sop-governance-ownership-versioning"],
  },
  {
    q: "What is a tech stack?",
    k: "tech stack software tools platforms what is stack",
    a: "The set of software tools and platforms a team or company uses to do its work. Keeping it documented, with owners and costs, is what a tech stack audit is for.",
    l: ["/glossary", "/blog/operations-tech-stack-audit"],
  },
  {
    q: "What is an audit trail?",
    k: "audit trail log record who did what when accountability evidence",
    a: "A record of who did what and when, kept so actions and approvals can be reviewed later. For automated processes it is essential: it shows what the system did and who approved it.",
    l: ["/glossary"],
  },
  {
    q: "What is least privilege?",
    k: "least privilege access minimum permissions security principle",
    a: "Giving a person or system only the access it needs to do its job, and no more. It limits the damage from mistakes and compromised accounts.",
    l: ["/glossary"],
  },
  {
    q: "How do I get a messy process under control?",
    k: "messy chaos fix improve process broken organize operations help start",
    a: "Make it visible first: write down how it really runs and who does each step. Remove steps that add nothing, name an owner, document the result as a short SOP, test it with someone new and only then consider automating the stable parts.",
    l: ["/blog/how-to-write-an-sop-people-follow", "/blog/ai-workflow-automation-operations-deep-dive"],
  },
  {
    q: "Where do I start if I am new to operations?",
    k: "new to operations beginner learn basics role ops manager first steps",
    a: "Learn the core loop: define the process, write it down, assign an owner, measure it and improve it. Start with the glossary for the vocabulary, then read the guides on SOPs, tech stack audits and automation.",
    l: ["/glossary", "/blog/how-to-write-an-sop-people-follow", "/blog/operations-tech-stack-audit"],
  },
];
