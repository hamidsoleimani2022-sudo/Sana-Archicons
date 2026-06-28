"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import {
  Ruler,
  Gauge,
  BadgeEuro,
  Utensils,
  Bath,
  Trees,
  Thermometer,
  Landmark,
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const factorIcons = [
  Ruler,
  Gauge,
  BadgeEuro,
  Utensils,
  Bath,
  Trees,
  Thermometer,
  Landmark,
];

const SOURCE_URL = "https://huurprijscheck.huurcommissie.nl/zelfstandige-woonruimte";

export function WWS() {
  const t = useTranslations("WWS");

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20">
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

      {/* Wat telt mee in de punten */}
      <Reveal delay={0.1}>
        <h3 className="mt-14 text-center text-lg font-bold text-foreground">
          {t("factorsTitle")}
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {factorIcons.map((Icon, i) => (
            <div
              key={i}
              className="rounded-2xl border border-line/70 bg-navy/40 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                <Icon size={20} />
              </span>
              <h4 className="mt-4 text-sm font-bold text-foreground">
                {t(`factors.${i}.title`)}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {t(`factors.${i}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Van punten naar huursegment */}
      <Reveal delay={0.15}>
        <h3 className="mt-16 text-center text-lg font-bold text-foreground">
          {t("segmentsTitle")}
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-line/70 bg-navy/40 p-6 text-center"
            >
              <span className="inline-block rounded-full bg-emerald/10 px-3 py-1 text-xs font-bold text-emerald">
                {t(`segments.${i}.range`)}
              </span>
              <h4 className="mt-3 text-lg font-extrabold text-foreground">
                {t(`segments.${i}.label`)}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(`segments.${i}.desc`)}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-muted">
          {t("note")}
        </p>
      </Reveal>

      {/* Voordeel + CTA + bron */}
      <Reveal delay={0.2}>
        <div className="mt-16 grid gap-6 rounded-3xl border border-emerald/30 bg-navy/40 p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-extrabold text-foreground">
              {t("benefitsTitle")}
            </h3>
            <ul className="mt-5 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald/15 text-emerald">
                    <Check size={13} />
                  </span>
                  <span className="text-sm leading-relaxed text-muted">
                    {t(`benefits.${i}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-4 rounded-2xl bg-navy-soft/60 p-6">
            <Link
              href="/booking"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
            >
              {t("cta")}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href={SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-muted transition-colors hover:text-emerald"
            >
              <span className="font-semibold uppercase tracking-wider">
                {t("sourceLabel")}:
              </span>
              {t("sourceText")}
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
