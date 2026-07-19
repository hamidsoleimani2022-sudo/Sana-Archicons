import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { ContactsManager } from "@/components/admin/contacts-manager";
import { getCompanies, getContacts } from "@/lib/crm/queries";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const [contactsRes, companiesRes] = await Promise.all([getContacts(), getCompanies()]);
  const rawError = contactsRes.error ?? companiesRes.error;
  const error = rawError === "not_configured" ? d.common.notConfigured : rawError;

  return (
    <AdminShell active="contacts">
      <ContactsManager
        lang={lang}
        contacts={contactsRes.data}
        companies={companiesRes.data.map(({ id, name }) => ({ id, name }))}
        error={error}
      />
    </AdminShell>
  );
}
