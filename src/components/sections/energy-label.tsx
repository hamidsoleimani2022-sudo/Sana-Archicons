"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";

// Officiële NL-energielabelschaal A+++++ → G (groen naar rood) met richtwaarde-breedtes.
const CLASSES = [
  { id: "Aplus5", label: "A+++++", w: 99, bar: "#008a3e" },
  { id: "Aplus4", label: "A++++", w: 94, bar: "#00a04a" },
  { id: "Aplus3", label: "A+++", w: 89, bar: "#34ab3a" },
  { id: "Aplus2", label: "A++", w: 84, bar: "#5cb22f" },
  { id: "Aplus1", label: "A+", w: 79, bar: "#80ba27" },
  { id: "A", label: "A", w: 73, bar: "#a6c61e" },
  { id: "B", label: "B", w: 66, bar: "#ccd300" },
  { id: "C", label: "C", w: 59, bar: "#f4d100" },
  { id: "D", label: "D", w: 51, bar: "#f7a800" },
  { id: "E", label: "E", w: 43, bar: "#f3851a" },
  { id: "F", label: "F", w: 36, bar: "#ee6321" },
  { id: "G", label: "G", w: 30, bar: "#e30613" },
] as const;

type ClassId = (typeof CLASSES)[number]["id"];

export function EnergyLabel({ showHeading = true }: { showHeading?: boolean }) {
  const t = useTranslations("EnergyLabel");
  const [selected, setSelected] = useState<ClassId | null>(null);
  const current = CLASSES.find((c) => c.id === selected);

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

      <Reveal delay={0.1}>
        <div
          className={`mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] ${
            showHeading ? "mt-12" : ""
          }`}
        >
          {/* Klassen A+++++ → G */}
          <div className="rounded-2xl border border-line/70 bg-navy/40 p-5 sm:p-6">
            <p className="mb-4 text-sm text-muted">{t("hint")}</p>
            <div
              className="flex flex-col gap-2"
              role="group"
              aria-label={t("groupLabel")}
            >
              {CLASSES.map(({ id, label, w, bar }) => {
                const active = selected === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(id)}
                    className={`flex min-h-11 items-center gap-3 rounded-xl p-1.5 text-left transition-all hover:bg-navy-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald ${
                      active ? "bg-navy-soft ring-2 ring-emerald" : ""
                    }`}
                  >
                    <span className="flex h-9 min-w-9 flex-none items-center justify-center rounded-lg bg-navy px-2 text-sm font-extrabold text-foreground">
                      {label}
                    </span>
                    <span
                      className="flex h-9 items-center whitespace-nowrap rounded-lg px-3 text-sm font-semibold text-[#0a0e14] transition-all"
                      style={{ width: `${w}%`, backgroundColor: bar }}
                    >
                      {t(`classes.${id}.naam`)}
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
            {current ? (
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 min-w-12 items-center justify-center rounded-xl px-2.5 text-lg font-extrabold text-[#0a0e14]"
                    style={{ backgroundColor: current.bar }}
                  >
                    {current.label}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {t(`classes.${current.id}.naam`)}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {t(`classes.${current.id}.toelichting`)}
                </p>
                <div className="mt-5 rounded-xl border border-emerald/30 bg-emerald/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald">
                    {t("adviceLabel")}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                    {t(`classes.${current.id}.advies`)}
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
