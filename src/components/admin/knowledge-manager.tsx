"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ingestTextAction,
  ingestUrlAction,
  ingestFilesAction,
  deleteDocAction,
  reindexDocAction,
  testSearchAction,
} from "@/app/admin/chatbot-actions";
import type { RetrievedChunk } from "@/lib/rag/retrieve";
import { getDict, fmtNum, type AdminLang } from "@/lib/admin/i18n";

export type DocRow = {
  id: string;
  title: string;
  source_type: string;
  source_url: string | null;
  status: string;
  chunk_count: number;
  error: string | null;
  tags: string[] | null;
  created_at: string;
};

const FILE_ACCEPT = ".md,.markdown,.txt,.csv,.json,.yaml,.yml,.html,.htm,.pdf";

const STATUS_CLS: Record<string, string> = {
  pending: "bg-line/40 text-muted",
  processing: "bg-amber-500/15 text-amber-300",
  ready: "bg-green-500/15 text-green-300",
  error: "bg-red-500/15 text-red-300",
};

type Tab = "text" | "url" | "file";

const inputCls =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50";
const labelCls = "mb-1.5 block text-xs font-medium text-muted";
const submitCls =
  "inline-flex items-center justify-center rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50";

export function KnowledgeManager({
  lang,
  docs,
  error,
}: {
  lang: AdminLang;
  docs: DocRow[];
  error: string | null;
}) {
  const d = getDict(lang);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("text");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function run(p: Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const res = await p;
      setMsg({ ok: res.ok, text: res.message ?? (res.ok ? d.common.done : d.common.error) });
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{d.knowledge.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {fmtNum(lang, docs.length)} {d.knowledge.subtitle}
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Bron toevoegen */}
      <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">{d.knowledge.addTitle}</h2>
        <div className="mb-5 flex gap-1 border-b border-line/60">
          {(
            [
              ["text", d.knowledge.tabText],
              ["url", d.knowledge.tabUrl],
              ["file", d.knowledge.tabFile],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm transition-colors ${
                tab === k
                  ? "border-emerald font-medium text-emerald"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {msg && (
          <div
            className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
              msg.ok ? "bg-green-500/10 text-green-300" : "bg-red-500/10 text-red-300"
            }`}
          >
            {msg.text}
          </div>
        )}

        {tab === "text" && (
          <TextForm lang={lang} pending={pending} onSubmit={(t, c, tags) => run(ingestTextAction(t, c, tags))} />
        )}
        {tab === "url" && (
          <UrlForm lang={lang} pending={pending} onSubmit={(u, t, tags) => run(ingestUrlAction(u, t, tags))} />
        )}
        {tab === "file" && (
          <FilesForm lang={lang} pending={pending} onSubmit={(fd) => run(ingestFilesAction(fd))} />
        )}
      </section>

      {/* Testzoekopdracht */}
      <TestSearch lang={lang} />

      {/* Documentenlijst */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">{d.knowledge.docs}</h2>
        {docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-12 text-center text-muted">
            {d.knowledge.docsEmpty}
          </div>
        ) : (
          <div className="space-y-3">
            {docs.map((doc) => {
              const cls = STATUS_CLS[doc.status] ?? STATUS_CLS.pending;
              const statusLabel =
                d.knowledge.statuses[doc.status as keyof typeof d.knowledge.statuses] ?? doc.status;
              return (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-2xl border border-line/70 bg-navy/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{doc.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{statusLabel}</span>
                      <span className="text-xs text-muted">
                        {doc.source_type} · {fmtNum(lang, doc.chunk_count)} {d.knowledge.chunks}
                      </span>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {doc.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-line/60 px-2 py-0.5 text-[0.7rem] text-emerald"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {doc.error && <p className="mt-1 text-xs text-red-400">{doc.error}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(reindexDocAction(doc.id))}
                      className="rounded-full border border-line/70 px-3 py-1.5 text-xs text-muted transition-colors hover:border-emerald/40 hover:text-foreground disabled:opacity-50"
                    >
                      {d.knowledge.reindex}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`${d.knowledge.deleteConfirm} "${doc.title}"?`)) {
                          run(deleteDocAction(doc.id));
                        }
                      }}
                      className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {d.common.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TagsInput({ lang, value, onChange }: { lang: AdminLang; value: string; onChange: (v: string) => void }) {
  const d = getDict(lang);
  return (
    <div>
      <label className={labelCls}>{d.knowledge.tags}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
        placeholder={d.knowledge.tagsPlaceholder}
      />
    </div>
  );
}

function TextForm({
  lang,
  pending,
  onSubmit,
}: {
  lang: AdminLang;
  pending: boolean;
  onSubmit: (t: string, c: string, tags?: string) => void;
}) {
  const d = getDict(lang);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>{d.knowledge.docTitle}</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
          placeholder={d.knowledge.docTitlePlaceholder}
        />
      </div>
      <div>
        <label className={labelCls}>{d.knowledge.text}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className={`${inputCls} resize-y leading-6`}
          placeholder={d.knowledge.textPlaceholder}
        />
      </div>
      <TagsInput lang={lang} value={tags} onChange={setTags} />
      <button
        type="button"
        disabled={pending || !title.trim() || text.trim().length < 20}
        onClick={() => onSubmit(title, text, tags || undefined)}
        className={submitCls}
      >
        {pending ? d.knowledge.processing : d.knowledge.addIndex}
      </button>
    </div>
  );
}

function UrlForm({
  lang,
  pending,
  onSubmit,
}: {
  lang: AdminLang;
  pending: boolean;
  onSubmit: (u: string, t?: string, tags?: string) => void;
}) {
  const d = getDict(lang);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>{d.knowledge.urlLabel}</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          dir="ltr"
          className={inputCls}
          placeholder="https://example.com/page"
        />
      </div>
      <div>
        <label className={labelCls}>{d.knowledge.urlTitleOptional}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>
      <TagsInput lang={lang} value={tags} onChange={setTags} />
      <button
        type="button"
        disabled={pending || !url.trim()}
        onClick={() => onSubmit(url, title || undefined, tags || undefined)}
        className={submitCls}
      >
        {pending ? d.knowledge.processing : d.knowledge.fetchIndex}
      </button>
    </div>
  );
}

function FilesForm({
  lang,
  pending,
  onSubmit,
}: {
  lang: AdminLang;
  pending: boolean;
  onSubmit: (fd: FormData) => void;
}) {
  const d = getDict(lang);
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState("");
  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>{d.knowledge.filesLabel}</label>
        <input
          type="file"
          multiple
          accept={FILE_ACCEPT}
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-muted file:me-3 file:rounded-full file:border-0 file:bg-emerald/15 file:px-4 file:py-2 file:text-emerald"
        />
        {files.length > 0 && (
          <p className="mt-1.5 text-xs text-muted">
            {fmtNum(lang, files.length)} {d.knowledge.filesSelected}
          </p>
        )}
      </div>
      <TagsInput lang={lang} value={tags} onChange={setTags} />
      <button
        type="button"
        disabled={pending || files.length === 0}
        onClick={() => {
          if (files.length === 0) return;
          const fd = new FormData();
          files.forEach((f) => fd.append("files", f));
          if (tags) fd.append("tags", tags);
          onSubmit(fd);
        }}
        className={submitCls}
      >
        {pending ? d.knowledge.processing : d.knowledge.uploadIndex}
      </button>
    </div>
  );
}

function TestSearch({ lang }: { lang: AdminLang }) {
  const d = getDict(lang);
  const [q, setQ] = useState("");
  const [pending, start] = useTransition();
  const [results, setResults] = useState<RetrievedChunk[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function search() {
    setErr(null);
    start(async () => {
      const res = await testSearchAction(q);
      if (res.ok) setResults(res.chunks ?? []);
      else setErr(res.message ?? d.common.error);
    });
  }

  return (
    <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">{d.knowledge.testTitle}</h2>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          className={inputCls}
          placeholder={d.knowledge.testPlaceholder}
        />
        <button type="button" disabled={pending || !q.trim()} onClick={search} className={submitCls}>
          {pending ? "…" : d.knowledge.searchBtn}
        </button>
      </div>
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
      {results && (
        <div className="mt-4 space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-muted">{d.knowledge.testEmpty}</p>
          ) : (
            results.map((c) => (
              <div key={c.id} className="rounded-xl border border-line/60 bg-ink/50 px-4 py-3">
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span className="font-medium text-emerald">{c.title}</span>
                  <span>
                    {d.knowledge.similarity}: {fmtNum(lang, Math.round(c.similarity * 100))}%
                  </span>
                </div>
                <p className="text-sm leading-6 text-foreground/90">{c.content.slice(0, 220)}…</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
