import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { CompaniesManager } from "@/components/admin/companies-manager";
import { getCompanies } from "@/lib/crm/queries";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const { data, error: rawError } = await getCompanies();
  const error = rawError === "not_configured" ? d.common.notConfigured : rawError;

  return (
    <AdminShell active="companies">
      <CompaniesManager lang={lang} companies={data} error={error} />
    </AdminShell>
  );
}
