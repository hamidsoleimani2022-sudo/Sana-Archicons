"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

const locales = [
  { code: "nl", label: "NL" },
  { code: "en", label: "EN" },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function switchTo(next: string) {
    if (next === locale) return;
    // @ts-expect-error -- params are passed straight through to the route
    router.replace({ pathname, params }, { locale: next });
  }

  return (
    <div className="flex items-center rounded-full border border-line/70 bg-navy/60 p-0.5 text-xs font-semibold">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => switchTo(l.code)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            l.code === locale
              ? "bg-emerald text-ink"
              : "text-muted hover:text-foreground",
          )}
          aria-label={`Switch to ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
