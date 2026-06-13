"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  const t = useTranslations("Cta");

  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <Reveal>
        <div className="glow-emerald relative overflow-hidden rounded-3xl border border-emerald/30 bg-gradient-to-br from-navy-soft via-navy to-ink px-6 py-14 text-center sm:px-12">
          <div className="tech-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald/30 blur-[90px]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">{t("subtitle")}</p>
            <Link
              href="/booking"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-8 py-4 text-sm font-semibold text-ink shadow-xl shadow-emerald/25 transition-transform hover:scale-[1.03] active:scale-95"
            >
              {t("button")}
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
