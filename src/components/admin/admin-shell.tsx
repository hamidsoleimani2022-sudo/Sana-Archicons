import Link from "next/link";
import { Logo } from "@/components/logo";
import { logout } from "@/app/admin/actions";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminLangSwitcher } from "./lang-switcher";
import { cn } from "@/lib/utils";

const TAB_HREF = {
  dashboard: "/admin",
  leads: "/admin/leads",
  contacts: "/admin/crm/contacts",
  companies: "/admin/crm/companies",
  deals: "/admin/crm/deals",
  activities: "/admin/crm/activities",
  offers: "/admin/offers",
  reports: "/admin/crm/reports",
  assistant: "/admin/crm/assistant",
  conversations: "/admin/conversations",
  knowledge: "/admin/knowledge",
  models: "/admin/models",
  feedback: "/admin/feedback",
  channels: "/admin/channels",
} as const;

export type AdminTab = keyof typeof TAB_HREF;

type NavGroupKey = "overview" | "crm" | "chatbot" | "settings";

const NAV_GROUPS: { key: NavGroupKey; tabs: readonly AdminTab[] }[] = [
  { key: "overview", tabs: ["dashboard"] },
  { key: "crm", tabs: ["leads", "contacts", "companies", "deals", "activities", "offers", "reports", "assistant"] },
  { key: "chatbot", tabs: ["conversations", "knowledge", "models", "feedback"] },
  { key: "settings", tabs: ["channels"] },
];

/** Kleine lijn-iconen (lucide-stijl) — inline zodat we niet afhangen van lucide-react v1-exports. */
const TAB_ICON_PATHS: Record<AdminTab, string> = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  leads: "M22 12h-6l-2 3h-4l-2-3H2M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.5Z",
  contacts: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  companies: "M3 21h18M5 21V7l7-4v18M19 21V11l-7-4M9 9h.01M9 13h.01M9 17h.01",
  deals: "M4 4h5v12H4zM10 4h5v8h-5zM16 4h5v16h-5z",
  activities: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  offers: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  reports: "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  assistant: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z",
  conversations: "M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-5.5a8.5 8.5 0 1 1 17-3Z",
  knowledge: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z",
  models: "M9 9h6v6H9zM4 4h16v16H4zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3",
  feedback: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3",
  channels: "M12 2v6M12 16v6M4.9 4.9l4.2 4.2M14.9 14.9l4.2 4.2M2 12h6M16 12h6M4.9 19.1l4.2-4.2M14.9 9.1l4.2-4.2",
};

function TabIcon({ tab }: { tab: AdminTab }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px] shrink-0"
      aria-hidden="true"
    >
      <path d={TAB_ICON_PATHS[tab]} />
    </svg>
  );
}

/**
 * Gedeelde schil van het admin panel.
 * Desktop: moderne zijbalk met gegroepeerde navigatie (Overzicht · CRM · Chatbot · Instellingen).
 * Mobiel: compacte header met groep-chips en tabs van de actieve groep.
 * Werkt in ltr én rtl (Farsi) dankzij logische properties (start/end).
 */
export async function AdminShell({
  active,
  children,
}: {
  active: AdminTab;
  children: React.ReactNode;
}) {
  const lang = await getAdminLang();
  const d = getDict(lang);
  const activeGroup =
    NAV_GROUPS.find((g) => g.tabs.includes(active)) ?? NAV_GROUPS[0];

  return (
    <div className="min-h-dvh bg-ink lg:flex">
      {/* Zijbalk (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-line/60 bg-navy/30 lg:flex">
        <div className="flex items-center gap-3 border-b border-line/60 px-5 py-5">
          <Link href="/" aria-label="Sana Archicons">
            <Logo />
          </Link>
        </div>
        <p className="px-5 pb-1 pt-4 text-[0.7rem] font-medium uppercase tracking-wider text-muted/80">
          {d.common.panelTitle}
        </p>
        <nav aria-label={d.common.panelTitle} className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.key} className="mt-4 first:mt-2">
              <p className="px-2 pb-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted/60">
                {d.navGroups[group.key]}
              </p>
              <ul className="space-y-0.5">
                {group.tabs.map((tab) => (
                  <li key={tab}>
                    <a
                      href={TAB_HREF[tab]}
                      aria-current={tab === active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors",
                        tab === active
                          ? "bg-emerald/15 font-medium text-emerald"
                          : "text-muted hover:bg-navy/60 hover:text-foreground"
                      )}
                    >
                      <TabIcon tab={tab} />
                      <span className="truncate">{d.tabs[tab]}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-line/60 px-4 py-4">
          <AdminLangSwitcher current={lang} />
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-line/70 px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-emerald/40 hover:text-foreground"
            >
              {d.common.logout}
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Header (mobiel/tablet) */}
        <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/90 backdrop-blur lg:hidden">
          <div className="px-5">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div className="flex items-center gap-3">
                <Link href="/" aria-label="Sana Archicons">
                  <Logo />
                </Link>
                <span className="hidden text-sm text-muted sm:inline">{d.common.panelTitle}</span>
              </div>
              <div className="flex items-center gap-3">
                <AdminLangSwitcher current={lang} />
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-full border border-line/70 px-4 py-2 text-sm text-muted transition-colors hover:border-emerald/40 hover:text-foreground"
                  >
                    {d.common.logout}
                  </button>
                </form>
              </div>
            </div>
            {/* Groep-chips */}
            <nav aria-label={d.common.panelTitle} className="flex gap-1.5 overflow-x-auto pb-2">
              {NAV_GROUPS.map((g) => (
                <a
                  key={g.key}
                  href={TAB_HREF[g.tabs[0]]}
                  aria-current={g.key === activeGroup.key ? "page" : undefined}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-colors",
                    g.key === activeGroup.key
                      ? "bg-emerald text-ink font-medium"
                      : "border border-line/70 text-muted hover:text-foreground"
                  )}
                >
                  {d.navGroups[g.key]}
                </a>
              ))}
            </nav>
            {/* Tabs van de actieve groep */}
            {activeGroup.tabs.length > 1 && (
              <nav aria-label={d.navGroups[activeGroup.key]} className="-mb-px flex gap-1 overflow-x-auto">
                {activeGroup.tabs.map((tab) => (
                  <a
                    key={tab}
                    href={TAB_HREF[tab]}
                    aria-current={tab === active ? "page" : undefined}
                    className={cn(
                      "whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm transition-colors",
                      tab === active
                        ? "border-emerald font-medium text-emerald"
                        : "border-transparent text-muted hover:text-foreground"
                    )}
                  >
                    {d.tabs[tab]}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
