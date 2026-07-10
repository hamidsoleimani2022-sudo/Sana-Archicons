"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, makeSessionToken, isAuthed } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const LEAD_STATUSES = ["new", "contacted", "scheduled", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Inloggen beheerder: wachtwoord controleren en sessiecookie zetten.
 * Retourwaarden zijn codes; de UI vertaalt ze (NL/FA/EN).
 */
export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return { error: "no_password_configured" };
  }
  if (!password || password !== expected) {
    return { error: "wrong_password" };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, makeSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30, // 30 dagen
  });

  redirect("/admin");
}

/** Uitloggen beheerder. */
export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

/** Status van een aanvraag wijzigen (alleen ingelogde beheerder). */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAuthed())) {
    return { ok: false, error: "unauthorized" };
  }
  if (!LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "invalid_status" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "not_configured" };
  }

  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/leads");
  return { ok: true };
}
