import Link from "next/link";
import { Logo } from "@/components/logo";
import { logout } from "@/app/admin/actions";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict } from "@/lib/admin/i18n";
import { AdminLangSwitcher } from "./lang-switcher";
import { cn } from "@/lib/utils";

const TAB_KEYS = [
  "dashboard",
  "leads",
  "knowledge",
  "models",
  "conversations",
  "feedback",
] as const;

export type AdminTab = (typeof TAB_KEYS)[number];

const TAB_HREF: Record<AdminTab, string> = {
  dashboard: "/admin",
  leads: "/admin/leads",
  knowledge: "/admin/knowledge",
  models: "/admin/models",
  conversations: "/admin/conversations",
  feedback: "/admin/feedback",
};

/** Gedeelde schil van het admin-panel: header + tabs + taalkeuze. */
export async function AdminShell({
  active,
  children,
}: {
  active: AdminTab;
  children: React.ReactNode;
}) {
  const lang = await getAdminLang();
  const d = getDict(lang);

  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
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
          {/* Tabs */}
          <nav aria-label={d.common.panelTitle} className="-mb-px flex gap-1 overflow-x-auto">
            {TAB_KEYS.map((key) => (
              <a
                key={key}
                href={TAB_HREF[key]}
                className={cn(
                  "whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors",
                  key === active
                    ? "border-emerald font-medium text-emerald"
                    : "border-transparent text-muted hover:text-foreground"
                )}
                aria-current={key === active ? "page" : undefined}
              >
                {d.tabs[key]}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
