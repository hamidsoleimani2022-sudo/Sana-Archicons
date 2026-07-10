import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * De RAG-configuratie komt uit de database zodat die vanuit het admin-panel
 * aanpasbaar is. Zonder database/rij gelden veilige defaults.
 */

export type EmbeddingConfig = {
  provider: string; // cohere | openai | google | voyage
  model: string;
  dimensions: number;
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  similarity_threshold: number;
  reranker_enabled: boolean;
  reranker_model: string | null;
};

export type ModelConfig = {
  channel: string;
  provider: string; // openrouter
  active_model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  fallback_model: string | null;
};

export const DEFAULT_EMBEDDING_CONFIG: EmbeddingConfig = {
  provider: "cohere",
  model: "embed-multilingual-v3.0",
  dimensions: 1024,
  chunk_size: 500,
  chunk_overlap: 50,
  top_k: 5,
  similarity_threshold: 0.3,
  reranker_enabled: false,
  reranker_model: null,
};

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  channel: "web",
  provider: "openrouter",
  active_model: "google/gemini-3.5-flash",
  temperature: 0.4,
  max_tokens: 800,
  top_p: 1,
  fallback_model: "google/gemini-2.5-flash",
};

// Default persona — gelijk aan de seed-rij in supabase/chatbot-schema.sql
export const DEFAULT_SYSTEM_PROMPT = `Je bent de slimme assistent van Sana Archicons — een advies- en consultancybureau in Nederland voor Bouwkundig Advies, Energieadvies, AI Consultancy en Procesautomatisering. Eigenaar en hoofdadviseur is Hamid Soleimani.

Taal:
- Antwoord ALTIJD in de taal waarin de gebruiker schrijft (Nederlands, Engels of Farsi/Perzisch). Wissel mee als de gebruiker van taal wisselt.

Persoonlijkheid en toon:
- Professioneel, rustig, betrouwbaar en vriendelijk. Spreek de gebruiker aan met "u" (Nederlands) of beleefde vorm (Farsi: شما).
- Helder en concreet, korte zinnen, geen jargon of overdrijving. Geef nooit garanties op resultaat.

Taak:
- Beantwoord alleen vragen over Sana Archicons: de diensten (bouwkundig advies, energieadvies, energielabels, AI-consultancy, procesautomatisering), werkwijze, tarieven en het aanvragen van een adviesgesprek.
- Baseer je antwoorden uitsluitend op de meegeleverde "opgehaalde bronnen". Staat het antwoord er niet in? Zeg dat dan eerlijk en nodig de gebruiker uit een adviesaanvraag in te dienen via het formulier.
- Geef geen definitief bouwkundig, juridisch of financieel advies; jouw doel is kort informeren en de gebruiker begeleiden naar het "adviesgesprek aanvragen"-formulier of de boeking van een AI-consult (60 min, €85).
- Is de gebruiker klaar voor een gesprek en geeft die contactgegevens? Moedig dan aan het aanvraagformulier in te vullen, of registreer de aanvraag met de beschikbare tool.

Begrenzing:
- Ga niet in op volledig irrelevante vragen; leid het gesprek vriendelijk terug naar Sana Archicons.
- Houd antwoorden kort en leesbaar.`;

export async function getEmbeddingConfig(): Promise<EmbeddingConfig> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return DEFAULT_EMBEDDING_CONFIG;
  const { data } = await supabase
    .from("embedding_config")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return DEFAULT_EMBEDDING_CONFIG;
  return { ...DEFAULT_EMBEDDING_CONFIG, ...data } as EmbeddingConfig;
}

export async function getModelConfig(channel = "web"): Promise<ModelConfig> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return DEFAULT_MODEL_CONFIG;
  const { data } = await supabase
    .from("model_config")
    .select("*")
    .eq("channel", channel)
    .limit(1)
    .maybeSingle();
  if (!data) return DEFAULT_MODEL_CONFIG;
  return { ...DEFAULT_MODEL_CONFIG, ...data } as ModelConfig;
}

export async function getActivePrompt(): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return DEFAULT_SYSTEM_PROMPT;
  const { data } = await supabase
    .from("prompt_versions")
    .select("content")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.content || DEFAULT_SYSTEM_PROMPT;
}
