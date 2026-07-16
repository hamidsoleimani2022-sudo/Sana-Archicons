"use client";

import { useState } from "react";
import { getDict, type AdminLang } from "@/lib/admin/i18n";
import {
  defaultOfferData,
  newId,
  OFFER_TEXT_SECTION_KEYS,
  type OfferData,
  type OfferTextSectionKey,
} from "@/lib/admin/offer-defaults";
import { downloadOfferAsWord } from "@/lib/admin/offer-word";
import { OfferDocument } from "./offer-document";

const labelCls = "mb-1.5 block text-xs font-medium text-muted";
const inputCls =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-emerald/50";
const smallBtnCls =
  "rounded-full border border-line/70 px-3 py-1.5 text-xs text-muted transition-colors hover:border-emerald/40 hover:text-foreground";

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line/70 bg-navy/40 p-5">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

export function OfferBuilder({ lang }: { lang: AdminLang }) {
  const d = getDict(lang);
  const [data, setData] = useState<OfferData>(() => defaultOfferData());

  const patch = (p: Partial<OfferData>) => setData((cur) => ({ ...cur, ...p }));
  const patchClient = (p: Partial<OfferData["client"]>) =>
    setData((cur) => ({ ...cur, client: { ...cur.client, ...p } }));
  const patchSender = (p: Partial<OfferData["sender"]>) =>
    setData((cur) => ({ ...cur, sender: { ...cur.sender, ...p } }));
  const patchSection = (key: OfferTextSectionKey, p: Partial<OfferData["sections"][OfferTextSectionKey]>) =>
    setData((cur) => ({
      ...cur,
      sections: { ...cur.sections, [key]: { ...cur.sections[key], ...p } },
    }));

  function reset() {
    if (window.confirm(d.offers.resetConfirm)) setData(defaultOfferData());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.offers.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {d.offers.subtitle} {d.offers.docLanguageHint}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={reset} className={smallBtnCls}>
            {d.offers.reset}
          </button>
          <button
            type="button"
            onClick={() => void downloadOfferAsWord(data)}
            className="inline-flex items-center justify-center rounded-full border border-emerald/50 px-6 py-2.5 text-sm font-semibold text-emerald transition-colors hover:bg-emerald/10"
          >
            {d.offers.word}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            {d.offers.print}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* ---------- Formulier ---------- */}
        <div className="space-y-5">
          <Panel title={d.offers.metaTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{d.offers.offerNumber}</label>
                <input
                  className={inputCls}
                  value={data.offerNumber}
                  onChange={(e) => patch({ offerNumber: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.date}</label>
                <input
                  type="date"
                  className={inputCls}
                  value={data.date}
                  onChange={(e) => patch({ date: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.validityDays}</label>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={data.validityDays}
                  onChange={(e) => patch({ validityDays: Math.max(1, Number(e.target.value) || 14) })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{d.offers.projectTitle}</label>
                <input
                  className={inputCls}
                  value={data.projectTitle}
                  onChange={(e) => patch({ projectTitle: e.target.value })}
                />
              </div>
            </div>
          </Panel>

          <Panel title={d.offers.clientTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>{d.offers.clientCompany}</label>
                <input
                  className={inputCls}
                  value={data.client.company}
                  onChange={(e) => patchClient({ company: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.clientContact}</label>
                <input
                  className={inputCls}
                  value={data.client.contact}
                  onChange={(e) => patchClient({ contact: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.clientCity}</label>
                <input
                  className={inputCls}
                  value={data.client.city}
                  onChange={(e) => patchClient({ city: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.clientEmail}</label>
                <input
                  className={inputCls}
                  value={data.client.email}
                  onChange={(e) => patchClient({ email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.clientPhone}</label>
                <input
                  className={inputCls}
                  value={data.client.phone}
                  onChange={(e) => patchClient({ phone: e.target.value })}
                />
              </div>
            </div>
          </Panel>

          <Panel title={d.offers.senderTitle}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{d.offers.senderContact}</label>
                <input
                  className={inputCls}
                  value={data.sender.contact}
                  onChange={(e) => patchSender({ contact: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.senderEmail}</label>
                <input
                  className={inputCls}
                  value={data.sender.email}
                  onChange={(e) => patchSender({ email: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.senderPhone}</label>
                <input
                  className={inputCls}
                  value={data.sender.phone}
                  onChange={(e) => patchSender({ phone: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.senderWebsite}</label>
                <input
                  className={inputCls}
                  value={data.sender.website}
                  onChange={(e) => patchSender({ website: e.target.value })}
                />
              </div>
            </div>
          </Panel>

          <Panel title={d.offers.servicesTitle}>
            <div className="space-y-3">
              {data.services.map((s) => (
                <div key={s.id} className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label className={labelCls}>{d.offers.serviceDescription}</label>
                    <input
                      className={inputCls}
                      value={s.description}
                      onChange={(e) =>
                        setData((cur) => ({
                          ...cur,
                          services: cur.services.map((x) =>
                            x.id === s.id ? { ...x, description: e.target.value } : x
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <label className={labelCls}>{d.offers.serviceAmount}</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      className={inputCls}
                      value={s.amount}
                      onChange={(e) =>
                        setData((cur) => ({
                          ...cur,
                          services: cur.services.map((x) =>
                            x.id === s.id ? { ...x, amount: Number(e.target.value) || 0 } : x
                          ),
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className={`${smallBtnCls} mb-1 shrink-0`}
                    aria-label={d.offers.removeLine}
                    disabled={data.services.length <= 1}
                    onClick={() =>
                      setData((cur) => ({
                        ...cur,
                        services:
                          cur.services.length > 1
                            ? cur.services.filter((x) => x.id !== s.id)
                            : cur.services,
                      }))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={smallBtnCls}
                onClick={() =>
                  setData((cur) => ({
                    ...cur,
                    services: [...cur.services, { id: newId(), description: "", amount: 0 }],
                  }))
                }
              >
                {d.offers.addService}
              </button>

              <label className="flex cursor-pointer items-center gap-2 pt-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={data.vatEnabled}
                  onChange={(e) => patch({ vatEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald"
                />
                {d.offers.vatEnabled}
              </label>

              <div>
                <label className={labelCls}>{d.offers.paymentTerms}</label>
                <input
                  className={inputCls}
                  value={data.paymentTerms}
                  onChange={(e) => patch({ paymentTerms: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>{d.offers.investmentNote}</label>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={data.investmentNote}
                  onChange={(e) => patch({ investmentNote: e.target.value })}
                />
              </div>
            </div>
          </Panel>

          <Panel title={d.offers.phasesTitle}>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={data.phasesEnabled}
                  onChange={(e) => patch({ phasesEnabled: e.target.checked })}
                  className="h-4 w-4 accent-emerald"
                />
                {d.offers.phasesEnabled}
              </label>
              {data.phasesEnabled && (
                <>
                  {data.phases.map((p) => (
                    <div key={p.id} className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <label className={labelCls}>{d.offers.phaseName}</label>
                        <input
                          className={inputCls}
                          value={p.name}
                          onChange={(e) =>
                            setData((cur) => ({
                              ...cur,
                              phases: cur.phases.map((x) =>
                                x.id === p.id ? { ...x, name: e.target.value } : x
                              ),
                            }))
                          }
                        />
                      </div>
                      <div className="w-28 shrink-0">
                        <label className={labelCls}>{d.offers.phaseDuration}</label>
                        <input
                          className={inputCls}
                          value={p.duration}
                          onChange={(e) =>
                            setData((cur) => ({
                              ...cur,
                              phases: cur.phases.map((x) =>
                                x.id === p.id ? { ...x, duration: e.target.value } : x
                              ),
                            }))
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className={`${smallBtnCls} mb-1 shrink-0`}
                        aria-label={d.offers.removeLine}
                        onClick={() =>
                          setData((cur) => ({
                            ...cur,
                            phases: cur.phases.filter((x) => x.id !== p.id),
                          }))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={smallBtnCls}
                    onClick={() =>
                      setData((cur) => ({
                        ...cur,
                        phases: [...cur.phases, { id: newId(), name: "", duration: "" }],
                      }))
                    }
                  >
                    {d.offers.addPhase}
                  </button>
                  <div>
                    <label className={labelCls}>{d.offers.totalDuration}</label>
                    <input
                      className={inputCls}
                      value={data.totalDuration}
                      onChange={(e) => patch({ totalDuration: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
          </Panel>

          <Panel title={d.offers.sectionsTitle}>
            <p className="mb-4 text-xs text-muted">{d.offers.sectionsHint}</p>
            <div className="space-y-4">
              {OFFER_TEXT_SECTION_KEYS.map((key) => {
                const s = data.sections[key];
                return (
                  <div key={key} className="rounded-xl border border-line/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={s.enabled}
                        onChange={(e) => patchSection(key, { enabled: e.target.checked })}
                        className="h-4 w-4 shrink-0 accent-emerald"
                      />
                      <input
                        className={`${inputCls} py-1.5 font-medium`}
                        value={s.title}
                        onChange={(e) => patchSection(key, { title: e.target.value })}
                      />
                    </div>
                    {s.enabled && (
                      <textarea
                        rows={Math.min(8, Math.max(3, s.body.split("\n").length))}
                        className={`${inputCls} leading-relaxed`}
                        value={s.body}
                        onChange={(e) => patchSection(key, { body: e.target.value })}
                        dir="ltr"
                        lang="nl"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* ---------- Live voorbeeld ---------- */}
        <div className="min-w-0">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            {d.offers.previewTitle}
          </div>
          <div className="overflow-x-auto rounded-lg">
            <OfferDocument data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
