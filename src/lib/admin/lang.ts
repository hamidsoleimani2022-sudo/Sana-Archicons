import "server-only";
import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, normalizeLang, type AdminLang } from "./i18n";

/** Leest de admin-panel-taal (nl | fa | en) uit de cookie; default nl. */
export async function getAdminLang(): Promise<AdminLang> {
  const store = await cookies();
  return normalizeLang(store.get(ADMIN_LANG_COOKIE)?.value);
}
