import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { AdminShell } from "@/components/admin/admin-shell";
import { ModelSettings } from "@/components/admin/model-settings";
import { getModelConfig, getEmbeddingConfig } from "@/lib/rag/config";

export const dynamic = "force-dynamic";

export default async function ModelsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const [model, embedding] = await Promise.all([getModelConfig("web"), getEmbeddingConfig()]);
  return (
    <AdminShell active="models">
      <ModelSettings lang={lang} model={model} embedding={embedding} />
    </AdminShell>
  );
}
