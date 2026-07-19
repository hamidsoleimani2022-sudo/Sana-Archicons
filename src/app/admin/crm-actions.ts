"use server";

import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { STAGE_KEYS, type ActivityType, type StageKey } from "@/lib/crm/types";

/**
 * Server-actions van de CRM-module (contacten, bedrijven, deals, activiteiten
 * en lead-conversie). Zelfde beveiligings- en foutpatroon als actions.ts:
 * foutcodes als string, de UI vertaalt.
 */

type ActionResult = { ok: boolean; error?: string };

const ACTIVITY_TYPES: ActivityType[] = ["call", "meeting", "note", "task"];

function str(formLike: FormData, key: string): string {
  return String(formLike.get(key) ?? "").trim();
}

function orNull(value: string): string | null {
  return value === "" ? null : value;
}

async function guard(): Promise<{ error?: string; supabase?: NonNullable<ReturnType<typeof getSupabaseAdmin>> }> {
  if (!(await isAuthed())) return { error: "unauthorized" };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "not_configured" };
  return { supabase };
}

function revalidateCrm() {
  for (const path of [
    "/admin",
    "/admin/leads",
    "/admin/crm/contacts",
    "/admin/crm/companies",
    "/admin/crm/deals",
    "/admin/crm/activities",
    "/admin/crm/reports",
    "/admin/crm/assistant",
  ]) {
    revalidatePath(path);
  }
}

// ── Bedrijven ────────────────────────────────────────────────────

export async function saveCompany(formData: FormData): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return { ok: false, error: "invalid_input" };

  const row = {
    name,
    industry: orNull(str(formData, "industry")),
    website: orNull(str(formData, "website")),
    city: orNull(str(formData, "city")),
    size_label: orNull(str(formData, "size_label")),
    notes: orNull(str(formData, "notes")),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("companies").update(row).eq("id", id)
    : await supabase.from("companies").insert(row);
  if (error) return { ok: false, error: error.message };

  revalidateCrm();
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

// ── Contacten ────────────────────────────────────────────────────

export async function saveContact(formData: FormData): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };

  const id = str(formData, "id");
  const fullName = str(formData, "full_name");
  if (!fullName) return { ok: false, error: "invalid_input" };

  const row = {
    full_name: fullName,
    phone: orNull(str(formData, "phone")),
    email: orNull(str(formData, "email")),
    position: orNull(str(formData, "position")),
    company_id: orNull(str(formData, "company_id")),
    notes: orNull(str(formData, "notes")),
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("contacts").update(row).eq("id", id)
    : await supabase.from("contacts").insert({ ...row, source: "manual" });
  if (error) return { ok: false, error: error.message };

  revalidateCrm();
  return { ok: true };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

// ── Deals ────────────────────────────────────────────────────────

export async function saveDeal(formData: FormData): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };

  const id = str(formData, "id");
  const title = str(formData, "title");
  const contactId = str(formData, "contact_id");
  if (!title || (!id && !contactId)) return { ok: false, error: "invalid_input" };

  const amount = Number.parseFloat(str(formData, "amount_eur").replace(",", "."));
  const row: Record<string, unknown> = {
    title,
    amount_eur: Number.isFinite(amount) ? amount : 0,
    expected_close: orNull(str(formData, "expected_close")),
    lost_reason: orNull(str(formData, "lost_reason")),
    updated_at: new Date().toISOString(),
  };
  if (contactId) row.contact_id = contactId;

  if (id) {
    const { error } = await supabase.from("deals").update(row).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    // company van het contact overnemen zodat de deal ook bij het bedrijf telt
    const { data: contact } = await supabase
      .from("contacts")
      .select("company_id")
      .eq("id", contactId)
      .maybeSingle<{ company_id: string | null }>();
    const { error } = await supabase
      .from("deals")
      .insert({ ...row, company_id: contact?.company_id ?? null });
    if (error) return { ok: false, error: error.message };
  }

  revalidateCrm();
  return { ok: true };
}

/** Deal naar een andere pijplijnfase; won/lost zetten status en datum automatisch. */
export async function moveDealStage(id: string, stageKey: StageKey): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };
  if (!STAGE_KEYS.includes(stageKey)) return { ok: false, error: "invalid_input" };

  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    stage_key: stageKey,
    stage_entered_at: now,
    status: stageKey === "won" ? "won" : stageKey === "lost" ? "lost" : "open",
    won_at: stageKey === "won" ? now : null,
    lost_at: stageKey === "lost" ? now : null,
    updated_at: now,
  };

  const { error } = await supabase.from("deals").update(row).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

// ── Activiteiten / taken ─────────────────────────────────────────

export async function saveActivity(formData: FormData): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };

  const type = str(formData, "type") as ActivityType;
  const title = str(formData, "title");
  if (!title || !ACTIVITY_TYPES.includes(type)) return { ok: false, error: "invalid_input" };

  const dueAt = str(formData, "due_at");
  const { error } = await supabase.from("activities").insert({
    type,
    title,
    body: orNull(str(formData, "body")),
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
    contact_id: orNull(str(formData, "contact_id")),
    deal_id: orNull(str(formData, "deal_id")),
  });
  if (error) return { ok: false, error: error.message };

  revalidateCrm();
  return { ok: true };
}

export async function setActivityDone(id: string, done: boolean): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };
  const { error } = await supabase
    .from("activities")
    .update({ done_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateCrm();
  return { ok: true };
}

// ── Lead-conversie (klassieke CRM-flow: aanvraag → contact + deal) ──

export async function convertLead(leadId: string): Promise<ActionResult> {
  const { error: guardError, supabase } = await guard();
  if (!supabase) return { ok: false, error: guardError };

  // Al geconverteerd? Dan niet dubbel aanmaken.
  const { data: existing } = await supabase
    .from("contacts")
    .select("id")
    .eq("lead_id", leadId)
    .maybeSingle<{ id: string }>();
  if (existing) return { ok: false, error: "already_converted" };

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, full_name, phone, email, business_name, service, message, source")
    .eq("id", leadId)
    .maybeSingle<{
      id: string;
      full_name: string;
      phone: string | null;
      email: string | null;
      business_name: string | null;
      service: string;
      message: string;
      source: string | null;
    }>();
  if (leadError) return { ok: false, error: leadError.message };
  if (!lead) return { ok: false, error: "not_found" };

  // Bedrijf aanmaken of hergebruiken op naam
  let companyId: string | null = null;
  if (lead.business_name) {
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", lead.business_name)
      .maybeSingle<{ id: string }>();
    if (company) {
      companyId = company.id;
    } else {
      const { data: created, error: companyError } = await supabase
        .from("companies")
        .insert({ name: lead.business_name })
        .select("id")
        .maybeSingle<{ id: string }>();
      if (companyError) return { ok: false, error: companyError.message };
      companyId = created?.id ?? null;
    }
  }

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .insert({
      full_name: lead.full_name,
      phone: lead.phone,
      email: lead.email,
      company_id: companyId,
      source: lead.source === "chatbot" ? "chatbot" : "website",
      lead_id: lead.id,
      notes: lead.message,
    })
    .select("id")
    .maybeSingle<{ id: string }>();
  if (contactError) return { ok: false, error: contactError.message };
  if (!contact) return { ok: false, error: "insert_failed" };

  // Deal in fase "new", met de dienst als leesbare titel
  const lang = await getAdminLang();
  const d = getDict(lang);
  const serviceLabel =
    d.leads.services[lead.service as keyof typeof d.leads.services] ?? lead.service;
  const { error: dealError } = await supabase.from("deals").insert({
    title: `${serviceLabel} — ${lead.full_name}`,
    contact_id: contact.id,
    company_id: companyId,
  });
  if (dealError) return { ok: false, error: dealError.message };

  // Status van de aanvraag bijwerken zodat de flow zichtbaar is
  await supabase.from("leads").update({ status: "contacted" }).eq("id", leadId).eq("status", "new");

  revalidateCrm();
  return { ok: true };
}
