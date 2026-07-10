"use server";

import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  ingestDocument,
  deleteDocument,
  reindexDocument,
} from "@/lib/rag/ingest";
import { retrieve, type RetrievedChunk } from "@/lib/rag/retrieve";

type ActionResult = { ok: boolean; message?: string };

function parseTags(raw: string | null | undefined): string[] | undefined {
  if (!raw) return undefined;
  const tags = raw.split(/[,،]/).map((t) => t.trim()).filter(Boolean);
  return tags.length ? tags : undefined;
}

// ── Kennisbank ──────────────────────────────────────────────────
export async function ingestTextAction(
  title: string,
  text: string,
  tagsRaw?: string
): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  if (!title.trim() || text.trim().length < 20) {
    return { ok: false, message: "Titel en tekst (minimaal 20 tekens) zijn vereist." };
  }
  const res = await ingestDocument({
    type: "text",
    title: title.trim(),
    text,
    tags: parseTags(tagsRaw),
  });
  revalidatePath("/admin/knowledge");
  return res.ok
    ? { ok: true, message: `OK (${res.chunkCount})` }
    : { ok: false, message: res.error };
}

export async function ingestUrlAction(
  url: string,
  title?: string,
  tagsRaw?: string
): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  if (!/^https?:\/\//i.test(url.trim())) {
    return { ok: false, message: "URL is niet geldig." };
  }
  const res = await ingestDocument({
    type: "url",
    url: url.trim(),
    title: title?.trim(),
    tags: parseTags(tagsRaw),
  });
  revalidatePath("/admin/knowledge");
  return res.ok
    ? { ok: true, message: `OK (${res.chunkCount})` }
    : { ok: false, message: res.error };
}

/** Upload van meerdere bestanden (md/txt/csv/json/yaml/html/pdf) met gedeelde tags. */
export async function ingestFilesAction(formData: FormData): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const tags = parseTags(formData.get("tags") as string | null);
  if (files.length === 0) return { ok: false, message: "Geen bestand gekozen." };

  let okCount = 0;
  const failed: string[] = [];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      failed.push(`${file.name} (te groot)`);
      continue;
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const title = file.name.replace(/\.[^.]+$/, "");
    const res = await ingestDocument({ type: "file", title, filename: file.name, buffer, tags });
    if (res.ok) okCount++;
    else failed.push(file.name);
  }
  revalidatePath("/admin/knowledge");
  if (failed.length === 0) return { ok: true, message: `OK (${okCount})` };
  return {
    ok: okCount > 0,
    message: `${okCount} OK; ${failed.length} ✗: ${failed.join(", ").slice(0, 200)}`,
  };
}

export async function deleteDocAction(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  const res = await deleteDocument(id);
  revalidatePath("/admin/knowledge");
  return res.ok ? { ok: true, message: "OK" } : { ok: false, message: res.error };
}

export async function reindexDocAction(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  const res = await reindexDocument(id);
  revalidatePath("/admin/knowledge");
  return res.ok
    ? { ok: true, message: `OK (${res.chunkCount})` }
    : { ok: false, message: res.error };
}

export async function testSearchAction(
  query: string
): Promise<{ ok: boolean; chunks?: RetrievedChunk[]; message?: string }> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  if (!query.trim()) return { ok: false, message: "Lege zoekopdracht." };
  try {
    const chunks = await retrieve(query.trim());
    return { ok: true, chunks };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ── Model- en embedding-configuratie ────────────────────────────
export async function saveModelConfigAction(values: {
  active_model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  fallback_model: string | null;
}): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, message: "not_configured" };

  const { data: existing } = await supabase
    .from("model_config")
    .select("id")
    .eq("channel", "web")
    .maybeSingle();

  const payload = { ...values, channel: "web", updated_at: new Date().toISOString() };
  const { error } = existing
    ? await supabase.from("model_config").update(payload).eq("id", existing.id)
    : await supabase.from("model_config").insert(payload);

  revalidatePath("/admin/models");
  return error ? { ok: false, message: error.message } : { ok: true, message: "OK" };
}

export async function saveEmbeddingConfigAction(values: {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  similarity_threshold: number;
}): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, message: "not_configured" };

  const { data: existing } = await supabase
    .from("embedding_config")
    .select("id")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const payload = { ...values, updated_at: new Date().toISOString() };
  const { error } = existing
    ? await supabase.from("embedding_config").update(payload).eq("id", existing.id)
    : await supabase.from("embedding_config").insert(payload);

  revalidatePath("/admin/models");
  return error ? { ok: false, message: error.message } : { ok: true, message: "OK" };
}

// ── Detail van een gesprek (berichten + RAG-bronnen per antwoord) ─
export type ConvMessage = {
  id: string;
  role: string;
  content: string;
  model_used: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
  retrieved: { title: string; content: string }[];
};

export async function getConversationDetailAction(
  conversationId: string
): Promise<{ ok: boolean; messages?: ConvMessage[]; message?: string }> {
  if (!(await isAuthed())) return { ok: false, message: "unauthorized" };
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, message: "not_configured" };

  const { data: msgs, error } = await supabase
    .from("messages")
    .select("id, role, content, model_used, tokens_in, tokens_out, retrieved_chunk_ids, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) return { ok: false, message: error.message };

  // Opgehaalde chunks verzamelen
  const allChunkIds = Array.from(
    new Set((msgs ?? []).flatMap((m) => (m.retrieved_chunk_ids as string[] | null) ?? []))
  );
  const chunkMap = new Map<string, { title: string; content: string }>();
  if (allChunkIds.length > 0) {
    const { data: chunks } = await supabase
      .from("chunks")
      .select("id, content, document_id")
      .in("id", allChunkIds);
    const docIds = Array.from(new Set((chunks ?? []).map((c) => c.document_id)));
    const { data: docs } = await supabase.from("documents").select("id, title").in("id", docIds);
    const titleMap = new Map((docs ?? []).map((d) => [d.id, d.title as string]));
    for (const c of chunks ?? []) {
      chunkMap.set(c.id, {
        title: titleMap.get(c.document_id) ?? "Document",
        content: (c.content as string).slice(0, 240),
      });
    }
  }

  const messages: ConvMessage[] = (msgs ?? []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    model_used: m.model_used,
    tokens_in: m.tokens_in,
    tokens_out: m.tokens_out,
    created_at: m.created_at,
    retrieved: ((m.retrieved_chunk_ids as string[] | null) ?? [])
      .map((id) => chunkMap.get(id))
      .filter(Boolean) as { title: string; content: string }[],
  }));

  return { ok: true, messages };
}
