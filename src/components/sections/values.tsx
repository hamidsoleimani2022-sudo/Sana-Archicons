"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/reveal";
import { Lightbulb, ShieldCheck, Leaf, Award, Rocket } from "lucide-react";

const values = [
  { icon: Lightbulb, key: "v1" },
  { icon: ShieldCheck, key: "v2" },
  { icon: Leaf, key: "v3" },
  { icon: Award, key: "v4" },
  { icon: Rocket, key: "v5" },
] as const;

export function Values() {
  const t = useTranslations("Values");

  return (
    <section className="border-y border-line/50 bg-navy/30">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <Reveal>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald">
              {t("title")}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {values.map(({ icon: Icon, key }) => (
                <span
                  key={key}
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80"
                >
                  <Icon size={17} className="text-emerald" />
                  {t(key)}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
