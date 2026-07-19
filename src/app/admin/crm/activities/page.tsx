import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { ActivitiesManager } from "@/components/admin/activities-manager";
import { getActivities, getContacts, getDeals } from "@/lib/crm/queries";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const [activitiesRes, contactsRes, dealsRes] = await Promise.all([
    getActivities(),
    getContacts(),
    getDeals(),
  ]);
  const rawError = activitiesRes.error ?? contactsRes.error ?? dealsRes.error;
  const error = rawError === "not_configured" ? d.common.notConfigured : rawError;

  return (
    <AdminShell active="activities">
      <ActivitiesManager
        lang={lang}
        activities={activitiesRes.data}
        contacts={contactsRes.data.map(({ id, full_name }) => ({ id, full_name }))}
        deals={dealsRes.data.map(({ id, title }) => ({ id, title }))}
        error={error}
      />
    </AdminShell>
  );
}
