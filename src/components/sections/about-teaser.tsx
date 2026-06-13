"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { Target, Eye, ArrowRight, User } from "lucide-react";

export function AboutTeaser() {
  const t = useTranslations("About");
  const nav = useTranslations("Nav");

  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-line/70 bg-gradient-to-br from-navy-soft to-ink">
            <div className="tech-grid absolute inset-0 opacity-[0.15]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
              <User size={56} className="text-emerald/60" />
              <span className="text-sm">{t("photoPlaceholder")}</span>
            </div>
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald/20 blur-3xl" />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald">
              {t("subtitle")}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
          </Reveal>

          <div className="mt-8 space-y-5">
            <Reveal delay={0.1}>
              <div className="flex gap-4 rounded-2xl border border-line/60 bg-navy/40 p-5">
                <Target className="mt-0.5 shrink-0 text-emerald" size={22} />
                <div>
                  <h3 className="font-bold text-foreground">{t("missionTitle")}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {t("mission")}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="flex gap-4 rounded-2xl border border-line/60 bg-navy/40 p-5">
                <Eye className="mt-0.5 shrink-0 text-emerald" size={22} />
                <div>
                  <h3 className="font-bold text-foreground">{t("visionTitle")}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {t("vision")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.26}>
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald"
            >
              {nav("about")}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
