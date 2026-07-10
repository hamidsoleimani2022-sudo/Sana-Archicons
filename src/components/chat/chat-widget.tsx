"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MessageCircle, X, SendHorizonal, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { useSanaChat, type ChatMsg } from "@/lib/useSanaChat";
import { renderBold } from "./format";

/**
 * Zwevende chatwidget rechtsonder op elke pagina. Zelfde brein als de
 * chatpagina (/assistant), kanaal "widget".
 */
export function ChatWidget() {
  const t = useTranslations("ChatWidget");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const { messages, loading, conversationId, send } = useSanaChat({
    channel: "widget",
    storageKey: "sana_widget_conv",
    locale,
    errorText: t("errorGeneric"),
    offlineText: t("errorNetwork"),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading, open]);

  function submit() {
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
  }

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant" && !m.error)?.id;
  const empty = messages.length === 0;

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("launcher")}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-ink shadow-lg shadow-emerald/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Paneel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex h-[560px] max-h-[calc(100dvh-120px)] w-[370px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-line/70 bg-ink shadow-2xl shadow-black/50"
          role="dialog"
          aria-label={t("title")}
        >
          {/* Header */}
          <header className="flex items-center gap-2.5 border-b border-line/60 bg-navy px-4 py-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald/15 text-emerald">
              <Sparkles size={16} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">{t("title")}</p>
              <p className="text-[0.7rem] text-muted">{t("subtitle")}</p>
            </div>
          </header>

          {/* Berichten */}
          <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
            <Bubble role="assistant">{t("welcome")}</Bubble>
            {empty && <p className="px-1 pt-1 text-xs text-muted">{t("hint")}</p>}

            {messages.map((msg) => (
              <div key={msg.id}>
                <Bubble role={msg.role} error={msg.error}>
                  {msg.content || "…"}
                </Bubble>
                {msg.role === "assistant" && !msg.error && msg.id === lastAssistantId && msg.content && (
                  <Feedback
                    conversationId={conversationId}
                    question={t("feedbackQ")}
                    thanks={t("feedbackThanks")}
                    helpful={t("helpful")}
                    notHelpful={t("notHelpful")}
                  />
                )}
              </div>
            ))}
            {loading && <TypingDots />}
          </div>

          {/* CTA + invoer */}
          <div className="border-t border-line/60 bg-navy/60 px-3 pb-3 pt-2">
            <Link
              href="/consult"
              onClick={() => setOpen(false)}
              className="mb-2 block rounded-full bg-emerald py-2 text-center text-xs font-semibold text-ink transition-opacity hover:opacity-90"
            >
              {t("cta")}
            </Link>
            <div className="flex items-end gap-2 rounded-xl border border-line/70 bg-ink/60 p-1.5 focus-within:border-emerald/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={1}
                placeholder={t("inputPlaceholder")}
                className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-6 text-foreground placeholder-muted/50 focus:outline-none"
                aria-label={t("inputPlaceholder")}
              />
              <button
                type="button"
                onClick={submit}
                disabled={loading || !input.trim()}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald text-ink transition-opacity disabled:opacity-40"
                aria-label={t("send")}
              >
                <SendHorizonal size={16} />
              </button>
            </div>
            <p className="mt-1.5 text-center text-[0.65rem] text-muted/70">{t("disclaimer")}</p>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({
  role,
  error,
  children,
}: {
  role: ChatMsg["role"];
  error?: boolean;
  children: string;
}) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald px-3.5 py-2.5 text-sm leading-6 text-ink">
          <p className="whitespace-pre-wrap">{children}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div
        className={
          error
            ? "max-w-[88%] rounded-2xl border border-red-400/40 bg-red-500/10 px-3.5 py-2.5 text-sm leading-6 text-red-300"
            : "max-w-[88%] rounded-2xl rounded-tl-sm border border-line/70 bg-navy/60 px-3.5 py-2.5 text-sm leading-6 text-foreground"
        }
      >
        <p className="whitespace-pre-wrap">{renderBold(children)}</p>
      </div>
    </div>
  );
}

function Feedback({
  conversationId,
  question,
  thanks,
  helpful,
  notHelpful,
}: {
  conversationId: string | null;
  question: string;
  thanks: string;
  helpful: string;
  notHelpful: string;
}) {
  const [sent, setSent] = useState<"up" | "down" | null>(null);
  async function rate(rating: "up" | "down") {
    if (sent || !conversationId) return;
    setSent(rating);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, rating }),
      });
    } catch {
      /* stil */
    }
  }
  if (sent) {
    return <p className="mt-1 px-1 text-[0.7rem] text-muted">{thanks}</p>;
  }
  return (
    <div className="mt-1 flex items-center gap-1.5 px-1">
      <span className="text-[0.7rem] text-muted">{question}</span>
      <button
        type="button"
        onClick={() => rate("up")}
        className="rounded p-1 text-muted transition-colors hover:text-emerald"
        aria-label={helpful}
      >
        <ThumbsUp size={13} />
      </button>
      <button
        type="button"
        onClick={() => rate("down")}
        className="rounded p-1 text-muted transition-colors hover:text-emerald"
        aria-label={notHelpful}
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-sm border border-line/70 bg-navy/60 px-3.5 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
