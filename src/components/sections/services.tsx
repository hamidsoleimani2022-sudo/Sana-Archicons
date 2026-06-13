"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import { Building2, Zap, BrainCircuit, Workflow, ArrowRight } from "lucide-react";

const items = [
  { icon: Building2, key: "s1", href: "/services" },
  { icon: Zap, key: "s2", href: "/services" },
  { icon: BrainCircuit, key: "s3", href: "/booking" },
  { icon: Workflow, key: "s4", href: "/services" },
] as const;

export function Services() {
  const t = useTranslations("Services");

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted">{t("subtitle")}</p>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, key, href }, i) => (
          <Reveal key={key} delay={i * 0.08}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-2xl border border-line/70 bg-navy/40 p-6 transition-all hover:-translate-y-1 hover:border-emerald/50 hover:bg-navy-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald transition-colors group-hover:bg-emerald group-hover:text-ink">
                <Icon size={24} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
                {t(`${key}Desc`)}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
                {t("learnMore")}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
