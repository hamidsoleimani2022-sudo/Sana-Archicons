import "server-only";
import type { EmbeddingConfig } from "./config";

/**
 * Tekst → vector (embedding), provider-agnostisch.
 * Nu alleen Cohere; de structuur is klaar voor OpenAI/Google/Voyage.
 *
 * inputType:
 *   - 'query'    → voor de vraag van de gebruiker bij het zoeken
 *   - 'document' → voor kennisbank-chunks bij het indexeren
 */
export type EmbedInputType = "query" | "document";

export async function embed(
  texts: string[],
  inputType: EmbedInputType,
  config: EmbeddingConfig
): Promise<number[][]> {
  if (texts.length === 0) return [];

  switch (config.provider) {
    case "cohere":
      return embedCohere(texts, inputType, config);
    default:
      throw new Error(
        `Embedding-provider wordt nog niet ondersteund: ${config.provider}`
      );
  }
}

async function embedCohere(
  texts: string[],
  inputType: EmbedInputType,
  config: EmbeddingConfig
): Promise<number[][]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "COHERE_API_KEY is niet ingesteld; embeddings kunnen niet worden gemaakt."
    );
  }

  const res = await fetch("https://api.cohere.com/v2/embed", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      texts,
      input_type: inputType === "query" ? "search_query" : "search_document",
      embedding_types: ["float"],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Cohere-fout (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  // Cohere v2-antwoord: { embeddings: { float: number[][] } }
  const vectors: number[][] | undefined = json?.embeddings?.float;
  if (!vectors || !Array.isArray(vectors)) {
    throw new Error("Cohere-antwoord bevatte geen geldige vectoren.");
  }
  return vectors;
}

/** Embed één enkele tekst (helper). */
export async function embedOne(
  text: string,
  inputType: EmbedInputType,
  config: EmbeddingConfig
): Promise<number[]> {
  const [vec] = await embed([text], inputType, config);
  return vec;
}
