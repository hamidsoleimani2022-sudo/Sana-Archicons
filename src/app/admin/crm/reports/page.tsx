import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { CrmReports } from "@/components/admin/crm-reports";
import { getContacts, getDeals } from "@/lib/crm/queries";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const [dealsRes, contactsRes] = await Promise.all([getDeals(), getContacts()]);
  const rawError = dealsRes.error ?? contactsRes.error;
  const error = rawError === "not_configured" ? d.common.notConfigured : rawError;

  return (
    <AdminShell active="reports">
      <CrmReports lang={lang} deals={dealsRes.data} contacts={contactsRes.data} error={error} />
    </AdminShell>
  );
}
