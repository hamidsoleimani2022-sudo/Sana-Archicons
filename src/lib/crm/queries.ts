import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ActivityWithRefs,
  Company,
  ContactWithCompany,
  DealWithContact,
} from "@/lib/crm/types";

/**
 * Leesqueries van de CRM-module. Zelfde patroon als de rest van het panel:
 * { data, error } — zonder Supabase-verbinding een "not_configured"-code
 * die de UI per taal vertaalt.
 */

type Result<T> = { data: T; error: string | null };

const NO_DB = "not_configured";

export async function getContacts(): Promise<Result<ContactWithCompany[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { data: [], error: NO_DB };
  const { data, error } = await supabase
    .from("contacts")
    .select("*, company:companies(id, name), deals(count)")
    .order("created_at", { ascending: false });
  return { data: (data as unknown as ContactWithCompany[]) ?? [], error: error?.message ?? null };
}

export type CompanyWithCounts = Company & { contact_count: number; deal_count: number };

export async function getCompanies(): Promise<Result<CompanyWithCounts[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { data: [], error: NO_DB };
  const { data, error } = await supabase
    .from("companies")
    .select("*, contacts(count), deals(count)")
    .order("created_at", { ascending: false });
  if (error) return { data: [], error: error.message };
  const rows = (
    (data as unknown as Array<
      Company & { contacts: Array<{ count: number }>; deals: Array<{ count: number }> }
    >) ?? []
  ).map(({ contacts, deals, ...company }) => ({
    ...company,
    contact_count: contacts?.[0]?.count ?? 0,
    deal_count: deals?.[0]?.count ?? 0,
  }));
  return { data: rows, error: null };
}

export async function getDeals(): Promise<Result<DealWithContact[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { data: [], error: NO_DB };
  const { data, error } = await supabase
    .from("deals")
    .select("*, contact:contacts(id, full_name)")
    .order("created_at", { ascending: false });
  return { data: (data as unknown as DealWithContact[]) ?? [], error: error?.message ?? null };
}

export async function getActivities(): Promise<Result<ActivityWithRefs[]>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { data: [], error: NO_DB };
  const { data, error } = await supabase
    .from("activities")
    .select("*, contact:contacts(id, full_name), deal:deals(id, title)")
    .order("created_at", { ascending: false })
    .limit(300);
  return { data: (data as unknown as ActivityWithRefs[]) ?? [], error: error?.message ?? null };
}

/** Compacte CRM-cijfers voor de dashboardkaarten. */
export type CrmSummary = {
  contacts: number;
  openDeals: number;
  pipelineValueEur: number;
  openTasks: number;
  overdueTasks: number;
};

export async function getCrmSummary(): Promise<CrmSummary | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const nowIso = new Date().toISOString();
  const [contactsRes, dealsRes, openTasksRes, overdueRes] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("deals").select("amount_eur").eq("status", "open"),
    supabase.from("activities").select("id", { count: "exact", head: true }).is("done_at", null),
    supabase
      .from("activities")
      .select("id", { count: "exact", head: true })
      .is("done_at", null)
      .lt("due_at", nowIso),
  ]);
  const openDeals = (dealsRes.data as Array<{ amount_eur: number }> | null) ?? [];
  return {
    contacts: contactsRes.count ?? 0,
    openDeals: openDeals.length,
    pipelineValueEur: openDeals.reduce((s, deal) => s + (deal.amount_eur ?? 0), 0),
    openTasks: openTasksRes.count ?? 0,
    overdueTasks: overdueRes.count ?? 0,
  };
}
