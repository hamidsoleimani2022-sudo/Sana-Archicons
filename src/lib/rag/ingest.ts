import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { embed } from "./embeddings";
import { splitText, cleanText } from "./chunking";
import { getEmbeddingConfig } from "./config";

/**
 * Ingestion-pijplijn: tekst uit bron halen → opschonen → chunken → embedden
 * → opslaan in pgvector.
 */

export type IngestSource =
  | { type: "text"; title: string; text: string; tags?: string[] }
  | { type: "url"; title?: string; url: string; tags?: string[] }
  | { type: "pdf"; title: string; buffer: Buffer; tags?: string[] }
  // Generiek bestand; formaat wordt bepaald op extensie (md/txt/csv/json/yaml/html/pdf)
  | { type: "file"; title: string; filename: string; buffer: Buffer; tags?: string[] };

export const SUPPORTED_FILE_EXTENSIONS = [
  ".md", ".markdown", ".txt", ".csv", ".json", ".yaml", ".yml", ".html", ".htm", ".pdf",
];

export type IngestResult = {
  ok: boolean;
  documentId?: string;
  chunkCount?: number;
  error?: string;
};

export async function ingestDocument(source: IngestSource): Promise<IngestResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Geen Supabase-verbinding." };

  // 1) tekst extraheren
  let title: string;
  let text: string;
  let sourceUrl: string | null = null;
  let sourceType: string = source.type;
  try {
    if (source.type === "text") {
      title = source.title;
      text = source.text;
    } else if (source.type === "url") {
      sourceUrl = source.url;
      const extracted = await extractFromUrl(source.url);
      title = source.title || extracted.title || source.url;
      text = extracted.text;
    } else if (source.type === "pdf") {
      title = source.title;
      text = await extractFromPdf(source.buffer);
    } else {
      // type === "file" — formaat op basis van extensie
      title = source.title;
      const ext = extOf(source.filename);
      sourceType = ext.replace(".", "") || "file";
      text = await extractByExtension(source.filename, source.buffer);
    }
  } catch (e) {
    return { ok: false, error: `Tekst extraheren mislukt: ${(e as Error).message}` };
  }

  text = cleanText(text);
  if (!text || text.length < 20) {
    return { ok: false, error: "De bron bevatte te weinig bruikbare tekst." };
  }

  // 2) documentrij aanmaken (status=processing)
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .insert({
      title,
      source_type: sourceType,
      source_url: sourceUrl,
      status: "processing",
      tags: source.tags ?? null,
    })
    .select("id")
    .single();
  if (docErr || !doc) {
    return { ok: false, error: docErr?.message ?? "Document aanmaken mislukt." };
  }
  const documentId = doc.id as string;

  try {
    // 3) chunken
    const cfg = await getEmbeddingConfig();
    const chunks = splitText(text, cfg.chunk_size, cfg.chunk_overlap);
    if (chunks.length === 0) throw new Error("Er zijn geen chunks geproduceerd.");

    // 4) embedden (batches van max ~90 wegens Cohere-limiet van 96)
    const allVectors: number[][] = [];
    const BATCH = 90;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH).map((c) => c.content);
      const vectors = await embed(batch, "document", cfg);
      allVectors.push(...vectors);
    }

    // 5) chunks opslaan
    const rows = chunks.map((c, i) => ({
      document_id: documentId,
      content: c.content,
      embedding: allVectors[i],
      token_count: c.tokenCount,
      chunk_index: c.index,
    }));
    const { error: chunkErr } = await supabase.from("chunks").insert(rows);
    if (chunkErr) throw new Error(chunkErr.message);

    // 6) documentstatus bijwerken
    await supabase
      .from("documents")
      .update({ status: "ready", chunk_count: chunks.length, error: null })
      .eq("id", documentId);

    return { ok: true, documentId, chunkCount: chunks.length };
  } catch (e) {
    const msg = (e as Error).message;
    await supabase
      .from("documents")
      .update({ status: "error", error: msg })
      .eq("id", documentId);
    return { ok: false, documentId, error: msg };
  }
}

/** Verwijdert een document met zijn chunks (cascade in de DB). */
export async function deleteDocument(documentId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Geen Supabase-verbinding." };
  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Herindexeert een document: oude chunks weg, opnieuw chunken + embedden. */
export async function reindexDocument(documentId: string): Promise<IngestResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Geen Supabase-verbinding." };

  // Tekst reconstrueren uit bestaande chunks (op volgorde)
  const { data: existing } = await supabase
    .from("chunks")
    .select("content, chunk_index")
    .eq("document_id", documentId)
    .order("chunk_index", { ascending: true });
  if (!existing || existing.length === 0) {
    return { ok: false, error: "Geen inhoud gevonden om te herindexeren." };
  }
  const text = existing.map((c) => c.content).join("\n\n");

  await supabase.from("chunks").delete().eq("document_id", documentId);
  await supabase.from("documents").update({ status: "processing" }).eq("id", documentId);

  try {
    const cfg = await getEmbeddingConfig();
    const chunks = splitText(text, cfg.chunk_size, cfg.chunk_overlap);
    const allVectors: number[][] = [];
    const BATCH = 90;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH).map((c) => c.content);
      allVectors.push(...(await embed(batch, "document", cfg)));
    }
    const rows = chunks.map((c, i) => ({
      document_id: documentId,
      content: c.content,
      embedding: allVectors[i],
      token_count: c.tokenCount,
      chunk_index: c.index,
    }));
    await supabase.from("chunks").insert(rows);
    await supabase
      .from("documents")
      .update({ status: "ready", chunk_count: chunks.length, error: null })
      .eq("id", documentId);
    return { ok: true, documentId, chunkCount: chunks.length };
  } catch (e) {
    const msg = (e as Error).message;
    await supabase.from("documents").update({ status: "error", error: msg }).eq("id", documentId);
    return { ok: false, documentId, error: msg };
  }
}

// ── Tekst extraheren uit bronnen ─────────────────────────────────

async function extractFromUrl(url: string): Promise<{ title: string; text: string }> {
  const res = await fetch(url, { headers: { "User-Agent": "SanaArchiconsBot/1.0" } });
  if (!res.ok) throw new Error(`URL ophalen mislukt (${res.status}).`);
  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;
  const text = stripHtml(html);
  return { title, text };
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse v2: klasse PDFParse
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  return result.text ?? "";
}

function extOf(filename: string): string {
  const m = filename.toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : "";
}

/** Leesbare tekst extraheren op basis van bestandsextensie. */
async function extractByExtension(filename: string, buffer: Buffer): Promise<string> {
  const ext = extOf(filename);
  switch (ext) {
    case ".pdf":
      return extractFromPdf(buffer);
    case ".html":
    case ".htm":
      return stripHtml(buffer.toString("utf-8"));
    case ".csv":
      return csvToText(buffer.toString("utf-8"));
    case ".json":
      return jsonToText(buffer.toString("utf-8"));
    // md / txt / yaml / yml en overige tekstformaten → de tekst zelf
    case ".md":
    case ".markdown":
    case ".txt":
    case ".yaml":
    case ".yml":
      return buffer.toString("utf-8");
    default:
      return buffer.toString("utf-8");
  }
}

/** CSV → leesbare tekst: per rij "kop: waarde" (goed voor semantisch zoeken). */
function csvToText(csv: string): string {
  const rows = parseCsv(csv);
  if (rows.length === 0) return "";
  const headers = rows[0];
  const lines: string[] = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    if (cells.every((c) => !c.trim())) continue;
    const pairs = headers
      .map((h, j) => (cells[j] ? `${h.trim()}: ${cells[j].trim()}` : ""))
      .filter(Boolean);
    lines.push(pairs.join(" — "));
  }
  return lines.join("\n");
}

/** Lichte CSV-parser met ondersteuning voor velden tussen aanhalingstekens. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** JSON → leesbare tekst, recursief als "sleutel: waarde". */
function jsonToText(jsonStr: string): string {
  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    return jsonStr; // ongeldige JSON → de tekst zelf
  }
  const out: string[] = [];
  const walk = (node: unknown, prefix: string) => {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) {
      node.forEach((item) => walk(item, prefix));
    } else if (typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (v === null || v === undefined) continue;
        if (typeof v === "object") {
          walk(v, prefix);
        } else {
          out.push(`${prefix}${k}: ${String(v)}`);
        }
      }
      out.push(""); // scheiding tussen items
    } else {
      out.push(`${prefix}${String(node)}`);
    }
  };
  walk(data, "");
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
