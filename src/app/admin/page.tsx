import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { Dashboard } from "@/components/admin/dashboard";
import { getAnalytics } from "@/lib/rag/analytics";
import { getCrmSummary } from "@/lib/crm/queries";
import { getAgentInsights } from "@/lib/crm/agent";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  let data = null;
  let error: string | null = null;
  try {
    data = await getAnalytics();
    if (!data) error = d.common.notConfigured;
  } catch (e) {
    error = (e as Error).message;
  }

  const [crm, insights] = await Promise.all([
    getCrmSummary().catch(() => null),
    getAgentInsights().catch(() => null),
  ]);

  return (
    <AdminShell active="dashboard">
      <Dashboard lang={lang} data={data} error={error} crm={crm} insights={insights} />
    </AdminShell>
  );
}
