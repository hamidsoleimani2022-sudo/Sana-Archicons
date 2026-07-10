import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Feedback 👍/👎 registreren voor het laatste antwoord in een gesprek.
 * Body: { conversationId: string, rating: "up" | "down", comment?: string }
 */
export async function POST(req: Request) {
  let body: { conversationId?: string; rating?: string; comment?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Ongeldige aanvraag.", { status: 400 });
  }

  const { conversationId, rating, comment } = body;
  if (!conversationId || (rating !== "up" && rating !== "down")) {
    return new Response("Ongeldige invoer.", { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return new Response("Service niet beschikbaar.", { status: 503 });

  // Laatste assistent-bericht in dit gesprek
  const { data: lastMsg } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("role", "assistant")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("feedback").insert({
    message_id: lastMsg?.id ?? null,
    rating,
    comment: comment?.slice(0, 500) ?? null,
  });

  if (error) {
    console.error("[/api/feedback] fout:", error.message);
    return new Response("Feedback opslaan mislukt.", { status: 500 });
  }
  return Response.json({ ok: true });
}
