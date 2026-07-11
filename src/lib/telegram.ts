import "server-only";

/**
 * Lichte Telegram Bot API-client. Het token wordt uitsluitend server-side gelezen.
 */
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

export function isTelegramConfigured(): boolean {
  return Boolean(TOKEN);
}

async function call<T = unknown>(method: string, body: Record<string, unknown>): Promise<T> {
  if (!API) throw new Error("TELEGRAM_BOT_TOKEN is niet ingesteld.");
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<T>;
}

export type InlineButton = { text: string; callback_data?: string; url?: string };

/** Bericht sturen; **bold**-markering wordt gestript (Telegram rendert die niet standaard). */
export function sendMessage(
  chatId: number | string,
  text: string,
  inlineKeyboard?: InlineButton[][]
) {
  return call("sendMessage", {
    chat_id: chatId,
    text: stripMarkdown(text),
    ...(inlineKeyboard ? { reply_markup: { inline_keyboard: inlineKeyboard } } : {}),
    disable_web_page_preview: true,
  });
}

export function sendChatAction(chatId: number | string, action = "typing") {
  return call("sendChatAction", { chat_id: chatId, action });
}

export function answerCallbackQuery(id: string) {
  return call("answerCallbackQuery", { callback_query_id: id });
}

export function setWebhook(url: string, secretToken: string) {
  return call("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
}

export function deleteWebhook() {
  return call("deleteWebhook", { drop_pending_updates: false });
}

export function getWebhookInfo() {
  return call<{ ok: boolean; result: { url: string; pending_update_count: number } }>(
    "getWebhookInfo",
    {}
  );
}

export function getMe() {
  return call<{ ok: boolean; result: { username: string; first_name: string } }>("getMe", {});
}

/** Markdown-tekens strippen die Telegram niet standaard rendert. */
function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1");
}
