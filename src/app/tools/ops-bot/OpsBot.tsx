"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

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
      const cls = "font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-600";
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
      <Tag key={`l${blocks.length}`} className={`my-2 space-y-1 pl-5 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-gold-600`}>
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
      blocks.push(<p key={`h${idx}`} className="mt-3 font-bold text-ink-900">{inline(h[1], `h${idx}`)}</p>);
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

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);
  useEffect(() => () => abortRef.current?.abort(), []);

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
    <div className="card mt-8 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-cream-300 bg-night-950 px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
        <div>
          <p className="text-sm font-bold text-white">OpsGrit Bot</p>
          <p className="text-xs text-slate-400">AI assistant for operations, automation and growth</p>
        </div>
        {!empty && (
          <button
            type="button"
            onClick={() => { abortRef.current?.abort(); setMsgs([]); setBusy(false); }}
            className="ml-auto rounded-lg border border-night-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-gold-400/60 hover:text-gold-300"
          >
            New chat
          </button>
        )}
      </div>

      <div ref={boxRef} className="max-h-[60vh] min-h-[340px] space-y-4 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
        {empty && (
          <div className="py-4">
            <p className="text-lg font-bold text-ink-900">Ready to run operations with grit?</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">
              Ask me about automation, SOPs, tools, AI at work or how to get a messy process under control. I will give you
              a clear next step and point you to the right OpsGrit guide.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-cream-400 bg-white/70 px-4 py-2 text-left text-sm font-medium text-ink-700 transition hover:border-gold-500 hover:text-ink-900"
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
                  ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-night-950 px-4 py-2.5 text-sm leading-relaxed text-white"
                  : `max-w-[92%] rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm leading-relaxed ${m.error ? "border-red-200 bg-red-50 text-red-800" : "border-cream-300 bg-white text-ink-700"}`
              }
            >
              {m.role === "assistant" ? (
                m.content ? <Rich text={m.content} /> : <span className="text-ink-500">Thinking<span className="animate-pulse">...</span></span>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        className="border-t border-cream-300 bg-cream-50/60 p-3 sm:p-4"
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
            className="min-h-[3rem] flex-1 resize-none rounded-xl border border-cream-400 bg-white px-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30"
          />
          <button type="submit" disabled={busy || !input.trim()} className="btn-primary !px-5 !py-3 shrink-0">
            {busy ? "..." : "Send"}
          </button>
        </div>
        <p className="mt-2 flex flex-wrap justify-between gap-x-4 text-xs text-ink-500">
          <span>AI assistant: it can make mistakes, so check important details. Do not paste confidential data.</span>
          <span>{input.length}/{MAX}</span>
        </p>
      </form>
    </div>
  );
}
