"use client";

import { useState, useTransition } from "react";
import type { ModelConfig, EmbeddingConfig } from "@/lib/rag/config";
import { saveModelConfigAction, saveEmbeddingConfigAction } from "@/app/admin/chatbot-actions";
import { getDict, type AdminLang } from "@/lib/admin/i18n";

const MODEL_GROUPS: { provider: string; models: { slug: string; label: string }[] }[] = [
  { provider: "Anthropic (Claude)", models: [{ slug: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" }] },
  {
    provider: "Google (Gemini)",
    models: [
      { slug: "google/gemini-3.5-flash", label: "Gemini 3.5 Flash" },
      { slug: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite" },
      { slug: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
  },
  {
    provider: "OpenAI",
    models: [
      { slug: "openai/gpt-5-mini", label: "GPT-5 Mini" },
      { slug: "openai/gpt-5.4-nano", label: "GPT-5.4 Nano" },
      { slug: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
    ],
  },
  { provider: "Qwen", models: [{ slug: "qwen/qwen3-30b-a3b-instruct-2507", label: "Qwen3 30B" }] },
];

const labelCls = "mb-1.5 block text-xs font-medium text-muted";
const inputCls =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-emerald/50";
const saveCls =
  "inline-flex items-center justify-center rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50";

export function ModelSettings({
  lang,
  model,
  embedding,
}: {
  lang: AdminLang;
  model: ModelConfig;
  embedding: EmbeddingConfig;
}) {
  const d = getDict(lang);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{d.models.title}</h1>
        <p className="mt-1 text-sm text-muted">{d.models.subtitle}</p>
      </div>
      <ModelForm lang={lang} model={model} />
      <EmbeddingForm lang={lang} embedding={embedding} />
    </div>
  );
}

function ModelForm({ lang, model }: { lang: AdminLang; model: ModelConfig }) {
  const d = getDict(lang);
  const [activeModel, setActiveModel] = useState(model.active_model);
  const [fallback, setFallback] = useState(model.fallback_model ?? "");
  const [temperature, setTemperature] = useState(model.temperature);
  const [maxTokens, setMaxTokens] = useState(model.max_tokens);
  const [topP, setTopP] = useState(model.top_p);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Onbekend (bijv. verouderd) actief model tóch tonen
  const known = MODEL_GROUPS.flatMap((g) => g.models.map((m) => m.slug));
  const extra = known.includes(activeModel) ? [] : [activeModel];

  function save() {
    start(async () => {
      const res = await saveModelConfigAction({
        active_model: activeModel,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        fallback_model: fallback || null,
      });
      setMsg({ ok: res.ok, text: res.ok ? d.common.done : res.message ?? d.common.error });
    });
  }

  return (
    <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
      <h2 className="mb-4 text-base font-semibold text-foreground">{d.models.genTitle}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>{d.models.activeModel}</label>
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            className={`${inputCls} cursor-pointer`}
          >
            {extra.map((s) => (
              <option key={s} value={s} className="bg-navy">
                {s} ({d.models.current})
              </option>
            ))}
            {MODEL_GROUPS.map((g) => (
              <optgroup key={g.provider} label={g.provider}>
                {g.models.map((m) => (
                  <option key={m.slug} value={m.slug} className="bg-navy">
                    {m.label} — {m.slug}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{d.models.fallback}</label>
          <select
            value={fallback}
            onChange={(e) => setFallback(e.target.value)}
            className={`${inputCls} cursor-pointer`}
          >
            <option value="" className="bg-navy">
              {d.models.none}
            </option>
            {MODEL_GROUPS.map((g) => (
              <optgroup key={g.provider} label={g.provider}>
                {g.models.map((m) => (
                  <option key={m.slug} value={m.slug} className="bg-navy">
                    {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            {d.models.temperature} ({temperature})
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-emerald"
          />
        </div>
        <div>
          <label className={labelCls}>{d.models.maxTokens}</label>
          <input
            type="number"
            min={100}
            max={4000}
            step={50}
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            {d.models.topP} ({topP})
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={topP}
            onChange={(e) => setTopP(Number(e.target.value))}
            className="w-full accent-emerald"
          />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button type="button" disabled={pending} onClick={save} className={saveCls}>
          {pending ? d.common.saving : d.models.saveModel}
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? "text-green-300" : "text-red-400"}`}>{msg.text}</span>
        )}
      </div>
    </section>
  );
}

function EmbeddingForm({ lang, embedding }: { lang: AdminLang; embedding: EmbeddingConfig }) {
  const d = getDict(lang);
  const [chunkSize, setChunkSize] = useState(embedding.chunk_size);
  const [overlap, setOverlap] = useState(embedding.chunk_overlap);
  const [topK, setTopK] = useState(embedding.top_k);
  const [threshold, setThreshold] = useState(embedding.similarity_threshold);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function save() {
    start(async () => {
      const res = await saveEmbeddingConfigAction({
        chunk_size: chunkSize,
        chunk_overlap: overlap,
        top_k: topK,
        similarity_threshold: threshold,
      });
      setMsg({ ok: res.ok, text: res.ok ? d.common.done : res.message ?? d.common.error });
    });
  }

  return (
    <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
      <h2 className="mb-2 text-base font-semibold text-foreground">{d.models.retrTitle}</h2>
      <div className="mb-4 rounded-xl bg-ink/50 px-4 py-3 text-sm leading-6 text-muted">
        {d.models.embedInfoPrefix}{" "}
        <b dir="ltr" className="text-emerald">
          {embedding.provider} / {embedding.model}
        </b>{" "}
        ({embedding.dimensions}D). {d.models.embedInfoSuffix}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{d.models.chunkSize}</label>
          <input
            type="number"
            min={100}
            max={1500}
            step={50}
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{d.models.overlap}</label>
          <input
            type="number"
            min={0}
            max={300}
            step={10}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>{d.models.topK}</label>
          <input
            type="number"
            min={1}
            max={20}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            {d.models.threshold} ({threshold})
          </label>
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full accent-emerald"
          />
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <button type="button" disabled={pending} onClick={save} className={saveCls}>
          {pending ? d.common.saving : d.models.saveRetrieval}
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? "text-green-300" : "text-red-400"}`}>{msg.text}</span>
        )}
      </div>
    </section>
  );
}
