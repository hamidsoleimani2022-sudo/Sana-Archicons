"use client";

import { ADMIN_LANG_COOKIE, ADMIN_LANGS, type AdminLang } from "@/lib/admin/i18n";

function applyLang(lang: AdminLang) {
  document.cookie = `${ADMIN_LANG_COOKIE}=${lang}; path=/admin; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  window.location.reload();
}

/**
 * Taalkeuze voor het admin-panel: zet de cookie en herlaadt zodat
 * servercomponenten in de nieuwe taal (en juiste richting) renderen.
 */
export function AdminLangSwitcher({ current }: { current: AdminLang }) {

  return (
    <div className="flex items-center gap-1 rounded-full border border-line/70 bg-navy/50 p-1">
      {ADMIN_LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => applyLang(l.code)}
          aria-pressed={l.code === current}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            l.code === current
              ? "bg-emerald text-ink"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
