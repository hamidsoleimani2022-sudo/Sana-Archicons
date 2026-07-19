"use client";

import { useRef, useState } from "react";
import { getDict, type AdminLang } from "@/lib/admin/i18n";

type Message = { role: "user" | "assistant"; content: string };

/** Chat met de Agent CRM — streamt het antwoord via /api/admin/agent. */
export function AgentChat({ lang, aiConfigured }: { lang: AdminLang; aiConfigured: boolean }) {
  const d = getDict(lang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  function scrollDown() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || busy) return;

    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    scrollDown();

    try {
      const res = await fetch("/api/admin/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok || !res.body) {
        const info = (await res.json().catch(() => null)) as { error?: string } | null;
        const msg =
          info?.error === "ai_not_configured" ? d.agent.aiNotConfigured : d.common.error;
        setMessages([...next, { role: "assistant", content: msg }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: answer }]);
        scrollDown();
      }
    } catch {
      setMessages([...next, { role: "assistant", content: d.common.error }]);
    } finally {
      setBusy(false);
      scrollDown();
    }
  }

  return (
    <section className="rounded-2xl border border-line/70 bg-navy/40 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{d.agent.chatTitle}</h2>
      <p className="mt-1 text-sm text-muted">{d.agent.chatIntro}</p>

      {!aiConfigured && (
        <p className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {d.agent.aiNotConfigured}
        </p>
      )}

      {messages.length > 0 && (
        <div ref={listRef} className="mt-4 max-h-96 space-y-3 overflow-y-auto pe-1">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                message.role === "user"
                  ? "ms-auto bg-emerald/15 text-foreground"
                  : "me-auto border border-line/60 bg-navy/60 text-foreground/90"
              }`}
            >
              {message.content || (busy ? d.agent.thinking : "")}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={d.agent.chatPlaceholder}
          disabled={!aiConfigured || busy}
          className="w-full rounded-xl border border-line/70 bg-navy/50 px-4 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!aiConfigured || busy || !input.trim()}
          className="shrink-0 rounded-xl bg-emerald px-5 py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "…" : d.agent.send}
        </button>
      </form>
      <p className="mt-3 text-xs text-muted">{d.agent.contextNote}</p>
    </section>
  );
}
