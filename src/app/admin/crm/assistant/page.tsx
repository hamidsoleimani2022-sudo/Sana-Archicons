import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { AgentChat } from "@/components/admin/agent-chat";
import { InsightList } from "@/components/admin/insight-list";
import { getAgentInsights } from "@/lib/crm/agent";
import { isOpenRouterConfigured } from "@/lib/rag/generate";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const insights = await getAgentInsights();

  return (
    <AdminShell active="assistant">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.agent.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{d.agent.subtitle}</p>
        </div>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">{d.agent.insightsTitle}</h2>
          {insights === null ? (
            <p className="rounded-2xl border border-line/70 bg-navy/40 px-5 py-4 text-sm text-muted">
              {d.common.notConfigured}
            </p>
          ) : (
            <InsightList lang={lang} insights={insights} />
          )}
        </section>

        <AgentChat lang={lang} aiConfigured={isOpenRouterConfigured()} />
      </div>
    </AdminShell>
  );
}
