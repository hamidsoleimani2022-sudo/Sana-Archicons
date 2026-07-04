"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";

// Standaard EU-energielabel kleuren (groen A → rood G) met richtwaarde-breedtes.
const CLASSES = [
  { letter: "A", w: 92, bar: "#00a651" },
  { letter: "B", w: 82, bar: "#52ae32" },
  { letter: "C", w: 70, bar: "#a9cf38" },
  { letter: "D", w: 58, bar: "#f6c700" },
  { letter: "E", w: 46, bar: "#f59c00" },
  { letter: "F", w: 34, bar: "#ee6f00" },
  { letter: "G", w: 22, bar: "#e30613" },
] as const;

type Letter = (typeof CLASSES)[number]["letter"];

export function EnergyLabel() {
  const t = useTranslations("EnergyLabel");
  const [selected, setSelected] = useState<Letter | null>(null);

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

      <Reveal delay={0.1}>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Klassen A–G */}
          <div className="rounded-2xl border border-line/70 bg-navy/40 p-5 sm:p-6">
            <p className="mb-4 text-sm text-muted">{t("hint")}</p>
            <div
              className="flex flex-col gap-2.5"
              role="group"
              aria-label={t("groupLabel")}
            >
              {CLASSES.map(({ letter, w, bar }) => {
                const active = selected === letter;
                return (
                  <button
                    key={letter}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(letter)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl p-1.5 text-left transition-all hover:bg-navy-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      active ? "bg-navy-soft ring-2 ring-emerald" : ""
                    }`}
                  >
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-navy text-base font-extrabold text-foreground">
                      {letter}
                    </span>
                    <span
                      className="flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-[#0a0e14] transition-all"
                      style={{ width: `${w}%`, backgroundColor: bar }}
                    >
                      {t(`classes.${letter}.naam`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toelichting + advies */}
          <div
            className="rounded-2xl border border-line/70 bg-navy/40 p-6"
            aria-live="polite"
          >
            {selected ? (
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-extrabold text-[#0a0e14]"
                    style={{
                      backgroundColor: CLASSES.find((c) => c.letter === selected)!
                        .bar,
                    }}
                  >
                    {selected}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {t(`classes.${selected}.naam`)}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {t(`classes.${selected}.toelichting`)}
                </p>
                <div className="mt-5 rounded-xl border border-emerald/30 bg-emerald/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald">
                    {t("adviceLabel")}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                    {t(`classes.${selected}.advies`)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="flex h-full items-center text-sm text-muted">
                {t("detailDefault")}
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
