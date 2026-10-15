// Curated Q&A for OpsGrit Bot (part 1: about OpsGrit, SOPs, governance, onboarding, vendors).
// Every answer is written by hand and kept consistent with the published articles.
export interface Faq {
  q: string;
  a: string;
  /** Extra search words people might use. */
  k?: string;
  /** Paths to point readers to. */
  l?: string[];
}

export const FAQ1: Faq[] = [
  // ---------- About OpsGrit ----------
  {
    q: "What is OpsGrit?",
    k: "about site publication who are you what do you do mission",
    a: "OpsGrit is a B2B publication about AI workflows, business automation and operations. We publish practical guides, decision frameworks and SOP templates for the people who keep operations running, plus free tools you can use today. It is a new publication, and we would rather be useful than loud.",
    l: ["/about", "/blog"],
  },
  {
    q: "Who writes OpsGrit articles?",
    k: "author writer byline team research desk who wrote",
    a: "Articles are published under the byline OpsGrit Research Desk. That is a team byline, not one named person. We research and draft with AI assistance, then each article goes through an automated editorial review before it goes live. The full process is public.",
    l: ["/editorial-policy"],
  },
  {
    q: "Are OpsGrit articles written by AI?",
    k: "ai generated chatgpt human written real person trust accurate",
    a: "We use AI tools to help research and draft, and we say so openly. Every article then goes through an automated AI editorial review that scores it and removes weak or unsupported passages. That review is done by AI, not by a person, so errors can slip through. If you spot one, tell us on the contact page and we will correct it.",
    l: ["/editorial-policy"],
  },
  {
    q: "How does OpsGrit check its facts?",
    k: "sources citations accuracy fact check verify references correction error",
    a: "We collect current facts from primary sources such as vendor documentation, standards bodies and regulators, cite them at the end of articles, and have the editor check claims before publishing. If you spot a mistake, tell us and we will correct it and note the change.",
    l: ["/editorial-policy", "/contact"],
  },
  {
    q: "Is OpsGrit free?",
    k: "cost price pay paywall subscription free access signup",
    a: "Yes. Every article and every free tool is free to read and use, with no signup and no email gate. OpsGrit may earn from ads, sponsorships and affiliate links, and we explain exactly how on our disclosure page.",
    l: ["/tools", "/affiliate-disclosure"],
  },
  {
    q: "How do I contact OpsGrit?",
    k: "email reach support feedback report error contact us message",
    a: "Use the contact page. It reaches the same person who edits the articles, so it works for questions, corrections and feedback alike. For sponsorship enquiries, the advertise page has a ready-made email.",
    l: ["/contact", "/advertise"],
  },
  {
    q: "How can I subscribe to the OpsGrit newsletter?",
    k: "newsletter email brief subscribe weekly updates signup join",
    a: "Use the subscribe button in the site header or the sign-up form on the home page. The OpsGrit Brief is our email for operators who asked to hear from us. You can unsubscribe any time from the unsubscribe page, and we never sell your address.",
    l: ["/#newsletter", "/unsubscribe", "/privacy-policy"],
  },
  {
    q: "How can I advertise or sponsor OpsGrit?",
    k: "sponsor sponsorship ads advertising media kit partner brand placement",
    a: "Head to the advertise page. It lists the formats (sponsored article, display placement, newsletter mention), who we work with and who we decline, and how to start. Every paid placement is labeled, and sponsorship never buys editorial coverage.",
    l: ["/advertise", "/affiliate-disclosure"],
  },
  {
    q: "How does OpsGrit make money?",
    k: "revenue business model monetize affiliate ads income earn commission",
    a: "OpsGrit may earn from advertising, labeled sponsorships and, in some cases, affiliate links. None of these can buy a favorable review or change an independent article. Anything paid is labeled, and affiliate links are marked as sponsored.",
    l: ["/affiliate-disclosure", "/editorial-policy"],
  },
  {
    q: "What free tools does OpsGrit have?",
    k: "tools calculators templates worksheet free resources download",
    a: "Three practical tools, all free and no signup: an automation ROI calculator, an SOP builder and a tech stack audit worksheet. They run in your browser, so what you type is not stored on our servers. And you are talking to the fourth one right now: OpsGrit Bot.",
    l: ["/tools", "/tools/roi-calculator", "/tools/sop-builder", "/tools/stack-audit"],
  },
  {
    q: "What topics does OpsGrit cover?",
    k: "categories subjects sections areas topics browse",
    a: "Three areas. AI Automation covers agents, copilots and LLM workflows that remove manual work. Ops Stack covers tool comparisons, integrations and architecture. Process SOPs covers procedures, governance and templates. Each has its own hub page.",
    l: ["/topics/ai-automation", "/topics/ops-stack", "/topics/process-sops"],
  },
  {
    q: "Where should I start reading on OpsGrit?",
    k: "beginner new start here recommend best popular first read overview",
    a: "If you are new to AI in operations, start with the practical deep dive on AI workflow automation. If your pain is messy processes, start with how to write an SOP people actually follow. If you are choosing software, read the Zapier vs Make vs n8n comparison.",
    l: ["/blog/ai-workflow-automation-operations-deep-dive", "/blog/how-to-write-an-sop-people-follow", "/blog/zapier-vs-make-vs-n8n-ops-teams"],
  },
  {
    q: "Does OpsGrit collect my data or track me?",
    k: "privacy cookies tracking analytics gdpr data personal information",
    a: "Our visitor counter is first-party and cookie-free. It uses a one-way hash that cannot be turned back into your IP address. Read the privacy policy for the full detail, including the newsletter and this bot.",
    l: ["/privacy-policy"],
  },
  {
    q: "Is OpsGrit Bot a real person or ChatGPT?",
    k: "are you human ai chatgpt claude real person bot robot automated what are you",
    a: "I am OpsGrit Bot, an automated assistant, not a person. I do not generate answers from imagination. I search OpsGrit's own guides, glossary and a curated Q&A, then give you the most relevant answer with links. That keeps me accurate, and it also means I only know what OpsGrit has published.",
    l: ["/blog"],
  },

  // ---------- SOPs ----------
  {
    q: "What is an SOP?",
    k: "standard operating procedure definition meaning what is sop procedure",
    a: "An SOP, or standard operating procedure, is a documented, repeatable way to perform a task so the result is consistent no matter who does it. A good SOP states the purpose, who it applies to, the steps in order, and what to do when something goes wrong.",
    l: ["/blog/how-to-write-an-sop-people-follow", "/glossary"],
  },
  {
    q: "Why do SOPs matter?",
    k: "benefits importance why need sop consistency training quality knowledge",
    a: "SOPs make quality consistent, speed up training, reduce dependence on one person's memory and make audits and improvements possible. The catch: they only help if people actually use them, so they must be short, current and easy to find.",
    l: ["/blog/how-to-write-an-sop-people-follow"],
  },
  {
    q: "How do I write an SOP people actually follow?",
    k: "write create make sop steps how to draft document procedure",
    a: "Start from how the work really happens, not how you wish it did. Write short numbered steps with one action each, name the owner, include the exceptions, then test it with someone who has never done the task. Publish it where people work and review it on a schedule.",
    l: ["/blog/how-to-write-an-sop-people-follow", "/tools/sop-builder"],
  },
  {
    q: "What should an SOP include?",
    k: "sections structure template format contents parts elements",
    a: "At minimum: purpose, scope, roles and responsibilities, required tools or access, the steps, exceptions and escalation, and a change log with an owner and review date. Our free SOP builder produces exactly this structure from a short form.",
    l: ["/blog/how-to-write-an-sop-people-follow", "/tools/sop-builder"],
  },
  {
    q: "Which processes deserve an SOP first?",
    k: "prioritize which process start first choose what to document",
    a: "Start with processes that are frequent, risky, costly when done wrong, or dependent on one person. Onboarding, payments, incident response and customer-facing handoffs are common first picks. Do not document everything: unused SOPs become clutter.",
    l: ["/blog/how-to-write-an-sop-people-follow"],
  },
  {
    q: "How long should an SOP be?",
    k: "length short long pages size words concise",
    a: "As short as it can be while still being complete. One page for a simple task is common. If a procedure keeps growing, split it into linked SOPs, or move background explanation into a separate reference so the steps stay scannable.",
    l: ["/blog/how-to-write-an-sop-people-follow"],
  },
  {
    q: "How do I test an SOP before publishing it?",
    k: "test validate pilot dry run review walkthrough verify",
    a: "Give the draft to someone who has not done the task and watch them follow it without help. Every question they ask, and every place they hesitate, is a gap to fix. Then run it once for real before rolling it out.",
    l: ["/blog/how-to-write-an-sop-people-follow"],
  },
  {
    q: "Why do people ignore SOPs?",
    k: "adoption ignore not followed compliance outdated too long hidden stick",
    a: "Usually because they are outdated, too long, hard to find or written by someone who never did the work. Fix those four things and adoption follows: keep them short, current, owned by a named person, and stored where the work happens.",
    l: ["/blog/how-to-write-an-sop-people-follow", "/blog/sop-governance-ownership-versioning"],
  },
  {
    q: "What format should SOPs be in: document, checklist or video?",
    k: "format checklist video flowchart doc wiki tool medium",
    a: "Match format to the task. Checklists suit short repeatable routines, numbered documents suit most processes, flowcharts suit decision-heavy work and short videos help with physical or software-heavy steps. Whatever you choose, keep one searchable home for all of them.",
    l: ["/blog/how-to-write-an-sop-people-follow"],
  },
  {
    q: "How often should SOPs be reviewed?",
    k: "review cycle schedule update frequency annual quarterly refresh",
    a: "Set a review date on every SOP and match it to risk: high-risk or fast-changing processes quarterly or twice a year, stable ones yearly. Also review after any incident or process change. The owner is accountable for keeping it correct.",
    l: ["/blog/sop-governance-ownership-versioning"],
  },

  // ---------- Governance ----------
  {
    q: "What is SOP governance?",
    k: "governance management library control document control meaning",
    a: "SOP governance is the set of rules that keeps your procedures trustworthy over time: who owns each document, how versions are numbered, how changes are approved, when reviews happen and how old documents are retired. Without it, a library decays within a year.",
    l: ["/blog/sop-governance-ownership-versioning"],
  },
  {
    q: "Who should own an SOP?",
    k: "ownership owner responsible accountable process owner name",
    a: "A named person, not a team or a department. The process owner is accountable for how the process performs and for keeping its documentation correct. Writers and reviewers can be different people, but there must be one owner.",
    l: ["/blog/sop-governance-ownership-versioning", "/glossary"],
  },
  {
    q: "How should I version SOPs?",
    k: "version control numbering revision history change log v1 v2",
    a: "Use a simple scheme everyone understands, for example major.minor numbers, with a change log at the bottom recording the date, author and what changed. Only one current version should be easy to find; archive the old ones instead of leaving them lying around.",
    l: ["/blog/sop-governance-ownership-versioning"],
  },
  {
    q: "What is a document register?",
    k: "register inventory index list tracking documents catalogue",
    a: "A single list of all your controlled documents with each one's title, type, owner, version, status and next review date. It is the backbone of governance because it shows what exists, who owns it and what is overdue.",
    l: ["/blog/sop-governance-ownership-versioning"],
  },
  {
    q: "How do I retire an old SOP?",
    k: "retire archive delete obsolete deprecate remove outdated",
    a: "Mark it retired in the register, note the replacement or reason, move it out of the main library into an archive and tell the people who used it. Never leave obsolete procedures searchable next to current ones.",
    l: ["/blog/sop-governance-ownership-versioning"],
  },
  {
    q: "How much governance does a small team need?",
    k: "small team startup lightweight minimal right-size overkill",
    a: "Less than you think. A small team can run on a shared folder, a register spreadsheet, named owners and a yearly review. Add structure only when problems appear. Heavy governance on a small team usually means nobody follows it.",
    l: ["/blog/sop-governance-ownership-versioning"],
  },

  // ---------- Onboarding ----------
  {
    q: "What should an employee onboarding process include?",
    k: "new hire onboarding checklist first day week plan induction",
    a: "Pre-boarding before day one, a structured first day, a first-week plan, then goals at 30, 60 and 90 days, with clear owners, access provisioning and check-ins. Our onboarding SOP lays all of this out as a template you can adapt.",
    l: ["/blog/employee-onboarding-sop-30-60-90"],
  },
  {
    q: "What is a 30-60-90 day plan?",
    k: "30 60 90 plan goals new hire ramp milestones first 90 days",
    a: "A framework that sets expectations for a new hire's first three months: learn and absorb in the first 30 days, contribute in the next 30, then own results by day 90. It works because each phase has clear, checkable outcomes.",
    l: ["/blog/employee-onboarding-sop-30-60-90"],
  },
  {
    q: "How do I give new hires the right access safely?",
    k: "access provisioning accounts security permissions least privilege laptop day one",
    a: "Provision by role, using least privilege: only the access needed for the job. Request it before day one so people are not idle, record who approved what, and review access when roles change or people leave.",
    l: ["/blog/employee-onboarding-sop-30-60-90", "/glossary"],
  },
  {
    q: "How do I know if onboarding is working?",
    k: "measure metrics success time to productivity retention feedback survey",
    a: "Track time to first meaningful contribution, completion of checklist items, new-hire feedback at 30, 60 and 90 days, and early retention. If new hires keep asking the same questions, the documentation has a gap.",
    l: ["/blog/employee-onboarding-sop-30-60-90"],
  },

  // ---------- Vendors ----------
  {
    q: "How do I onboard a new vendor?",
    k: "vendor supplier procurement onboarding process due diligence steps",
    a: "Follow a staged process: intake and business case, risk tiering, due diligence, contract and terms, approvals, vendor and payment setup, go-live, ongoing monitoring and eventually offboarding. Higher-risk vendors get deeper checks.",
    l: ["/blog/vendor-onboarding-sop-procurement"],
  },
  {
    q: "What is vendor risk tiering?",
    k: "risk tier classify critical vendor low medium high assessment",
    a: "Sorting vendors by how much harm they could cause if they failed or were breached, based on data access, spend and how critical the service is. The tier then decides how much due diligence and monitoring the vendor gets.",
    l: ["/blog/vendor-onboarding-sop-procurement"],
  },
  {
    q: "How do I prevent vendor payment fraud?",
    k: "fraud bank details change verification callback bec scam payment controls",
    a: "Verify any new or changed bank details through a trusted channel you already have on file, such as a call to a known number, never through the email asking for the change. Separate duties so the person who sets up a vendor does not also approve payment.",
    l: ["/blog/vendor-onboarding-sop-procurement", "/blog/ai-invoice-processing-accounts-payable"],
  },
  {
    q: "What documents should I collect from a new vendor?",
    k: "w-9 tax form insurance certificate contract security questionnaire documents paperwork",
    a: "Typically a tax form (in the US, a W-9 for domestic vendors), proof of insurance where relevant, signed contract, bank details verified separately and, for higher-risk vendors, security documentation. Check requirements with your finance or legal team.",
    l: ["/blog/vendor-onboarding-sop-procurement"],
  },
  {
    q: "How should I review vendors after onboarding?",
    k: "ongoing monitoring review performance renewal offboarding scorecard",
    a: "Set a review cadence by risk tier. Check performance against the contract, spend, security posture and whether you still need the service. Plan offboarding too: revoke access, retrieve data and close payment setup.",
    l: ["/blog/vendor-onboarding-sop-procurement"],
  },
];
