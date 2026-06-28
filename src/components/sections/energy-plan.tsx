"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";
import {
  ClipboardList,
  FileCheck2,
  TrendingUp,
  BadgeEuro,
  type LucideIcon,
} from "lucide-react";

const steps: { icon: LucideIcon; num: string }[] = [
  { icon: ClipboardList, num: "01" },
  { icon: FileCheck2, num: "02" },
  { icon: TrendingUp, num: "03" },
  { icon: BadgeEuro, num: "04" },
];

export function EnergyPlan({ showHeading = true }: { showHeading?: boolean }) {
  const t = useTranslations("EnergyPlan");

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

      <div
        className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-4 ${
          showHeading ? "mt-14" : ""
        }`}
      >
        {steps.map(({ icon: Icon, num }, i) => (
          <Reveal key={num} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-line/70 bg-navy/40 p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <Icon size={24} />
                </span>
                <span className="text-2xl font-extrabold text-line">{num}</span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {t(`steps.${i}.title`)}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
                {t(`steps.${i}.desc`)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
