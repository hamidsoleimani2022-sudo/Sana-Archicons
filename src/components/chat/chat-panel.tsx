"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Sparkles, SendHorizonal, FileText } from "lucide-react";
import { useSanaChat, type ChatMsg, type Source } from "@/lib/useSanaChat";
import { renderBold } from "./format";

/** Volledige chatpagina-ervaring in de huisstijl van Sana Archicons. */
export function ChatPanel() {
  const t = useTranslations("Assistant");
  const locale = useLocale();
  const { messages, loading, send } = useSanaChat({
    channel: "web",
    storageKey: "sana_conv",
    locale,
    errorText: t("errorGeneric"),
    offlineText: t("errorNetwork"),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const starters = [t("starter1"), t("starter2"), t("starter3"), t("starter4")];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function submit() {
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="flex min-h-[calc(100dvh-140px)] flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-5 py-8">
          {empty ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald/15 text-emerald">
                <Sparkles size={26} />
              </span>
              <h1 className="mt-5 text-2xl font-bold text-foreground">{t("welcomeTitle")}</h1>
              <p className="mt-2 max-w-md text-sm text-muted">{t("welcomeBody")}</p>
              <div className="mt-8 grid w-full max-w-lg gap-3 sm:grid-cols-2">
                {starters.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="rounded-xl border border-line/70 bg-navy/40 px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-emerald/40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} sourcesLabel={t("sourcesLabel")} />
              ))}
              {loading && <TypingIndicator />}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <div className="mb-2 flex justify-center">
            <Link
              href="/consult"
              className="rounded-full border border-emerald/40 px-4 py-1.5 text-xs font-semibold text-emerald transition hover:bg-emerald hover:text-ink"
            >
              {t("ctaButton")}
            </Link>
          </div>
          <div className="flex items-end gap-2 rounded-2xl border border-line/70 bg-navy/50 p-2 focus-within:border-emerald/50">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={t("inputPlaceholder")}
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-foreground placeholder-muted/50 focus:outline-none"
              aria-label={t("inputPlaceholder")}
            />
            <button
              type="button"
              onClick={submit}
              disabled={loading || !input.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
              aria-label={t("send")}
            >
              <SendHorizonal size={18} />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted/80">{t("disclaimer")}</p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, sourcesLabel }: { msg: ChatMsg; sourcesLabel: string }) {
  const isUser = msg.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={isUser ? "max-w-[85%]" : "w-full max-w-[92%]"}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-emerald px-4 py-3 text-sm leading-6 text-ink"
              : msg.error
                ? "rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
                : "rounded-2xl rounded-tl-sm border border-line/70 bg-navy/50 px-4 py-3 text-sm leading-7 text-foreground"
          }
        >
          <p className="whitespace-pre-wrap">{msg.content ? renderBold(msg.content) : "…"}</p>
        </div>
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <SourcePills sources={msg.sources} label={sourcesLabel} />
        )}
      </div>
    </div>
  );
}

function SourcePills({ sources, label }: { sources: Source[]; label: string }) {
  const seen = new Set<string>();
  const unique = sources.filter((s) => (seen.has(s.title) ? false : seen.add(s.title))).slice(0, 4);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 px-1">
      <span className="text-xs text-muted">{label}</span>
      {unique.map((s, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-full border border-line/60 bg-navy/40 px-2.5 py-0.5 text-xs text-emerald"
          title={`${Math.round(s.similarity * 100)}%`}
        >
          <FileText size={12} />
          {s.title}
        </span>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm border border-line/70 bg-navy/50 px-4 py-3.5">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-emerald/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
