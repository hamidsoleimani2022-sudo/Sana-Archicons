"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDeal, moveDealStage, saveDeal } from "@/app/admin/crm-actions";
import { getDict, fmtNum, fmtEur, type AdminLang } from "@/lib/admin/i18n";
import { STAGE_KEYS, type DealWithContact, type StageKey } from "@/lib/crm/types";

const INPUT_CLS =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50";

const STAGE_ACCENT: Record<StageKey, string> = {
  new: "border-t-sky-400/60",
  qualifying: "border-t-indigo-400/60",
  meeting: "border-t-violet-400/60",
  proposal: "border-t-amber-400/60",
  negotiation: "border-t-orange-400/60",
  won: "border-t-emerald",
  lost: "border-t-line",
};

function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export function DealsBoard({
  lang,
  deals,
  contacts,
  error,
}: {
  lang: AdminLang;
  deals: DealWithContact[];
  contacts: Array<{ id: string; full_name: string }>;
  error: string | null;
}) {
  const d = getDict(lang);
  const router = useRouter();
  const [editing, setEditing] = useState<DealWithContact | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const openDeals = deals.filter((deal) => deal.status === "open");
  const pipelineValue = openDeals.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0);

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await saveDeal(formData);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else {
        alert(res.error === "not_configured" ? d.common.notConfigured : res.error ?? d.common.error);
      }
    });
  }

  function move(id: string, stage: StageKey) {
    setBusyId(id);
    startTransition(async () => {
      const res = await moveDealStage(id, stage);
      setBusyId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  function remove(id: string) {
    if (!confirm(d.crm.confirmDelete)) return;
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteDeal(id);
      setBusyId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.crm.deals.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {d.crm.deals.subtitle} {d.crm.deals.pipelineValue}:{" "}
            <span className="font-medium text-emerald">{fmtEur(lang, pipelineValue)}</span> ·{" "}
            {fmtNum(lang, openDeals.length)} {d.crm.deals.openDeals}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(editing ? null : "new")}
          className="shrink-0 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          {d.crm.deals.addBtn}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          {editing && (
            <form action={submit} className="mb-6 rounded-2xl border border-emerald/30 bg-navy/40 p-5">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                {editing === "new" ? d.crm.deals.addBtn.replace("+ ", "") : d.crm.deals.editTitle}
              </h2>
              {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={d.crm.deals.dealTitle}>
                  <input
                    name="title"
                    required
                    defaultValue={editing === "new" ? "" : editing.title}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.deals.contact}>
                  <select
                    name="contact_id"
                    required={editing === "new"}
                    disabled={editing !== "new"}
                    defaultValue={editing === "new" ? "" : editing.contact_id}
                    className={`${INPUT_CLS} disabled:opacity-60`}
                  >
                    <option value="" className="bg-navy" />
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-navy">
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={d.crm.deals.amount}>
                  <input
                    name="amount_eur"
                    type="number"
                    min="0"
                    step="0.01"
                    dir="ltr"
                    defaultValue={editing === "new" ? "" : editing.amount_eur}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.deals.expectedClose}>
                  <input
                    name="expected_close"
                    type="date"
                    dir="ltr"
                    defaultValue={editing === "new" ? "" : editing.expected_close ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-emerald px-5 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
                >
                  {d.common.save}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-full border border-line/70 px-5 py-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  {d.crm.cancel}
                </button>
              </div>
            </form>
          )}

          {deals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-16 text-center text-muted">
              {d.crm.deals.empty}
            </div>
          ) : (
            <div className="-mx-5 overflow-x-auto px-5 pb-2">
              <div className="flex min-w-max gap-3">
                {STAGE_KEYS.map((stage) => {
                  const stageDeals = deals.filter((deal) => deal.stage_key === stage);
                  const value = stageDeals.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0);
                  return (
                    <section
                      key={stage}
                      className={`w-64 shrink-0 rounded-2xl border border-line/60 border-t-2 bg-navy/30 ${STAGE_ACCENT[stage]}`}
                    >
                      <header className="flex items-center justify-between gap-2 px-4 py-3">
                        <h2 className="text-sm font-semibold text-foreground">
                          {d.crm.stages[stage]}
                        </h2>
                        <span className="text-xs text-muted">
                          {fmtNum(lang, stageDeals.length)} · {fmtEur(lang, value)}
                        </span>
                      </header>
                      <div className="space-y-2 px-2.5 pb-3">
                        {stageDeals.map((deal) => (
                          <article
                            key={deal.id}
                            className="rounded-xl border border-line/70 bg-navy/60 p-3"
                          >
                            <p className="break-words text-sm font-medium text-foreground">
                              {deal.title}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              {deal.contact?.full_name ?? "—"}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                              <span className="font-medium text-emerald">
                                {fmtEur(lang, deal.amount_eur ?? 0)}
                              </span>
                              <span className="text-muted">
                                {fmtNum(lang, daysSince(deal.stage_entered_at))}{" "}
                                {d.crm.deals.daysInStage}
                              </span>
                            </div>
                            <div className="mt-2.5 flex items-center gap-1.5">
                              <select
                                value={deal.stage_key}
                                disabled={busyId === deal.id}
                                onChange={(e) => move(deal.id, e.target.value as StageKey)}
                                aria-label={d.crm.deals.stage}
                                className="w-full cursor-pointer rounded-lg border border-line/70 bg-navy/60 px-2 py-1.5 text-xs text-foreground outline-none transition focus:border-emerald/50 disabled:opacity-50"
                              >
                                {STAGE_KEYS.map((s) => (
                                  <option key={s} value={s} className="bg-navy">
                                    {d.crm.stages[s]}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setEditing(deal)}
                                aria-label={d.crm.edit}
                                className="rounded-lg border border-line/70 px-2 py-1.5 text-xs text-muted transition-colors hover:border-emerald/40 hover:text-foreground"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                disabled={busyId === deal.id}
                                onClick={() => remove(deal.id)}
                                aria-label={d.common.delete}
                                className="rounded-lg border border-red-400/40 px-2 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                              >
                                ✕
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
