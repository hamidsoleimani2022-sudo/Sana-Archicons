"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";
import {
  Building2,
  BrickWall,
  Home,
  PaintRoller,
  Plug,
  ShieldCheck,
  ClipboardList,
  Gauge,
  FileCheck2,
  Handshake,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

type Group = { title: string; items: string[] };
type Step = { title: string; desc: string };
type Highlight = { title: string; desc: string };
type Source = { label: string; url: string };

const groupIcons: LucideIcon[] = [
  Building2,
  BrickWall,
  Home,
  PaintRoller,
  Plug,
  ShieldCheck,
];

const stepIcons: LucideIcon[] = [ClipboardList, Gauge, FileCheck2, Handshake];

export function BouwkundigAdvies({
  showHeading = true,
}: {
  showHeading?: boolean;
}) {
  const t = useTranslations("Bouwkundig");
  const groups = t.raw("groups") as Group[];
  const steps = t.raw("steps") as Step[];
  const highlights = t.raw("highlights") as Highlight[];
  const sources = t.raw("sources") as Source[];

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

      {/* Welke onderdelen vallen eronder */}
      <Reveal delay={0.05}>
        <div
          className={`mx-auto max-w-2xl text-center ${showHeading ? "mt-14" : ""}`}
        >
          <h3 className="text-2xl font-bold tracking-tight">{t("scopeTitle")}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {t("scopeIntro")}
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => {
          const Icon = groupIcons[i] ?? Building2;
          return (
            <Reveal key={group.title} delay={i * 0.06}>
              <div className="flex h-full flex-col rounded-2xl border border-line/70 bg-navy/40 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <Icon size={24} />
                </span>
                <h4 className="mt-5 text-lg font-bold text-foreground">
                  {group.title}
                </h4>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-emerald" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Analyse in vier stappen */}
      <Reveal delay={0.05}>
        <h3 className="mt-20 text-center text-2xl font-bold tracking-tight">
          {t("processTitle")}
        </h3>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => {
          const Icon = stepIcons[i] ?? ClipboardList;
          return (
            <Reveal key={step.title} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-line/70 bg-navy/40 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <Icon size={24} />
                  </span>
                  <span className="text-2xl font-extrabold text-line">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h4 className="mt-5 text-lg font-bold text-foreground">
                  {step.title}
                </h4>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Conditie + financieel */}
      <div className="mt-16 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="flex h-full flex-col rounded-2xl border border-emerald/30 bg-emerald/10 p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/15 text-emerald">
              <Gauge size={24} />
            </span>
            <h3 className="mt-5 text-xl font-bold text-foreground">
              {t("conditionTitle")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">
              {t("conditionText")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5", "6"].map((n) => (
                <span
                  key={n}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-sm font-extrabold text-foreground"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="h-full rounded-2xl border border-line/70 bg-navy/40 p-7">
            <h3 className="text-xl font-bold text-foreground">
              {t("highlightsTitle")}
            </h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {highlights.map((h) => (
                <div key={h.title}>
                  <h4 className="text-sm font-bold text-emerald">{h.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {h.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Kosten + verbeterplan */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl border border-line/70 bg-navy/40 p-6">
            <h3 className="text-base font-bold text-foreground">
              {t("costNoteTitle")}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              {t("costNote")}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="h-full rounded-2xl border border-line/70 bg-navy/40 p-6">
            <h3 className="text-base font-bold text-foreground">
              {t("improveTitle")}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              {t("improveText")}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Bronnen */}
      <Reveal delay={0.05}>
        <div className="mt-12 rounded-2xl border border-line/70 bg-navy/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald">
            {t("sourcesTitle")}
          </h3>
          <p className="mt-2 text-sm text-muted">{t("sourcesIntro")}</p>
          <ul className="mt-4 space-y-2.5">
            {sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-2 text-sm leading-relaxed text-foreground/90 underline-offset-4 hover:text-emerald hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald"
                >
                  <ExternalLink
                    size={15}
                    className="mt-0.5 flex-none text-emerald"
                  />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
