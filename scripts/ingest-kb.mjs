#!/usr/bin/env node
/**
 * Bulk-ingestie van de Sana Archicons-kennisbank in het RAG-systeem
 * (Supabase + pgvector).
 *
 * Leest alle .md-bestanden uit knowledge-base/, haalt de titel uit de
 * frontmatter (of de eerste kop), chunkt de tekst, embedt met Cohere en
 * schrijft naar de tabellen documents/chunks.
 *
 * Uitvoeren (vanaf de projectroot):  node scripts/ingest-kb.mjs
 * Vereist in .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * COHERE_API_KEY (en optioneel EMBEDDING_MODEL).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KB_DIR = path.join(ROOT, "knowledge-base");

// ── env uit .env.local ──
function loadEnv() {
  const p = path.join(ROOT, ".env.local");
  const env = {};
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, "utf-8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
    }
  }
  return env;
}
const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const COHERE_API_KEY = env.COHERE_API_KEY || process.env.COHERE_API_KEY;
const EMBEDDING_MODEL = env.EMBEDDING_MODEL || "embed-multilingual-v3.0";

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Supabase-variabelen ontbreken in .env.local.");
if (!COHERE_API_KEY) throw new Error("COHERE_API_KEY ontbreekt in .env.local.");

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function cleanText(t) {
  return t.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/** Titel en (optioneel) tags uit YAML-frontmatter halen; frontmatter zelf strippen. */
function parseDoc(raw, fallbackTitle) {
  let title = fallbackTitle;
  let topic = null;
  let body = raw;
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    body = raw.slice(fm[0].length);
    const t = fm[1].match(/^(?:titel|title):\s*(.+)$/m);
    if (t) title = t[1].trim();
    const o = fm[1].match(/^(?:onderwerp|topic):\s*(.+)$/m);
    if (o) topic = o[1].trim();
  } else {
    const h = raw.match(/^#\s+(.+)$/m);
    if (h) title = h[1].trim();
  }
  return { title, topic, body };
}

// ── chunking (gelijk aan src/lib/rag/chunking.ts) ──
const CPT = 3.5;
const estTokens = (t) => Math.ceil(t.length / CPT);
function splitText(raw, chunkSizeTokens = 500, overlapTokens = 50) {
  const text = cleanText(raw);
  if (!text) return [];
  const maxChars = Math.max(200, Math.floor(chunkSizeTokens * CPT));
  const overlapChars = Math.max(0, Math.floor(overlapTokens * CPT));
  const units = [];
  for (const para of text.split(/\n{2,}/)) {
    const t = para.trim();
    if (!t) continue;
    for (const s of t.split(/(?<=[.!?؟،؛\n])\s+/)) if (s.trim()) units.push(s.trim());
  }
  const chunks = [];
  let buf = "";
  const flush = () => {
    const c = buf.trim();
    if (c) chunks.push(c);
  };
  for (const u of units) {
    if (buf.length + u.length + 1 > maxChars && buf.length > 0) {
      flush();
      buf = overlapChars > 0 ? buf.slice(-overlapChars) + " " : "";
    }
    if (u.length > maxChars) {
      if (buf.trim()) flush();
      buf = "";
      for (let i = 0; i < u.length; i += maxChars - overlapChars) {
        chunks.push(u.slice(i, i + maxChars).trim());
      }
      continue;
    }
    buf += (buf ? " " : "") + u;
  }
  flush();
  return chunks;
}

// ── embedding met Cohere ──
async function embed(texts) {
  const res = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: { Authorization: `Bearer ${COHERE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      texts,
      input_type: "search_document",
      embedding_types: ["float"],
    }),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`Cohere ${res.status}: ${JSON.stringify(j).slice(0, 200)}`);
  return j.embeddings.float;
}

// ── uitvoering ──
async function main() {
  const files = fs
    .readdirSync(KB_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  console.log(`📚 ${files.length} kennisbank-bestanden gevonden. Start ingestie…\n`);

  let okCount = 0;
  let totalChunks = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(KB_DIR, file), "utf-8");
    const { title, topic, body } = parseDoc(raw, file.replace(/\.md$/, ""));

    try {
      const text = cleanText(body);
      if (text.length < 20) {
        console.log(`⚠️  Te weinig tekst: ${title}`);
        continue;
      }
      const chunks = splitText(text);
      const vectors = [];
      for (let i = 0; i < chunks.length; i += 90) {
        vectors.push(...(await embed(chunks.slice(i, i + 90))));
      }

      const { data: doc, error: de } = await supabase
        .from("documents")
        .insert({ title, source_type: "md", status: "processing", tags: topic ? [topic] : null })
        .select("id")
        .single();
      if (de) throw new Error(de.message);

      const rows = chunks.map((c, i) => ({
        document_id: doc.id,
        content: c,
        embedding: vectors[i],
        token_count: estTokens(c),
        chunk_index: i,
      }));
      const { error: ce } = await supabase.from("chunks").insert(rows);
      if (ce) throw new Error(ce.message);

      await supabase
        .from("documents")
        .update({ status: "ready", chunk_count: chunks.length })
        .eq("id", doc.id);
      console.log(`✅ ${title} — ${chunks.length} chunks${topic ? ` [tag: ${topic}]` : ""}`);
      okCount++;
      totalChunks += chunks.length;
    } catch (e) {
      console.log(`❌ ${title}: ${e.message}`);
    }
  }

  console.log(`\n🎉 Klaar: ${okCount} documenten, ${totalChunks} chunks geïndexeerd.`);
}

main().catch((e) => {
  console.error("Fout:", e);
  process.exit(1);
});
