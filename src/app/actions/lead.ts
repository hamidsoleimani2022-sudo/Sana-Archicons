"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  leadSchema,
  type SubmitResult,
  type LeadFieldErrors,
  type LeadInput,
} from "@/lib/leads/validation";

/**
 * Server action: adviesaanvraag opslaan.
 * 1) Servervalidatie met hetzelfde schema als de client.
 * 2) Insert in de leads-tabel in Supabase.
 * 3) Veilige fallback: zonder Supabase-configuratie wordt de aanvraag gelogd
 *    zodat het formulier blijft werken tijdens ontwikkeling.
 * Foutcodes (geen teksten) gaan terug; de client vertaalt ze via next-intl.
 */
export async function submitLead(input: LeadInput, locale: string): Promise<SubmitResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: LeadFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof LeadInput;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const data = parsed.data;

  const row = {
    full_name: data.full_name,
    phone: data.phone,
    email: data.email || null,
    business_name: data.business_name || null,
    service: data.service,
    message: data.message,
    preferred_time: data.preferred_time || null,
    locale: locale === "en" ? "en" : "nl",
    status: "new" as const,
    source: "website" as const,
  };

  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from("leads").insert(row);
    if (error) {
      console.error("[submitLead] insert-fout:", error.message);
      return { ok: false, formError: "submit_failed" };
    }
  } else {
    // Fallback zolang Supabase-keys ontbreken: loggen zodat niets verloren gaat
    console.warn(
      "[submitLead] Supabase niet geconfigureerd — aanvraag gelogd (fallback):\n",
      JSON.stringify(row, null, 2)
    );
  }

  return { ok: true };
}
