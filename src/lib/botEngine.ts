// Server-only. OpsGrit Bot's knowledge-base engine: no AI service, no API cost.
// It searches the published articles, the glossary and a hand-written Q&A with BM25 ranking,
// then composes an answer from the best matches and links to the source.
import GithubSlugger from "github-slugger";
import { getAllPosts } from "@/lib/posts";
import { TERMS } from "@/lib/glossary";
import { FAQ1 } from "@/lib/botFaq1";
import { FAQ2 } from "@/lib/botFaq2";
import { SITE } from "@/lib/site";

export interface BotReply {
  text: string;
  suggestions: string[];
}

/* ------------------------------ text helpers ------------------------------ */

const STOP = new Set(
  ("a an the and or but if then else of to in on at by for with from as is are was were be been being am do does did done have has had " +
    "i me my mine we our you your yours he she it its they them their this that these those there here what which who whom whose when where why how " +
    "can could should would will shall may might must not no yes so than too very just also about into over under up down out off again more most some any " +
    "please tell me explain give show want need like get let us know thing things way ways really much many one two").split(" "),
);

function stem(raw: string): string {
  let w = raw;
  if (w.length <= 3) return w;
  w = w.replace(/ies$/, "y");
  if (/sses$/.test(w)) w = w.slice(0, -2);
  else if (/[^s]s$/.test(w) && !/(us|is)$/.test(w)) w = w.slice(0, -1);
  w = w.replace(/(ation|ating|ated|ates)$/, "at").replace(/ate$/, "at");
  if (w.length > 5) w = w.replace(/(ing|ed|ly)$/, "");
  if (w.length > 4) w = w.replace(/e$/, "");
  return w;
}

// Words that mean the same thing for this audience are mapped to one token.
const CANON: Record<string, string> = {
  procedur: "sop", sops: "sop", playbook: "runbook",
  pricing: "cost", pric: "cost", price: "cost", cheap: "cost", expens: "cost", fee: "cost", billing: "cost", bill: "cost",
  softwar: "tool", platform: "tool", app: "tool", application: "tool",
  suppli: "vendor", supplier: "vendor", procurement: "vendor",
  helpdesk: "ticket", "support": "ticket",
  agentic: "agent", bot: "agent",
  roi: "roi", return: "roi", payback: "roi", saving: "roi",
  outage: "incident", downtime: "incident", postmortem: "incident",
  zap: "zapier",
};

function tokens(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/)) {
    if (!raw || STOP.has(raw)) continue;
    if (raw.length < 2 && !/\d/.test(raw)) continue;
    const s = stem(raw);
    out.push(CANON[s] ?? CANON[raw] ?? s);
  }
  return out;
}

function stripMd(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`>#]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Turn a markdown section body into clean prose sentences (tables, code and images removed). */
function toSentences(body: string): string[] {
  const lines = body.split("\n");
  const parts: string[] = [];
  let inFence = false;
  for (const l of lines) {
    const t = l.trim();
    if (t.startsWith("```")) { inFence = !inFence; continue; }
    if (inFence || !t) continue;
    if (t.startsWith("|") || t.startsWith("<") || t.startsWith("![") || t.startsWith("###")) continue;
    if (/^(sources?:|an illustration|illustration)/i.test(t)) continue;
    let line = stripMd(t.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""));
    if (!line) continue;
    if (!/[.!?:]$/.test(line)) line += ".";
    parts.push(line);
  }
  return parts
    .join(" ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 30 && s.length <= 340);
}

/* --------------------------------- corpus --------------------------------- */

type Kind = "faq" | "section" | "term";
interface Doc {
  kind: Kind;
  title: string; // shown label (article title, question or term)
  url: string;
  answer?: string; // faq / term
  links?: string[];
  sentences?: string[]; // sections
  tf: Map<string, number>;
  len: number;
  boost: number;
}

interface Index {
  docs: Doc[];
  df: Map<string, number>;
  avgLen: number;
  maxIdf: number;
  faqQs: string[];
  postTitle: Map<string, string>;
}

let INDEX: Index | null = null;

function addTokens(tf: Map<string, number>, text: string, weight: number) {
  for (const t of tokens(text)) tf.set(t, (tf.get(t) || 0) + weight);
}

function build(): Index {
  const docs: Doc[] = [];
  const postTitle = new Map<string, string>();

  for (const f of [...FAQ1, ...FAQ2]) {
    const tf = new Map<string, number>();
    addTokens(tf, f.q, 4);
    addTokens(tf, f.k || "", 2);
    addTokens(tf, f.a, 1);
    docs.push({ kind: "faq", title: f.q, url: f.l?.[0] || "/blog", answer: f.a, links: f.l || [], tf, len: 0, boost: 1.35 });
  }

  for (const t of TERMS) {
    const tf = new Map<string, number>();
    addTokens(tf, t.term, 5);
    addTokens(tf, t.def, 1);
    docs.push({ kind: "term", title: t.term, url: t.read?.href || "/glossary", answer: t.def, links: t.read ? [t.read.href, "/glossary"] : ["/glossary"], tf, len: 0, boost: 1.1 });
  }

  for (const p of getAllPosts()) {
    postTitle.set(p.slug, p.title);
    const slugger = new GithubSlugger();
    const parts = p.content.split(/^##\s+(.*)$/m); // [intro, h1, body1, h2, body2...]
    const sections: { h: string; body: string }[] = [];
    if (parts[0].trim()) sections.push({ h: p.title, body: parts[0] });
    for (let i = 1; i < parts.length; i += 2) sections.push({ h: parts[i].trim(), body: parts[i + 1] || "" });
    for (const s of sections) {
      const id = slugger.slug(s.h);
      if (/^(sources and further reading|a note on sources)$/i.test(s.h)) continue;
      const sentences = toSentences(s.body);
      if (sentences.length === 0) continue;
      // Split long sections into ~8-sentence windows so ranking stays sharp.
      for (let i = 0; i < sentences.length; i += 8) {
        const chunk = sentences.slice(i, i + 8);
        const tf = new Map<string, number>();
        addTokens(tf, s.h, 3);
        addTokens(tf, p.title, 1);
        addTokens(tf, chunk.join(" "), 1);
        docs.push({ kind: "section", title: `${p.title}|${s.h}`, url: `/blog/${p.slug}#${id}`, sentences: chunk, tf, len: 0, boost: 1 });
      }
    }
  }

  const df = new Map<string, number>();
  let total = 0;
  for (const d of docs) {
    let l = 0;
    for (const [t, c] of d.tf) { df.set(t, (df.get(t) || 0) + 1); l += c; }
    d.len = l;
    total += l;
  }
  const N = docs.length;
  let maxIdf = 0;
  for (const c of df.values()) maxIdf = Math.max(maxIdf, Math.log(1 + (N - c + 0.5) / (c + 0.5)));
  return { docs, df, avgLen: total / N, maxIdf, faqQs: [...FAQ1, ...FAQ2].map((f) => f.q), postTitle };
}

function idx(): Index {
  return (INDEX ??= build());
}

function idf(ix: Index, t: string): number {
  const c = ix.df.get(t);
  if (!c) return ix.maxIdf; // unknown word: treated as maximally informative, so off-topic questions score low coverage
  return Math.log(1 + (ix.docs.length - c + 0.5) / (c + 0.5));
}

interface Hit { doc: Doc; score: number; coverage: number }

function search(ix: Index, qTokens: string[]): Hit[] {
  const uniq = [...new Set(qTokens)];
  if (uniq.length === 0) return [];
  const totalIdf = uniq.reduce((a, t) => a + idf(ix, t), 0);
  const k1 = 1.4, b = 0.75;
  const hits: Hit[] = [];
  for (const d of ix.docs) {
    let score = 0, matched = 0;
    for (const t of uniq) {
      const f = d.tf.get(t);
      if (!f) continue;
      const w = idf(ix, t);
      matched += w;
      score += w * ((f * (k1 + 1)) / (f + k1 * (1 - b + b * (d.len / ix.avgLen))));
    }
    if (score > 0) {
      let bonus = 1;
      if (d.kind !== "section") {
        const tt = new Set(tokens(d.title));
        let inter = 0;
        for (const t of uniq) if (tt.has(t)) inter++;
        bonus += (2 * inter) / (new Set([...uniq, ...tt]).size || 1); // exact question match counts most
      }
      hits.push({ doc: d, score: score * d.boost * bonus, coverage: matched / totalIdf });
    }
  }
  hits.sort((a, c) => c.score * (0.5 + c.coverage) - a.score * (0.5 + a.coverage));
  return hits;
}

/* --------------------------------- intents -------------------------------- */

const ENERGY = ["Great question!", "Love this one.", "Good one, this is where teams win.", "Let's get into it.", "Smart thing to ask."];
function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

const DEFAULT_SUGGESTIONS = [
  "Where should a small team start with automation?",
  "Zapier, Make or n8n: how do I choose?",
  "How do I write an SOP people actually follow?",
  "What is the difference between an AI agent and a workflow?",
];

function linkMd(path: string): string {
  const ix = idx();
  const slug = /^\/blog\/([^#/]+)/.exec(path)?.[1];
  const title = slug ? ix.postTitle.get(slug) : undefined;
  if (title) return `[${title.split(":")[0].trim()}](${path})`;
  const names: Record<string, string> = {
    "/tools": "Free tools", "/tools/roi-calculator": "Automation ROI calculator", "/tools/sop-builder": "SOP builder",
    "/tools/stack-audit": "Tech stack audit worksheet", "/glossary": "Glossary", "/editorial-policy": "Editorial policy",
    "/advertise": "Advertise with OpsGrit", "/contact": "Contact", "/affiliate-disclosure": "Affiliate disclosure",
    "/privacy-policy": "Privacy policy", "/about": "About OpsGrit", "/blog": "All articles", "/unsubscribe": "Unsubscribe",
    "/#newsletter": "Subscribe to the OpsGrit Brief",
    "/topics/ai-automation": "AI Automation hub", "/topics/ops-stack": "Ops Stack hub", "/topics/process-sops": "Process SOPs hub",
  };
  return `[${names[path] || path}](${path})`;
}

function related(ix: Index, used: Set<string>, q: string, n = 3): string[] {
  const qt = new Set(tokens(q));
  const same = (title: string) => {
    const tt = new Set(tokens(title));
    let inter = 0;
    for (const t of qt) if (tt.has(t)) inter++;
    return inter / (new Set([...qt, ...tt]).size || 1) >= 0.7; // the question they just asked
  };
  const hits = search(ix, tokens(q)).filter((h) => h.doc.kind === "faq" && !used.has(h.doc.title) && !same(h.doc.title));
  const out = hits.slice(0, n).map((h) => h.doc.title);
  for (const s of DEFAULT_SUGGESTIONS) if (out.length < n && !used.has(s) && !out.includes(s)) out.push(s);
  return out.slice(0, n);
}

function intent(raw: string): BotReply | null {
  const t = raw.toLowerCase().trim().replace(/[!?.]+$/g, "");
  const words = t.split(/\s+/).length;
  if (words <= 5 && /^(hi|hello|hey|heya|yo|sup|salam|assalam\w*|namaste|hola|good (morning|afternoon|evening))\b/.test(t)) {
    return {
      text: "Hey, welcome to OpsGrit! I am OpsGrit Bot, here to help you run operations with grit, not guesswork.\n\nAsk me about **automation, SOPs, tools or AI at work**, and I will give you a clear answer and point you to the right guide. What are you working on?",
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 3),
    };
  }
  if (words <= 6 && /\b(thanks|thank you|thx|cheers|appreciate)\b/.test(t)) {
    return { text: "Anytime! Keep building systems that run without heroics. Got another question?", suggestions: DEFAULT_SUGGESTIONS.slice(0, 3) };
  }
  if (words <= 4 && /^(bye|goodbye|see you|cya|later)\b/.test(t)) {
    return { text: "Go build something solid. Come back whenever you need a hand.", suggestions: [] };
  }
  if (/\b(what can you do|what do you do|how can you help|what are you for|help me)\b/.test(t) && words <= 8) {
    return {
      text: "I answer questions about **operations, automation and AI at work** using OpsGrit's own guides, glossary and a curated Q&A. I can explain a concept, help you choose between approaches, and point you to the exact section to read.\n\nTry one of these:",
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
    };
  }
  if (/\b(are you|r u)\b.*\b(ai|human|real|robot|bot|chatgpt|claude|gpt|person|alive)\b/.test(t) || /\bwho (are|made|built) you\b/.test(t) || /\bwhat are you\b/.test(t)) {
    return {
      text: "I am **OpsGrit Bot**, an automated assistant, not a person. I do not make answers up: I search OpsGrit's articles, glossary and a hand-written Q&A, then show you the most relevant answer with links to the source. That keeps me accurate, and it also means I only know what OpsGrit has published.",
      suggestions: ["What is OpsGrit?", "How does OpsGrit check its facts?", ...DEFAULT_SUGGESTIONS.slice(0, 1)],
    };
  }
  if (/\b(write|generate|create|make|build|code)\b.*\b(code|python|javascript|java|html|essay|poem|story|song|script|program|app|website|homework)\b/.test(t) || /\b(joke|weather|recipe|horoscope|lottery|bitcoin|crypto)\b/.test(t)) {
    return {
      text: "That one is outside what I do here. I stick to **operations, automation and AI at work**, using OpsGrit's own guides. If there is an operations angle, for example automating a process or choosing a tool, ask me that and I will point you to the right guide.",
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 3),
    };
  }
  if (/\b(contact|email address|reach (you|opsgrit)|report (an )?error|correction)\b/.test(t) && words <= 10) {
    return {
      text: `You can reach the OpsGrit editor through the ${linkMd("/contact")} page, which is also where to report a mistake. For sponsorship, see ${linkMd("/advertise")}.`,
      suggestions: ["How does OpsGrit check its facts?", "How can I advertise or sponsor OpsGrit?"],
    };
  }
  return null;
}

/* ---------------------------------- reply --------------------------------- */

export function reply(history: { role: "user" | "assistant"; content: string }[]): BotReply {
  const ix = idx();
  const last = history[history.length - 1]?.content ?? "";
  const quick = intent(last);
  if (quick) return quick;

  let qt = tokens(last);
  // A follow-up that starts with a connective ("and pricing?", "what about n8n?") borrows the topic of the previous question.
  // Short standalone questions ("what is a webhook") are answered on their own.
  if (qt.length <= 3 && /^\s*(and|also|then|but|so|what about|how about|what if|why|how much)\b/i.test(last)) {
    const prev = [...history].reverse().filter((m, i) => i > 0 && m.role === "user")[0]?.content;
    if (prev) qt = [...tokens(prev), ...qt];
  }

  const hits = search(ix, qt);
  const top = hits[0];
  const used = new Set<string>();

  if (!top || top.coverage < 0.5) {
    return {
      text: `Hmm, I could not find that in OpsGrit's guides, and I would rather say so than guess. I only answer from what OpsGrit has published, so very specific or off-topic questions may be outside what I know.\n\nTry rephrasing, browse ${linkMd("/blog")}, or pick one of these. If you think OpsGrit should cover it, tell us on the ${linkMd("/contact")} page.`,
      suggestions: DEFAULT_SUGGESTIONS.slice(0, 4),
    };
  }

  const opener = pick(ENERGY, last);

  // 1) A curated Q&A or glossary term that clearly matches.
  if ((top.doc.kind === "faq" || top.doc.kind === "term") && top.coverage >= 0.6) {
    used.add(top.doc.title);
    const links = (top.doc.links || []).slice(0, 3);
    const body =
      top.doc.kind === "term"
        ? `**${top.doc.title}.** ${top.doc.answer}`
        : (top.doc.answer as string);
    const more = links.map(linkMd);
    return {
      text: `${opener} ${body}${more.length ? `\n\n**Go deeper:** ${more.join(" · ")}` : ""}`,
      suggestions: related(ix, used, last),
    };
  }

  // 2) Compose from the best article sections.
  const uniq = [...new Set(qt)];
  const seenPosts = new Set<string>();
  const picks: Hit[] = [];
  for (const h of hits) {
    if (h.doc.kind !== "section" || h.coverage < 0.65) continue;
    const slug = h.doc.url.split("#")[0];
    if (seenPosts.has(slug)) continue;
    seenPosts.add(slug);
    picks.push(h);
    if (picks.length === 2) break;
  }
  if (picks.length === 0 && top.doc.answer) {
    used.add(top.doc.title);
    return { text: `${opener} ${top.doc.answer}\n\n**Go deeper:** ${(top.doc.links || []).slice(0, 3).map(linkMd).join(" · ")}`, suggestions: related(ix, used, last) };
  }

  const blocks = picks.map((h) => {
    const [postTitle, heading] = h.doc.title.split("|");
    const scored = (h.doc.sentences || []).map((s, i) => {
      const st = new Set(tokens(s));
      let sc = 0;
      for (const t of uniq) if (st.has(t)) sc += idf(ix, t);
      return { s, i, sc };
    });
    scored.sort((a, b) => b.sc - a.sc);
    const best = scored.slice(0, 2).sort((a, b) => a.i - b.i).map((x) => x.s).join(" ");
    return `**${heading}** (from ${linkMd(h.doc.url).replace(/^\[[^\]]*\]/, `[${postTitle.split(":")[0].trim()}]`)})\n${best}`;
  });

  return {
    text: `${opener} Here is what OpsGrit's guides say:\n\n${blocks.join("\n\n")}\n\nWant the full picture? Open the guide and jump to that section.`,
    suggestions: related(ix, used, last),
  };
}

export function botStats(): { qa: number; terms: number; sections: number; words: number } {
  const ix = idx();
  const posts = getAllPosts();
  return {
    qa: ix.docs.filter((d) => d.kind === "faq").length,
    terms: ix.docs.filter((d) => d.kind === "term").length,
    sections: ix.docs.filter((d) => d.kind === "section").length,
    words: posts.reduce((n, p) => n + p.content.split(/\s+/).length, 0),
  };
}

/** What the bot currently knows, so the page can show that it is up to date. */
export function knowledgeSummary() {
  const posts = [...getAllPosts()].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = posts[0];
  return {
    articles: posts.length,
    latest: latest ? { title: latest.title, slug: latest.slug, date: latest.date } : null,
  };
}

export const CONTACT_EMAIL = SITE.email;
