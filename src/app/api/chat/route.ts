import { handleChatTurn } from "@/lib/rag/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

// ── eenvoudige in-memory rate-limit ──
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";

  if (rateLimited(ip)) {
    return new Response("Te veel verzoeken; probeer het over een minuut opnieuw.", {
      status: 429,
    });
  }

  let body: { message?: string; conversationId?: string | null; channel?: string; locale?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Ongeldige aanvraag.", { status: 400 });
  }

  const message = (body.message ?? "").toString().trim();
  if (!message) {
    return new Response("Het bericht is leeg.", { status: 400 });
  }
  if (message.length > 2000) {
    return new Response("Het bericht is te lang.", { status: 400 });
  }

  try {
    return await handleChatTurn({
      conversationId: body.conversationId ?? null,
      channel: body.channel ?? "web",
      locale: body.locale ?? "nl",
      userMessage: message,
    });
  } catch (e) {
    console.error("[/api/chat] fout:", (e as Error).message);
    return new Response(
      "Er ging iets mis bij het beantwoorden. Probeer het opnieuw of vul het adviesaanvraag-formulier in.",
      { status: 500 }
    );
  }
}
