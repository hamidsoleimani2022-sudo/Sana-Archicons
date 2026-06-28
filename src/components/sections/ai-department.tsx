"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import {
  Code2,
  Bot,
  Workflow,
  Wrench,
  LineChart,
  Check,
  ArrowRight,
} from "lucide-react";

const offerIcons = [Code2, Bot, Workflow, Wrench, LineChart];

export function AIDepartment({ showHeading = true }: { showHeading?: boolean }) {
  const t = useTranslations("AI");

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20">
      {showHeading && (
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald">
              {t("eyebrow")}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-muted">{t("subtitle")}</p>
          </div>
        </Reveal>
      )}

      {/* Wat wij doen */}
      <Reveal delay={0.1}>
        <h3
          className={`text-center text-lg font-bold text-foreground ${
            showHeading ? "mt-14" : ""
          }`}
        >
          {t("offerTitle")}
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offerIcons.map((Icon, i) => (
            <div
              key={i}
              className="rounded-2xl border border-line/70 bg-navy/40 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                <Icon size={20} />
              </span>
              <h4 className="mt-4 text-sm font-bold text-foreground">
                {t(`offers.${i}.title`)}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {t(`offers.${i}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Onderhoudsabonnement */}
      <Reveal delay={0.15}>
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t("plansTitle")}
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            {t("plansSubtitle")}
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((i) => {
            const popular = i === 1;
            const features = t.raw(`plans.${i}.features`) as string[];
            return (
              <div
                key={i}
                className={`relative flex h-full flex-col rounded-2xl border p-6 ${
                  popular
                    ? "border-emerald/60 bg-navy-soft shadow-xl shadow-emerald/10"
                    : "border-line/70 bg-navy/40"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald px-3 py-1 text-xs font-bold text-ink">
                    {t("popular")}
                  </span>
                )}
                <h4 className="text-lg font-bold text-foreground">
                  {t(`plans.${i}.name`)}
                </h4>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-foreground">
                    {t(`plans.${i}.price`)}
                  </span>
                  <span className="text-sm text-muted">{t("perYear")}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{t(`plans.${i}.desc`)}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2.5 text-sm text-muted"
                    >
                      <Check
                        size={16}
                        className="mt-0.5 flex-none text-emerald"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/booking"
                  className={`group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                    popular
                      ? "bg-emerald text-ink hover:scale-[1.03] active:scale-95"
                      : "border border-emerald/50 text-emerald hover:bg-emerald hover:text-ink"
                  }`}
                >
                  {t("cta")}
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-muted">{t("quoteNote")}</p>
      </Reveal>
    </section>
  );
}
