import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { embedOne } from "./embeddings";
import { getEmbeddingConfig, type EmbeddingConfig } from "./config";

export type RetrievedChunk = {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  similarity: number;
  title: string;
};

/**
 * Retrieval: vraag embedden → vector-similariteitszoektocht (match_chunks)
 * → documenttitel erbij zoeken. Zonder embedding-key of database wordt een
 * lege lijst teruggegeven (de bot antwoordt dan zonder bronnen).
 */
export async function retrieve(
  query: string,
  config?: EmbeddingConfig
): Promise<RetrievedChunk[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const cfg = config ?? (await getEmbeddingConfig());

  let queryVector: number[];
  try {
    queryVector = await embedOne(query, "query", cfg);
  } catch (e) {
    console.error("[retrieve] embedding-fout:", (e as Error).message);
    return [];
  }

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryVector,
    match_count: cfg.top_k,
    similarity_threshold: cfg.similarity_threshold,
  });

  if (error) {
    console.error("[retrieve] match_chunks-fout:", error.message);
    return [];
  }

  const rows = (data ?? []) as Omit<RetrievedChunk, "title">[];
  if (rows.length === 0) return [];

  // Documenttitels toevoegen
  const docIds = Array.from(new Set(rows.map((r) => r.document_id)));
  const { data: docs } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", docIds);
  const titleMap = new Map((docs ?? []).map((d) => [d.id, d.title as string]));

  return rows.map((r) => ({
    ...r,
    title: titleMap.get(r.document_id) ?? "Document",
  }));
}

/** Contexttekst uit opgehaalde chunks bouwen voor injectie in het model. */
export function buildContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((c, i) => `[Bron ${i + 1} — "${c.title}"]\n${c.content}`)
    .join("\n\n---\n\n");
}
