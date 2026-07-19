import { getDict, fmtDate, fmtNum, type AdminLang } from "@/lib/admin/i18n";
import { fillTemplate, type AgentInsight, type AgentSeverity } from "@/lib/crm/types";

const SEVERITY_CLS: Record<AgentSeverity, string> = {
  high: "bg-red-500/15 text-red-300",
  medium: "bg-amber-500/15 text-amber-300",
  low: "bg-sky-500/15 text-sky-300",
};

/**
 * Meldingen/adviezen van de Agent CRM als lijst.
 * Presentational component zonder hooks — bruikbaar op server- én clientpagina's.
 */
export function InsightList({
  lang,
  insights,
  limit,
}: {
  lang: AdminLang;
  insights: AgentInsight[];
  limit?: number;
}) {
  const d = getDict(lang);
  const shown = limit ? insights.slice(0, limit) : insights;

  if (shown.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-8 text-center text-sm text-muted">
        {d.agent.insightsEmpty}
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {shown.map((insight, i) => {
        const text = fillTemplate(d.agent.insights[insight.kind], {
          title: insight.params.title ?? "",
          name: insight.params.name ?? "",
          date: insight.params.dateIso ? fmtDate(lang, insight.params.dateIso) : "",
          days: insight.params.days != null ? fmtNum(lang, insight.params.days) : "",
          stage: insight.params.stageKey ? d.crm.stages[insight.params.stageKey] : "",
        });
        return (
          <li key={i}>
            <a
              href={insight.href}
              className="flex items-start gap-3 rounded-2xl border border-line/70 bg-navy/40 p-4 transition-colors hover:border-emerald/40"
            >
              <span
                className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium ${SEVERITY_CLS[insight.severity]}`}
              >
                {d.agent.severity[insight.severity]}
              </span>
              <span className="min-w-0 text-sm leading-6 text-foreground/90">{text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
