import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type ChannelKey = "website" | "widget" | "telegram" | "instagram" | "whatsapp" | "linkedin";
type ChannelStatus = "active" | "configurable" | "planned";

const CHANNEL_ICONS: Record<ChannelKey, string> = {
  website: "🌐",
  widget: "💬",
  telegram: "✈️",
  instagram: "📸",
  whatsapp: "🟢",
  linkedin: "💼",
};

/**
 * Kanalen en koppelingen: waar klanten binnenkomen.
 * Website/chatbot zijn ingebouwd; Telegram is instelbaar via env;
 * Instagram/WhatsApp/LinkedIn staan als geplande koppelingen klaar.
 */
export default async function ChannelsPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);

  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const dbReady = isSupabaseConfigured;

  const channels: Array<{ key: ChannelKey; status: ChannelStatus; hint?: string }> = [
    { key: "website", status: dbReady ? "active" : "configurable" },
    { key: "widget", status: dbReady ? "active" : "configurable" },
    { key: "telegram", status: telegramConfigured ? "active" : "configurable", hint: d.channels.envHint },
    { key: "instagram", status: "planned", hint: d.channels.plannedHint },
    { key: "whatsapp", status: "planned", hint: d.channels.plannedHint },
    { key: "linkedin", status: "planned", hint: d.channels.plannedHint },
  ];

  const statusCls: Record<ChannelStatus, string> = {
    active: "bg-emerald/15 text-emerald",
    configurable: "bg-amber-500/15 text-amber-300",
    planned: "bg-line/40 text-muted",
  };

  return (
    <AdminShell active="channels">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{d.channels.title}</h1>
        <p className="mt-1 text-sm text-muted">{d.channels.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map(({ key, status, hint }) => (
          <article key={key} className="flex flex-col rounded-2xl border border-line/70 bg-navy/40 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-2xl" aria-hidden="true">
                {CHANNEL_ICONS[key]}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCls[status]}`}>
                {d.channels.statuses[status]}
              </span>
            </div>
            <h2 className="mt-3 text-base font-semibold text-foreground">
              {d.channels.items[key].name}
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-6 text-foreground/80">
              {d.channels.items[key].desc}
            </p>
            {hint && <p className="mt-3 text-xs text-muted">{hint}</p>}
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
