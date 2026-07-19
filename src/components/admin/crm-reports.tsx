"use client";

import { useMemo } from "react";
import { getDict, fmtNum, fmtEur, type AdminLang } from "@/lib/admin/i18n";
import {
  STAGE_KEYS,
  type ContactSource,
  type ContactWithCompany,
  type DealWithContact,
} from "@/lib/crm/types";

/** Rapporten: pijplijn, conversie en resultaten — berekend uit deals en contacten. */
export function CrmReports({
  lang,
  deals,
  contacts,
  error,
}: {
  lang: AdminLang;
  deals: DealWithContact[];
  contacts: ContactWithCompany[];
  error: string | null;
}) {
  const d = getDict(lang);

  const stats = useMemo(() => {
    const open = deals.filter((deal) => deal.status === "open");
    const won = deals.filter((deal) => deal.status === "won");
    const lost = deals.filter((deal) => deal.status === "lost");
    const closed = won.length + lost.length;
    const wonValue = won.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0);
    const openValue = open.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0);
    const valued = deals.filter((deal) => (deal.amount_eur ?? 0) > 0);

    const byStage = STAGE_KEYS.map((stage) => {
      const stageDeals = deals.filter((deal) => deal.stage_key === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0),
      };
    });

    const bySource: Record<ContactSource, number> = { website: 0, chatbot: 0, manual: 0 };
    for (const contact of contacts) bySource[contact.source] = (bySource[contact.source] ?? 0) + 1;

    // Laatste 6 maanden nieuwe deals
    const months: Array<{ label: string; count: number }> = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = new Intl.DateTimeFormat(
        lang === "fa" ? "fa-IR" : lang === "nl" ? "nl-NL" : "en-GB",
        { month: "short" }
      ).format(date);
      const count = deals.filter((deal) => {
        const created = new Date(deal.created_at);
        return (
          created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth()
        );
      }).length;
      months.push({ label, count });
    }

    return {
      winRate: closed > 0 ? Math.round((won.length / closed) * 100) : 0,
      wonValue,
      openValue,
      avgDeal:
        valued.length > 0
          ? valued.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0) / valued.length
          : 0,
      byStage,
      bySource,
      months,
    };
  }, [deals, contacts, lang]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{d.crm.reports.title}</h1>
        <p className="mt-1 text-sm text-muted">{d.crm.reports.subtitle}</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : deals.length === 0 && contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-16 text-center text-muted">
          {d.crm.reports.noData}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label={d.crm.reports.winRate}
              value={`${fmtNum(lang, stats.winRate)}%`}
              hint={d.crm.reports.winRateHint}
            />
            <Stat label={d.crm.reports.wonValue} value={fmtEur(lang, stats.wonValue)} />
            <Stat label={d.crm.reports.openValue} value={fmtEur(lang, stats.openValue)} />
            <Stat label={d.crm.reports.avgDeal} value={fmtEur(lang, stats.avgDeal)} />
          </div>

          <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              {d.crm.reports.pipelineByStage}
            </h2>
            <div className="space-y-3">
              {stats.byStage.map(({ stage, count, value }) => {
                const max = Math.max(...stats.byStage.map((s) => s.count), 1);
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-sm text-foreground/90">
                      {d.crm.stages[stage]}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/40">
                      <div
                        className={`h-full rounded-full ${stage === "lost" ? "bg-line" : "bg-emerald"}`}
                        style={{ width: `${Math.round((count / max) * 100)}%` }}
                      />
                    </div>
                    <span className="w-32 shrink-0 text-end text-xs text-muted">
                      {fmtNum(lang, count)} {d.crm.reports.dealsSuffix} · {fmtEur(lang, value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                {d.crm.reports.bySource}
              </h2>
              <div className="space-y-3">
                {(Object.keys(stats.bySource) as ContactSource[]).map((source) => {
                  const count = stats.bySource[source];
                  const max = Math.max(...Object.values(stats.bySource), 1);
                  return (
                    <div key={source} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm text-foreground/90">
                        {d.crm.sources[source]}
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/40">
                        <div
                          className="h-full rounded-full bg-emerald"
                          style={{ width: `${Math.round((count / max) * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-end text-sm text-muted">
                        {fmtNum(lang, count)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                {d.crm.reports.monthly}
              </h2>
              <div className="flex h-36 items-end gap-2">
                {stats.months.map((month, i) => {
                  const max = Math.max(...stats.months.map((m) => m.count), 1);
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-xs text-muted">{fmtNum(lang, month.count)}</span>
                      <div
                        className="w-full rounded-t-lg bg-emerald/70"
                        style={{ height: `${Math.max(4, Math.round((month.count / max) * 100))}%` }}
                      />
                      <span className="text-[0.7rem] text-muted">{month.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-navy/40 p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
