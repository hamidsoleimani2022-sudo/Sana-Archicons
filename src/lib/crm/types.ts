/**
 * Typen van de CRM-module (naar het voorbeeld van klassieke CRM's:
 * lead → conversie → contact/bedrijf/deal; activiteiten op contact/deal).
 * Labels staan in lib/admin/i18n.ts zodat alles drietalig blijft.
 */

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  city: string | null;
  size_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactSource = "website" | "chatbot" | "manual";

export type Contact = {
  id: string;
  company_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  position: string | null;
  source: ContactSource;
  lead_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactWithCompany = Contact & {
  company: Pick<Company, "id" | "name"> | null;
  deals?: Array<{ count: number }>;
};

/** Vaste fase-sleutels; labels per taal via d.crm.stages. */
export const STAGE_KEYS = [
  "new",
  "qualifying",
  "meeting",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export type StageKey = (typeof STAGE_KEYS)[number];

export type PipelineStage = {
  key: StageKey;
  position: number;
  is_won: boolean;
  is_lost: boolean;
};

export type DealStatus = "open" | "won" | "lost";

export type Deal = {
  id: string;
  title: string;
  contact_id: string;
  company_id: string | null;
  stage_key: StageKey;
  status: DealStatus;
  amount_eur: number;
  expected_close: string | null;
  stage_entered_at: string;
  won_at: string | null;
  lost_at: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type DealWithContact = Deal & {
  contact: Pick<Contact, "id" | "full_name"> | null;
};

export type ActivityType = "call" | "meeting" | "note" | "task";

export type Activity = {
  id: string;
  contact_id: string | null;
  deal_id: string | null;
  type: ActivityType;
  title: string;
  body: string | null;
  due_at: string | null;
  done_at: string | null;
  created_at: string;
};

export type ActivityWithRefs = Activity & {
  contact: Pick<Contact, "id" | "full_name"> | null;
  deal: Pick<Deal, "id" | "title"> | null;
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  call: "📞",
  meeting: "🤝",
  note: "📝",
  task: "✅",
};

// ── Agent CRM ────────────────────────────────────────────────────

export type AgentSeverity = "high" | "medium" | "low";

export type AgentInsightKind = "overdueTask" | "dueSoon" | "staleDeal" | "noNextStep" | "newLead";

/**
 * Melding/advies van de Agent CRM. `params` bevat ruwe waarden
 * (titel, ISO-datum, dagen, fase-sleutel); de UI vertaalt en formatteert.
 */
export type AgentInsight = {
  kind: AgentInsightKind;
  severity: AgentSeverity;
  href: string;
  params: { title?: string; dateIso?: string; days?: number; stageKey?: StageKey; name?: string };
};

/** Vult "{placeholders}" in een vertaalsjabloon in. */
export function fillTemplate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? "");
}
