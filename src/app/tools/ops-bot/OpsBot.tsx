"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean; suggestions?: string[] };
type Mode = "ai" | "kb";
type Know = { articles: number; latest: { title: string; slug: string; date: string } | null };

const STARTERS = [
  "Where should a small team start with automation?",
  "Zapier, Make or n8n: how do I choose?",
  "Help me write my first SOP",
  "How do I know if an automation is worth building?",
];

const MAX = 600;

/* ---------- tiny safe renderer: **bold**, [text](url), bullets, numbered lists. No raw HTML is ever injected. ---------- */
function inline(text: string, keyPrefix: string) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(<strong key={`${keyPrefix}-${i}`}>{tok.slice(2, -2)}</strong>);
    } else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)!;
      const label = lm[1];
      const href = lm[2];
      const cls = "font-semibold text-gold-300 underline underline-offset-2 hover:text-gold-200";
      if (href.startsWith("/") && !href.startsWith("//")) {
        parts.push(<Link key={`${keyPrefix}-${i}`} href={href} className={cls}>{label}</Link>);
      } else if (/^https:\/\//i.test(href)) {
        parts.push(<a key={`${keyPrefix}-${i}`} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>);
      } else {
        parts.push(label);
      }
    }
    last = m.index! + tok.length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Rich({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l${blocks.length}`} className={`my-2 space-y-1 pl-5 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-gold-400`}>
        {list.items.map((it, k) => <li key={k}>{inline(it, `li${blocks.length}-${k}`)}</li>)}
      </Tag>,
    );
    list = null;
  };
  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const b = /^\s*[-*•]\s+(.*)$/.exec(line);
    const n = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (b || n) {
      const ordered = Boolean(n);
      if (list && list.ordered !== ordered) flush();
      if (!list) list = { ordered, items: [] };
      list.items.push((b || n)![1]);
      return;
    }
    flush();
    if (!line.trim()) return;
    const h = /^#{1,4}\s+(.*)$/.exec(line);
    if (h) {
      blocks.push(<p key={`h${idx}`} className="mt-3 font-bold text-white">{inline(h[1], `h${idx}`)}</p>);
    } else {
      blocks.push(<p key={`p${idx}`} className="my-1.5">{inline(line, `p${idx}`)}</p>);
    }
  });
  flush();
  return <>{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</>;
}

export default function OpsBot() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mode, setMode] = useState<Mode>("kb");
  const [know, setKnow] = useState<Know | null>(null);

  useEffect(() => {
    fetch("/api/bot").then((r) => r.json()).then((j: { mode?: Mode } & Partial<Know>) => { if (j.mode === "ai" || j.mode === "kb") setMode(j.mode); if (typeof j.articles === "number") setKnow({ articles: j.articles, latest: j.latest ?? null }); }).catch(() => {});
  }, []);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);
  useEffect(() => () => { abortRef.current?.abort(); if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function send(textIn?: string) {
    const text = (textIn ?? input).trim().slice(0, MAX);
    if (!text || busy) return;
    setInput("");
    const history: Msg[] = [...msgs.filter((m) => !m.error), { role: "user", content: text }];
    setMsgs([...msgs, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        let msg = "Something went wrong. Please try again.";
        try { msg = ((await res.json()) as { error?: string }).error || msg; } catch { /* keep default */ }
        setMsgs((cur) => [...cur.slice(0, -1), { role: "assistant", content: msg, error: true }]);
        return;
      }
      if ((res.headers.get("content-type") || "").includes("application/json")) {
        const j = (await res.json()) as { text?: string; suggestions?: string[] };
        const full = j.text || "";
        const sugg = j.suggestions || [];
        // Reveal the answer quickly so long replies are easy to follow.
        await new Promise<void>((resolve) => {
          let n = 0;
          const step = Math.max(6, Math.ceil(full.length / 45));
          timerRef.current = setInterval(() => {
            n = Math.min(full.length, n + step);
            const done = n >= full.length;
            setMsgs((cur) => [...cur.slice(0, -1), { role: "assistant", content: full.slice(0, n), suggestions: done ? sugg : undefined }]);
            if (done) { if (timerRef.current) clearInterval(timerRef.current); resolve(); }
          }, 22);
        });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const snapshot = acc;
        setMsgs((cur) => [...cur.slice(0, -1), { role: "assistant", content: snapshot }]);
      }
      if (!acc.trim()) {
        setMsgs((cur) => [...cur.slice(0, -1), { role: "assistant", content: "I did not get a reply. Please try again.", error: true }]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMsgs((cur) => [...cur.slice(0, -1), { role: "assistant", content: "Connection problem. Please try again.", error: true }]);
      }
    } finally {
      setBusy(false);
    }
  }

  const empty = msgs.length === 0;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-night-950/55 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] backdrop-blur-md">
      <div className="flex items-center gap-3 border-b border-white/10 bg-night-950/70 px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
        <div>
          <p className="text-sm font-bold text-white">OpsGrit Bot</p>
          <p className="text-xs text-slate-400">{mode === "ai" ? "AI assistant for operations, automation and growth" : "Answers from OpsGrit's guides, glossary and Q&A"}</p>
        </div>
        {!empty && (
          <button
            type="button"
            onClick={() => { abortRef.current?.abort(); if (timerRef.current) clearInterval(timerRef.current); setMsgs([]); setBusy(false); }}
            className="ml-auto rounded-lg border border-night-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-gold-400/60 hover:text-gold-300"
          >
            New chat
          </button>
        )}
      </div>

      <div ref={boxRef} className="max-h-[60vh] min-h-[340px] space-y-4 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        {empty && (
          <div className="py-4">
            <p className="text-lg font-bold text-white">Ready to run operations with grit?</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              Ask me about automation, SOPs, tools, AI at work or how to get a messy process under control. I will give you
              a clear next step and point you to the right OpsGrit guide.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-left text-sm font-medium text-slate-200 transition hover:border-gold-400 hover:bg-white/10 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-br from-gold-300 to-gold-500 px-4 py-2.5 text-sm font-medium leading-relaxed text-ink-900 shadow-[0_6px_20px_-8px_rgba(212,175,79,0.6)]"
                  : `max-w-[92%] rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm leading-relaxed ${m.error ? "border-red-400/40 bg-red-950/80 text-red-200" : "border-white/10 bg-[#0e1527]/90 text-slate-100"}`
              }
            >
              {m.role === "assistant" ? (
                m.content ? <Rich text={m.content} /> : <span className="text-slate-400">Thinking<span className="animate-pulse">...</span></span>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {!busy && msgs.length > 0 && (msgs[msgs.length - 1].suggestions?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {msgs[msgs.length - 1].suggestions!.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => send(x)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-left text-xs font-medium text-slate-200 transition hover:border-gold-400 hover:bg-white/10 hover:text-white"
              >
                {x}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="border-t border-white/10 bg-night-950/70 p-3 sm:p-4"
        onSubmit={(e) => { e.preventDefault(); void send(); }}
      >
        <div className="flex items-end gap-2">
          <label htmlFor="bot-input" className="sr-only">Your question</label>
          <textarea
            id="bot-input"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            rows={2}
            placeholder="Ask about automation, SOPs, tools..."
            className="min-h-[3rem] flex-1 resize-none rounded-xl border border-white/15 bg-[#0b1220]/90 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          />
          <button type="submit" disabled={busy || !input.trim()} className="btn-primary !px-5 !py-3 shrink-0">
            {busy ? "..." : "Send"}
          </button>
        </div>
        <p className="mt-2 flex flex-wrap justify-between gap-x-4 text-xs text-slate-500">
          <span>{mode === "ai" ? "AI assistant: it can make mistakes, so check important details. Do not paste confidential data." : "Automated assistant, not a person. It answers only from OpsGrit's published guides. Check important details."}</span>
          <span>{input.length}/{MAX}</span>
        </p>
      </form>
      <div className="border-t border-white/10 bg-black/25 px-5 py-4 text-xs leading-relaxed text-slate-400 sm:px-6">
        {know && (
          <p className="mb-3 rounded-lg border border-gold-400/30 bg-gold-400/10 px-3 py-2 text-slate-200">
            <strong>Always up to date:</strong> I read every published OpsGrit article ({know.articles} right now).
            {know.latest && (
              <> Newest: <Link className="font-semibold text-gold-300 underline" href={`/blog/${know.latest.slug}`}>{know.latest.title.split(":")[0]}</Link>.</>
            )}{" "}
            New articles are added automatically a minute or two after they are published.
          </p>
        )}
        <p className="font-semibold text-slate-200">Good to know</p>
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {mode === "ai" ? (
            <>
              <li>This is an <strong>AI assistant</strong>, not a person. It can be wrong, so verify anything important, especially prices and legal or tax points.</li>
              <li>Your messages are sent to an AI service to write the reply. OpsGrit does not save your chats. Please do not paste passwords, customer data or other confidential information.</li>
              <li>There are daily limits so the tool stays free for everyone.</li>
            </>
          ) : (
            <>
              <li>This is an <strong>automated assistant, not a person and not a generative AI</strong>. It searches OpsGrit&apos;s published guides, glossary and a hand-written Q&amp;A, and links to the source. It only knows what OpsGrit has published.</li>
              <li>Your messages stay on OpsGrit&apos;s own servers and are not saved. Please do not paste passwords, customer data or other confidential information.</li>
            </>
          )}
          <li>It recommends OpsGrit articles first. OpsGrit may earn from ads, sponsors or affiliate links, as explained in our <Link className="text-gold-300 underline" href="/affiliate-disclosure">disclosure</Link>.</li>
        </ul>
      </div>
    </div>
  );
}
