import { getDict, fmtNum, fmtCost, type AdminLang } from "@/lib/admin/i18n";
import type { Analytics } from "@/lib/rag/analytics";

/** Dashboard met statistiekkaarten, kanaalverdeling en modelkosten. */
export function Dashboard({
  lang,
  data,
  error,
}: {
  lang: AdminLang;
  data: Analytics | null;
  error: string | null;
}) {
  const d = getDict(lang);
  const n = (v: number) => fmtNum(lang, v);
  const channelLabel = (ch: string) =>
    d.dashboard.channels[ch as keyof typeof d.dashboard.channels] ?? ch;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{d.dashboard.title}</h1>
        <p className="mt-1 text-sm text-muted">{d.dashboard.subtitle}</p>
      </div>

      {error || !data ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error ?? d.common.noData}
        </div>
      ) : (
        <>
          {/* Statistiekkaarten */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label={d.dashboard.conversations} value={n(data.totals.conversations)} />
            <Stat label={d.dashboard.users} value={n(data.totals.users)} />
            <Stat label={d.dashboard.messages} value={n(data.totals.messages)} />
            <Stat
              label={d.dashboard.chatbotLeads}
              value={n(data.totals.chatbotLeads)}
              hint={`${n(data.totals.leads)} ${d.dashboard.ofTotalLeads}`}
            />
            <Stat
              label={d.dashboard.conversionRate}
              value={`${n(data.conversionRate)}%`}
              hint={d.dashboard.conversionHint}
            />
            <Stat
              label={d.dashboard.satisfaction}
              value={`${n(data.satisfactionRate)}%`}
              hint={`👍 ${n(data.feedback.up)} · 👎 ${n(data.feedback.down)}`}
            />
            <Stat
              label={d.dashboard.estCost}
              value={fmtCost(data.totalCostUsd)}
              hint={`${n(data.totalTokens)} ${d.dashboard.tokensHint}`}
            />
            <Stat label={d.dashboard.gaps} value={n(data.gaps)} hint={d.dashboard.gapsHint} />
          </div>

          {/* Kanaalverdeling */}
          <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              {d.dashboard.byChannel}
            </h2>
            {data.byChannel.length === 0 ? (
              <p className="text-sm text-muted">{d.dashboard.noConversations}</p>
            ) : (
              <div className="space-y-3">
                {data.byChannel.map((c) => {
                  const max = Math.max(...data.byChannel.map((x) => x.conversations), 1);
                  const pct = Math.round((c.conversations / max) * 100);
                  return (
                    <div key={c.channel} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-sm text-foreground/90">
                        {channelLabel(c.channel)}
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-line/40">
                        <div
                          className="h-full rounded-full bg-emerald"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-end text-sm text-muted">
                        {n(c.conversations)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tokenverbruik per model */}
          <section className="rounded-2xl border border-line/70 bg-navy/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">
                {d.dashboard.modelUsage}
              </h2>
              <span className="text-xs text-muted">{d.dashboard.estimated}</span>
            </div>
            {data.models.length === 0 ? (
              <p className="text-sm text-muted">{d.dashboard.noConversations}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line/60 text-start text-xs text-muted">
                      <th className="py-2 text-start font-medium">{d.dashboard.model}</th>
                      <th className="py-2 text-start font-medium">{d.dashboard.replies}</th>
                      <th className="py-2 text-start font-medium">{d.dashboard.tokensIn}</th>
                      <th className="py-2 text-start font-medium">{d.dashboard.tokensOut}</th>
                      <th className="py-2 text-start font-medium">{d.dashboard.cost}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.models.map((m) => (
                      <tr key={m.model} className="border-b border-line/40">
                        <td dir="ltr" className="py-2.5 text-start text-emerald">
                          {m.model}
                        </td>
                        <td className="py-2.5">{n(m.messages)}</td>
                        <td className="py-2.5">{n(m.tokensIn)}</td>
                        <td className="py-2.5">{n(m.tokensOut)}</td>
                        <td className="py-2.5 text-emerald-bright">{fmtCost(m.costUsd)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium">
                      <td className="py-2.5 text-foreground">{d.dashboard.total}</td>
                      <td className="py-2.5">
                        {n(data.models.reduce((s, m) => s + m.messages, 0))}
                      </td>
                      <td className="py-2.5">
                        {n(data.models.reduce((s, m) => s + m.tokensIn, 0))}
                      </td>
                      <td className="py-2.5">
                        {n(data.models.reduce((s, m) => s + m.tokensOut, 0))}
                      </td>
                      <td className="py-2.5 text-emerald-bright">{fmtCost(data.totalCostUsd)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
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
