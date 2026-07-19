import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AgentInsight, StageKey } from "@/lib/crm/types";

/**
 * Agent CRM — de bewakingslaag van het admin panel.
 * 1. getAgentInsights(): regelgebaseerde meldingen/adviezen (deadlines,
 *    stilgevallen deals, aanvragen zonder opvolging). Werkt zonder AI-sleutel.
 * 2. buildAgentContext(): compacte tekstsamenvatting van de live CRM-data
 *    als context voor de AI-chat van de agent.
 */

const STALE_DEAL_DAYS = 7; // deal zo lang in dezelfde fase ⇒ advies
const LEAD_WAIT_DAYS = 2; // nieuwe aanvraag zo lang onbeantwoord ⇒ urgent

const DAY_MS = 86_400_000;

export async function getAgentInsights(): Promise<AgentInsight[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const in48hIso = new Date(now + 48 * 3_600_000).toISOString();

  const [tasksRes, dealsRes, dealTasksRes, leadsRes] = await Promise.all([
    // open taken met een deadline binnen 48 uur of al verlopen
    supabase
      .from("activities")
      .select("id, title, due_at")
      .is("done_at", null)
      .not("due_at", "is", null)
      .lt("due_at", in48hIso)
      .order("due_at")
      .limit(20),
    supabase.from("deals").select("id, title, stage_key, stage_entered_at").eq("status", "open"),
    // welke deals hebben nog een openstaande activiteit?
    supabase.from("activities").select("deal_id").is("done_at", null).not("deal_id", "is", null),
    supabase
      .from("leads")
      .select("id, full_name, created_at")
      .eq("status", "new")
      .order("created_at")
      .limit(20),
  ]);

  const insights: AgentInsight[] = [];

  for (const task of (tasksRes.data ?? []) as Array<{ id: string; title: string; due_at: string }>) {
    const overdue = task.due_at < nowIso;
    insights.push({
      kind: overdue ? "overdueTask" : "dueSoon",
      severity: overdue ? "high" : "medium",
      href: "/admin/crm/activities",
      params: { title: task.title, dateIso: task.due_at },
    });
  }

  const dealsWithNextStep = new Set(
    ((dealTasksRes.data ?? []) as Array<{ deal_id: string }>).map((a) => a.deal_id)
  );
  for (const deal of (dealsRes.data ?? []) as Array<{
    id: string;
    title: string;
    stage_key: StageKey;
    stage_entered_at: string;
  }>) {
    const days = Math.floor((now - new Date(deal.stage_entered_at).getTime()) / DAY_MS);
    if (days >= STALE_DEAL_DAYS) {
      insights.push({
        kind: "staleDeal",
        severity: "medium",
        href: "/admin/crm/deals",
        params: { title: deal.title, days, stageKey: deal.stage_key },
      });
    } else if (!dealsWithNextStep.has(deal.id)) {
      insights.push({
        kind: "noNextStep",
        severity: "low",
        href: "/admin/crm/deals",
        params: { title: deal.title },
      });
    }
  }

  for (const lead of (leadsRes.data ?? []) as Array<{
    id: string;
    full_name: string;
    created_at: string;
  }>) {
    const days = Math.floor((now - new Date(lead.created_at).getTime()) / DAY_MS);
    if (days >= LEAD_WAIT_DAYS) {
      insights.push({
        kind: "newLead",
        severity: "high",
        href: "/admin/leads",
        params: { name: lead.full_name, days },
      });
    }
  }

  const order: Record<AgentInsight["severity"], number> = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => order[a.severity] - order[b.severity]);
  return insights;
}

/** Compacte CRM-samenvatting (platte tekst) als context voor de agent-chat. */
export async function buildAgentContext(): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return "Er is nog geen databaseverbinding; er zijn geen live CRM-gegevens beschikbaar.";
  }

  const [leadsRes, dealsRes, tasksRes, contactsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("full_name, service, status, created_at")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("deals")
      .select("title, stage_key, status, amount_eur, expected_close")
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("activities")
      .select("title, type, due_at, done_at")
      .is("done_at", null)
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(15),
    supabase.from("contacts").select("id", { count: "exact", head: true }),
  ]);

  const lines: string[] = [];
  lines.push(`Aantal contacten in het CRM: ${contactsRes.count ?? 0}`);

  lines.push("\nRecente adviesaanvragen (leads):");
  const leads = (leadsRes.data ?? []) as Array<{
    full_name: string;
    service: string;
    status: string;
    created_at: string;
  }>;
  if (leads.length === 0) lines.push("- geen");
  for (const lead of leads) {
    lines.push(
      `- ${lead.full_name} · dienst: ${lead.service} · status: ${lead.status} · ingediend: ${lead.created_at.slice(0, 10)}`
    );
  }

  lines.push("\nDeals in de pijplijn:");
  const deals = (dealsRes.data ?? []) as Array<{
    title: string;
    stage_key: string;
    status: string;
    amount_eur: number;
    expected_close: string | null;
  }>;
  if (deals.length === 0) lines.push("- geen");
  for (const deal of deals) {
    lines.push(
      `- ${deal.title} · fase: ${deal.stage_key} · status: ${deal.status} · €${deal.amount_eur}` +
        (deal.expected_close ? ` · verwachte afronding: ${deal.expected_close}` : "")
    );
  }

  lines.push("\nOpenstaande taken/activiteiten:");
  const tasks = (tasksRes.data ?? []) as Array<{
    title: string;
    type: string;
    due_at: string | null;
  }>;
  if (tasks.length === 0) lines.push("- geen");
  for (const task of tasks) {
    lines.push(
      `- [${task.type}] ${task.title}` + (task.due_at ? ` · deadline: ${task.due_at.slice(0, 16)}` : "")
    );
  }

  return lines.join("\n");
}
