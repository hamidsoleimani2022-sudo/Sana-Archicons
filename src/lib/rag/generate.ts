import "server-only";
import { streamText, stepCountIs, type ToolSet } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Antwoordgeneratie — alle modellen via OpenRouter (OpenAI-compatibel, streaming).
 * Een ander model kiezen is alleen een andere slug.
 */

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function getOpenRouter() {
  return createOpenAICompatible({
    name: "openrouter",
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    headers: {
      // Voor OpenRouter-statistieken (optioneel)
      "HTTP-Referer": "https://sana-archicons.vercel.app",
      "X-Title": "Sana Archicons Assistent",
    },
    // Reasoning laag houden voor alle modellen. Sommige modellen (zoals
    // Gemini 3.5 Flash) redeneren verplicht en kunnen anders het hele
    // tokenbudget aan redeneren opmaken zonder tekst te produceren
    // ("No output generated"). effort=low houdt het kort, snel en goedkoop.
    fetch: (async (url: string, options: RequestInit | undefined) => {
      if (options?.body && typeof options.body === "string") {
        try {
          const body = JSON.parse(options.body);
          body.reasoning = { effort: "low" };
          options = { ...options, body: JSON.stringify(body) };
        } catch {
          /* geen JSON-body → onaangeroerd laten */
        }
      }
      return fetch(url, options);
    }) as typeof fetch,
  });
}

export type StreamChatOptions = {
  model: string;
  system: string;
  messages: ChatMessage[];
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  tools?: ToolSet;
  onFinish?: (event: {
    text: string;
    usage: { inputTokens?: number; outputTokens?: number } | undefined;
    model: string;
  }) => void | Promise<void>;
};

export function streamChat(opts: StreamChatOptions) {
  const openrouter = getOpenRouter();

  return streamText({
    model: openrouter(opts.model),
    system: opts.system,
    messages: opts.messages,
    temperature: opts.temperature,
    topP: opts.topP,
    maxOutputTokens: opts.maxOutputTokens,
    tools: opts.tools,
    // Meerdere stappen toestaan zodat het model na tool-gebruik nog een
    // tekstueel antwoord geeft
    stopWhen: stepCountIs(5),
    onFinish: async (event) => {
      if (opts.onFinish) {
        await opts.onFinish({
          text: event.text,
          usage: {
            inputTokens: event.usage?.inputTokens,
            outputTokens: event.usage?.outputTokens,
          },
          model: opts.model,
        });
      }
    },
  });
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}
