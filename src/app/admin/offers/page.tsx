import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { AdminShell } from "@/components/admin/admin-shell";
import { OfferBuilder } from "@/components/admin/offer-builder";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();

  return (
    <AdminShell active="offers">
      <OfferBuilder lang={lang} />
    </AdminShell>
  );
}
