import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getModelConfig } from "@/lib/rag/config";
import { isOpenRouterConfigured, streamChat, type ChatMessage } from "@/lib/rag/generate";
import { buildAgentContext } from "@/lib/crm/agent";

export const dynamic = "force-dynamic";

/**
 * Chat-endpoint van de Agent CRM (alleen voor ingelogde beheerders).
 * Gebruikt hetzelfde OpenRouter-model als de chatbot en krijgt de live
 * CRM-samenvatting als context mee. Antwoord wordt als tekst gestreamd.
 */
export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isOpenRouterConfigured()) {
    return NextResponse.json({ error: "ai_not_configured" }, { status: 503 });
  }

  let messages: ChatMessage[];
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    messages = (body.messages ?? []).filter(
      (m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
    );
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (messages.length === 0) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const lang = await getAdminLang();
  const [config, context] = await Promise.all([getModelConfig(), buildAgentContext()]);

  const langName = lang === "nl" ? "Nederlands" : lang === "fa" ? "Perzisch (Farsi)" : "Engels";
  const system = `Je bent de Agent CRM van het admin panel van Sana Archicons (advies- en consultancybureau van Hamid Soleimani: bouwkundig advies, energieadvies, AI-consultancy en procesautomatisering).

Jouw taak: de beheerder helpen met klantopvolging, prioriteiten, taken/deadlines en de verkooppijplijn. Geef korte, concrete en uitvoerbare adviezen (wie eerst bellen, welke taak eerst, welke deal aandacht nodig heeft). Baseer je uitsluitend op de onderstaande live CRM-gegevens; verzin niets. Als iets niet in de gegevens staat, zeg dat eerlijk.

Antwoord in het ${langName}.

── Live CRM-gegevens ──
${context}`;

  const result = streamChat({
    model: config.active_model,
    system,
    messages: messages.slice(-12),
    temperature: 0.3,
    topP: 1,
    maxOutputTokens: 700,
  });

  return result.toTextStreamResponse();
}
