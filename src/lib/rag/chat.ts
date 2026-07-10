import "server-only";
import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { leadSchema, SERVICE_OPTIONS, TIME_OPTIONS } from "@/lib/leads/validation";
import { retrieve, buildContext } from "./retrieve";
import { getModelConfig, getActivePrompt } from "./config";
import { streamChat, isOpenRouterConfigured, type ChatMessage } from "./generate";

/**
 * Het centrale brein van de chatbot — onafhankelijk van het kanaal.
 * - handleChatTurn → streaming antwoord (chatpagina/widget)
 * - getReplyText   → volledig tekstantwoord (niet-streamende kanalen)
 * Beide gebruiken hetzelfde prepareTurn.
 */

const HISTORY_LIMIT = 12;

const NOT_CONFIGURED: Record<string, string> = {
  nl: "De chatservice is nog niet geconfigureerd. Probeer het later opnieuw of vul het adviesaanvraag-formulier in.",
  en: "The chat service is not configured yet. Please try again later or fill in the consultation request form.",
  fa: "سرویس گفتگو هنوز پیکربندی نشده است. لطفاً بعداً دوباره امتحان کنید یا فرم درخواست مشاوره را پر کنید.",
};

export type ChatTurnInput = {
  conversationId?: string | null;
  channel?: string;
  externalUserId?: string | null;
  userMessage: string;
  locale?: string;
};

type Source = { title: string; similarity: number; chunk_index: number };
type PreparedTurn = {
  result: ReturnType<typeof streamChat> | null;
  conversationId: string | null;
  sources: Source[];
  fallbackText?: string;
};

async function prepareTurn(input: ChatTurnInput): Promise<PreparedTurn> {
  const supabase = getSupabaseAdmin();
  const channel = input.channel ?? "web";
  const locale = input.locale ?? "nl";

  if (!isOpenRouterConfigured()) {
    return {
      result: null,
      conversationId: input.conversationId ?? null,
      sources: [],
      fallbackText: NOT_CONFIGURED[locale] ?? NOT_CONFIGURED.nl,
    };
  }

  // 1) conversation
  let conversationId = input.conversationId ?? null;
  if (supabase) {
    if (!conversationId) {
      const { data } = await supabase
        .from("conversations")
        .insert({ channel, status: "open", external_user_id: input.externalUserId ?? null })
        .select("id")
        .single();
      conversationId = data?.id ?? null;
    } else {
      await supabase.from("conversations").update({ last_at: new Date().toISOString() }).eq("id", conversationId);
    }
    if (conversationId) {
      await supabase.from("messages").insert({ conversation_id: conversationId, role: "user", content: input.userMessage });
    }
  }

  // 2) geschiedenis
  let history: ChatMessage[] = [];
  if (supabase && conversationId) {
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(HISTORY_LIMIT * 2);
    history = (data ?? [])
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  }
  if (history.length === 0 || history[history.length - 1].content !== input.userMessage) {
    history.push({ role: "user", content: input.userMessage });
  }

  // 3) RAG-retrieval
  const chunks = await retrieve(input.userMessage);
  const context = buildContext(chunks);
  const retrievedChunkIds = chunks.map((c) => c.id);

  // 4) system prompt + context
  const basePrompt = await getActivePrompt();
  const system = context
    ? `${basePrompt}\n\n# Opgehaalde bronnen\nGebruik voor je antwoord uitsluitend de bronnen hieronder. Staat het antwoord er niet in, zeg dat dan eerlijk en nodig de gebruiker uit een adviesaanvraag in te dienen.\n\n${context}`
    : `${basePrompt}\n\n(Er is geen relevante bron gevonden in de kennisbank. Zeg eerlijk dat je het niet zeker weet en verwijs naar het adviesaanvraag-formulier.)`;

  // 5) model + tools
  const modelCfg = await getModelConfig(channel);
  const tools = buildTools(supabase, conversationId, locale);

  // 6) streaming generatie (persist in onFinish)
  const result = streamChat({
    model: modelCfg.active_model,
    system,
    messages: history,
    temperature: modelCfg.temperature,
    topP: modelCfg.top_p,
    maxOutputTokens: modelCfg.max_tokens,
    tools,
    onFinish: async ({ text, usage, model }) => {
      if (supabase && conversationId && text) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "assistant",
          content: text,
          model_used: model,
          tokens_in: usage?.inputTokens ?? null,
          tokens_out: usage?.outputTokens ?? null,
          retrieved_chunk_ids: retrievedChunkIds.length ? retrievedChunkIds : null,
        });
      }
    },
  });

  const sources: Source[] = chunks.map((c) => ({
    title: c.title,
    similarity: Math.round(c.similarity * 100) / 100,
    chunk_index: c.chunk_index,
  }));

  return { result, conversationId, sources };
}

/** Streaming antwoord (chatpagina/widget). Metadata in header x-sana-meta (base64). */
export async function handleChatTurn(input: ChatTurnInput): Promise<Response> {
  const p = await prepareTurn(input);
  if (!p.result) return fallbackResponse(p.fallbackText ?? NOT_CONFIGURED.nl);
  return p.result.toTextStreamResponse({
    headers: { "x-sana-meta": toBase64({ conversationId: p.conversationId, sources: p.sources }) },
  });
}

/** Volledig tekstantwoord (voor niet-streamende kanalen). */
export async function getReplyText(
  input: ChatTurnInput
): Promise<{ text: string; conversationId: string | null; sources: Source[] }> {
  const p = await prepareTurn(input);
  if (!p.result) return { text: p.fallbackText ?? NOT_CONFIGURED.nl, conversationId: p.conversationId, sources: [] };
  const text = await p.result.text;
  return { text: text || "—", conversationId: p.conversationId, sources: p.sources };
}

// ── Tool: adviesaanvraag registreren ────────────────────────────
function buildTools(
  supabase: SupabaseClient | null,
  conversationId: string | null,
  locale: string
): ToolSet {
  return {
    capture_lead: tool({
      description:
        "Registreer een adviesaanvraag (lead) zodra de gebruiker klaar is voor een gesprek en de benodigde gegevens heeft gegeven. Roep dit alleen aan als minimaal naam, telefoonnummer, gewenste dienst en een korte omschrijving bekend zijn.",
      inputSchema: z.object({
        full_name: z.string().describe("Voor- en achternaam van de gebruiker"),
        phone: z.string().describe("Telefoonnummer van de gebruiker"),
        service: z.enum(SERVICE_OPTIONS).describe(
          "Gewenste dienst: bouwkundig-advies, energieadvies, ai-consultancy, procesautomatisering of anders"
        ),
        message: z.string().describe("Korte omschrijving van de vraag of het project"),
        business_name: z.string().optional().describe("Bedrijfs- of organisatienaam (optioneel)"),
        email: z.string().optional().describe("E-mailadres (optioneel)"),
        preferred_time: z.enum(TIME_OPTIONS).optional().describe("Voorkeurstijd voor contact (optioneel)"),
      }),
      execute: async (args) => {
        if (!supabase) return { ok: false, message: "Registreren is tijdelijk niet mogelijk." };
        const parsed = leadSchema.safeParse(args);
        if (!parsed.success) {
          return { ok: false, message: "Gegevens zijn onvolledig of ongeldig; vraag de gebruiker om aanvulling." };
        }
        const d = parsed.data;
        const { error } = await supabase.from("leads").insert({
          full_name: d.full_name,
          phone: d.phone,
          email: d.email || null,
          business_name: d.business_name || null,
          service: d.service,
          message: d.message,
          preferred_time: d.preferred_time || null,
          locale,
          status: "new",
          source: "chatbot",
          conversation_id: conversationId,
        });
        if (error) {
          console.error("[capture_lead] fout:", error.message);
          return { ok: false, message: "Er ging iets mis bij het registreren." };
        }
        return {
          ok: true,
          message:
            "De adviesaanvraag is geregistreerd. Sana Archicons neemt binnen 24 uur (op werkdagen) contact op.",
        };
      },
    }),
  };
}

function fallbackResponse(message: string): Response {
  return new Response(message, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-sana-meta": toBase64({ conversationId: null, sources: [] }),
    },
  });
}

function toBase64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");
}
