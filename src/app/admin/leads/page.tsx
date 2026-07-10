import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { LeadsManager, type Lead } from "@/components/admin/leads-manager";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const supabase = getSupabaseAdmin();
  let leads: Lead[] = [];
  let error: string | null = null;
  if (!supabase) {
    error = d.common.notConfigured;
  } else {
    const { data, error: dbError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (dbError) error = dbError.message;
    else leads = (data as Lead[]) ?? [];
  }

  return (
    <AdminShell active="leads">
      <LeadsManager lang={lang} leads={leads} error={error} />
    </AdminShell>
  );
}
