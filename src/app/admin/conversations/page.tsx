import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { ConversationsViewer, type ConvRow } from "@/components/admin/conversations-viewer";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const supabase = getSupabaseAdmin();
  let conversations: ConvRow[] = [];
  let error: string | null = null;
  if (!supabase) {
    error = d.common.notConfigured;
  } else {
    const { data, error: e } = await supabase
      .from("conversations")
      .select("id, channel, status, started_at, last_at")
      .order("last_at", { ascending: false })
      .limit(50);
    if (e) error = e.message;
    else conversations = (data as ConvRow[]) ?? [];
  }

  return (
    <AdminShell active="conversations">
      <ConversationsViewer lang={lang} conversations={conversations} error={error} />
    </AdminShell>
  );
}
