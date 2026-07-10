"use client";

import { useState, useTransition } from "react";
import { getConversationDetailAction, type ConvMessage } from "@/app/admin/chatbot-actions";
import { getDict, fmtNum, fmtDate, type AdminLang } from "@/lib/admin/i18n";

export type ConvRow = {
  id: string;
  channel: string;
  status: string;
  started_at: string;
  last_at: string;
};

export function ConversationsViewer({
  lang,
  conversations,
  error,
}: {
  lang: AdminLang;
  conversations: ConvRow[];
  error: string | null;
}) {
  const d = getDict(lang);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, ConvMessage[]>>({});
  const [pending, start] = useTransition();

  function toggle(id: string) {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    if (!detail[id]) {
      start(async () => {
        const res = await getConversationDetailAction(id);
        if (res.ok && res.messages) setDetail((prev) => ({ ...prev, [id]: res.messages! }));
      });
    }
  }

  const channelLabel = (ch: string) =>
    d.conversations.channels[ch as keyof typeof d.conversations.channels] ?? ch;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{d.conversations.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {fmtNum(lang, conversations.length)} {d.conversations.subtitle}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-12 text-center text-muted">
          {d.conversations.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-line/70 bg-navy/40"
            >
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start transition-colors hover:bg-navy/60"
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-full border border-line/60 px-2.5 py-0.5 text-xs text-emerald">
                    {channelLabel(c.channel)}
                  </span>
                  <span className="text-sm text-muted">{fmtDate(lang, c.last_at)}</span>
                </span>
                <span className="text-xs text-muted">{openId === c.id ? "▲" : "▼"}</span>
              </button>

              {openId === c.id && (
                <div className="border-t border-line/60 bg-ink/40 px-5 py-4">
                  {!detail[c.id] ? (
                    <p className="text-sm text-muted">{pending ? d.common.loading : "—"}</p>
                  ) : detail[c.id].length === 0 ? (
                    <p className="text-sm text-muted">{d.conversations.noMessages}</p>
                  ) : (
                    <div className="space-y-3">
                      {detail[c.id].map((m) => (
                        <MessageRow key={m.id} lang={lang} m={m} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageRow({ lang, m }: { lang: AdminLang; m: ConvMessage }) {
  const d = getDict(lang);
  const isUser = m.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className="max-w-[90%]">
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-sm bg-emerald px-4 py-2.5 text-sm leading-6 text-ink"
              : "rounded-2xl rounded-tl-sm border border-line/70 bg-navy/60 px-4 py-2.5 text-sm leading-6 text-foreground"
          }
        >
          <p className="whitespace-pre-wrap">{m.content}</p>
        </div>
        {!isUser && (
          <div className="mt-1 px-1 text-[0.7rem] text-muted">
            {m.model_used && <span dir="ltr">{m.model_used}</span>}
            {m.tokens_out != null && (
              <span>
                {" "}
                · {fmtNum(lang, m.tokens_out)} {d.conversations.tokensOut}
              </span>
            )}
          </div>
        )}
        {/* Opgehaalde RAG-bronnen (debug) */}
        {!isUser && m.retrieved.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="px-1 text-[0.7rem] font-medium text-emerald">
              {d.conversations.retrievedSources}
            </p>
            {m.retrieved.map((r, i) => (
              <div
                key={i}
                className="rounded-xl border border-line/60 bg-ink/50 px-3 py-2 text-xs leading-5 text-muted"
              >
                <b className="text-emerald">{r.title}:</b> {r.content}…
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
