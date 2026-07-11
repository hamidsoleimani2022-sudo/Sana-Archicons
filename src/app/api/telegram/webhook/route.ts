import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getReplyText } from "@/lib/rag/chat";
import {
  sendMessage,
  sendChatAction,
  answerCallbackQuery,
  type InlineButton,
} from "@/lib/telegram";

export const runtime = "nodejs";
export const maxDuration = 60;

const SITE_URL = "https://sana-archicons.vercel.app";
const CONSULT_URL = `${SITE_URL}/nl/consult`;

// ── eenvoudige rate-limit per chat ──
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const hits = new Map<number, number[]>();
function rateLimited(chatId: number): boolean {
  const now = Date.now();
  const arr = (hits.get(chatId) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(chatId, arr);
  return arr.length > MAX_PER_WINDOW;
}

// Snelkeuzevragen (callback-knoppen) + link naar het aanvraagformulier
const QUICK_QUESTIONS: Record<string, string> = {
  q_services: "Welke diensten biedt Sana Archicons aan?",
  q_energy: "Hoe werkt een energielabel-aanvraag?",
  q_ai: "Wat kost een AI-consult en wat krijg ik daarvoor?",
  q_process: "Hoe verloopt een samenwerking met Sana Archicons?",
};
function startKeyboard(): InlineButton[][] {
  return [
    [
      { text: "🏗 Diensten", callback_data: "q_services" },
      { text: "⚡ Energielabel", callback_data: "q_energy" },
    ],
    [
      { text: "🤖 AI-consult", callback_data: "q_ai" },
      { text: "🤝 Werkwijze", callback_data: "q_process" },
    ],
    [{ text: "📝 Adviesgesprek aanvragen", url: CONSULT_URL }],
  ];
}

const WELCOME =
  "Hallo! 👋 Ik ben de slimme assistent van Sana Archicons — bouwkundig advies, energieadvies, AI-consultancy en procesautomatisering.\n\nStel uw vraag in het Nederlands, Engels of Farsi, of kies een van de opties hieronder.";
const HELP =
  "Ik help u graag met vragen over Sana Archicons:\n\n• Typ uw vraag gewoon als bericht (Nederlands, Engels of Farsi).\n• /start — opnieuw beginnen met het keuzemenu\n• /reset — gespreksgeheugen wissen\n\nKlaar voor een gesprek? Vraag een gratis adviesgesprek aan: " +
  CONSULT_URL;

export async function POST(req: Request) {
  // Beveiliging: Telegram-secret controleren
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("forbidden", { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return new Response("ok"); // ongeldige update stil negeren
  }

  try {
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    } else if (update.message) {
      await handleMessage(update.message);
    }
  } catch (e) {
    console.error("[telegram] fout:", (e as Error).message);
  }
  // Altijd snel 200 teruggeven, anders blijft Telegram herhalen
  return new Response("ok");
}

async function handleMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();
  const supabase = getSupabaseAdmin();

  if (!text) {
    await sendMessage(chatId, "Ik ondersteun voorlopig alleen tekstberichten. Typ uw vraag maar 🙂");
    return;
  }

  // Commando's
  if (text.startsWith("/start")) {
    if (supabase) {
      await upsertUser(supabase, chatId, msg.from);
      await resetConversation(supabase, chatId);
    }
    await sendMessage(chatId, WELCOME, startKeyboard());
    return;
  }
  if (text.startsWith("/help")) {
    await sendMessage(chatId, HELP);
    return;
  }
  if (text.startsWith("/reset")) {
    if (supabase) await resetConversation(supabase, chatId);
    await sendMessage(chatId, "Het gespreksgeheugen is gewist. U kunt opnieuw beginnen 🙂", startKeyboard());
    return;
  }

  if (rateLimited(chatId)) {
    await sendMessage(chatId, "Rustig aan 🙏 Wacht een momentje en probeer het dan opnieuw.");
    return;
  }

  await answerQuestion(chatId, text, msg.from);
}

async function handleCallback(cb: TelegramCallback) {
  await answerCallbackQuery(cb.id).catch(() => {});
  const chatId = cb.message?.chat.id;
  if (!chatId) return;
  const question = QUICK_QUESTIONS[cb.data ?? ""];
  if (!question) return;
  if (rateLimited(chatId)) {
    await sendMessage(chatId, "Rustig aan 🙏 Wacht een momentje.");
    return;
  }
  await answerQuestion(chatId, question, cb.from);
}

async function answerQuestion(chatId: number, question: string, from?: TelegramUser) {
  const supabase = getSupabaseAdmin();
  await sendChatAction(chatId, "typing").catch(() => {});

  let conversationId: string | null = null;
  if (supabase) {
    await upsertUser(supabase, chatId, from);
    conversationId = await getOrCreateConversation(supabase, chatId);
  }

  const { text } = await getReplyText({
    channel: "telegram",
    conversationId,
    externalUserId: String(chatId),
    userMessage: question,
  });

  await sendMessage(chatId, text, [
    [{ text: "📝 Adviesgesprek aanvragen", url: CONSULT_URL }],
  ]);
}

// ── gebruikers- en gesprekskoppeling ────────────────────────────
async function upsertUser(supabase: SupabaseClient, chatId: number, from?: TelegramUser) {
  const { data } = await supabase
    .from("unified_users")
    .select("id")
    .eq("channel", "telegram")
    .eq("external_id", String(chatId))
    .maybeSingle();
  if (!data) {
    const name =
      [from?.first_name, from?.last_name].filter(Boolean).join(" ") || from?.username || null;
    await supabase
      .from("unified_users")
      .insert({ channel: "telegram", external_id: String(chatId), name });
  }
}

async function getOrCreateConversation(
  supabase: SupabaseClient,
  chatId: number
): Promise<string | null> {
  const { data: open } = await supabase
    .from("conversations")
    .select("id")
    .eq("channel", "telegram")
    .eq("external_user_id", String(chatId))
    .eq("status", "open")
    .order("last_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (open?.id) return open.id;
  const { data: created } = await supabase
    .from("conversations")
    .insert({ channel: "telegram", external_user_id: String(chatId), status: "open" })
    .select("id")
    .single();
  return created?.id ?? null;
}

async function resetConversation(supabase: SupabaseClient, chatId: number) {
  await supabase
    .from("conversations")
    .update({ status: "closed" })
    .eq("channel", "telegram")
    .eq("external_user_id", String(chatId))
    .eq("status", "open");
}

// ── Telegram-typen ──
type TelegramUser = { id: number; first_name?: string; last_name?: string; username?: string };
type TelegramMessage = { chat: { id: number }; text?: string; from?: TelegramUser };
type TelegramCallback = { id: string; data?: string; message?: { chat: { id: number } }; from?: TelegramUser };
type TelegramUpdate = { message?: TelegramMessage; callback_query?: TelegramCallback };
