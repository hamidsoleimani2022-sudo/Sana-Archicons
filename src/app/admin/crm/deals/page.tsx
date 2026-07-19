import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { DealsBoard } from "@/components/admin/deals-board";
import { getContacts, getDeals } from "@/lib/crm/queries";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const [dealsRes, contactsRes] = await Promise.all([getDeals(), getContacts()]);
  const rawError = dealsRes.error ?? contactsRes.error;
  const error = rawError === "not_configured" ? d.common.notConfigured : rawError;

  return (
    <AdminShell active="deals">
      <DealsBoard
        lang={lang}
        deals={dealsRes.data}
        contacts={contactsRes.data.map(({ id, full_name }) => ({ id, full_name }))}
        error={error}
      />
    </AdminShell>
  );
}
