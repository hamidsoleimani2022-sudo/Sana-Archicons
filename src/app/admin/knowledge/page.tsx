import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { KnowledgeManager, type DocRow } from "@/components/admin/knowledge-manager";

export const dynamic = "force-dynamic";
// Upload + embedding kan enkele seconden duren
export const maxDuration = 60;

export default async function KnowledgePage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const supabase = getSupabaseAdmin();
  let docs: DocRow[] = [];
  let error: string | null = null;
  if (!supabase) {
    error = d.common.notConfigured;
  } else {
    const { data, error: e } = await supabase
      .from("documents")
      .select("id, title, source_type, source_url, status, chunk_count, error, tags, created_at")
      .order("created_at", { ascending: false });
    if (e) error = e.message;
    else docs = (data as DocRow[]) ?? [];
  }

  return (
    <AdminShell active="knowledge">
      <KnowledgeManager lang={lang} docs={docs} error={error} />
    </AdminShell>
  );
}
