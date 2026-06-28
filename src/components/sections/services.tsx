"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";
import {
  Building2,
  BrainCircuit,
  Workflow,
  Gauge,
  TrendingUp,
  Calculator,
  ArrowRight,
} from "lucide-react";

const items = [
  { icon: Building2, key: "s1", href: "/services" },
  { icon: TrendingUp, key: "s2", href: "/services/verbeterplan" }, // Verbeterplan (energieadvies + verbeterplan energielabel samengevoegd)
  { icon: BrainCircuit, key: "s3", href: "/booking" },
  { icon: Workflow, key: "s4", href: "/services" },
] as const;

// Extra woning-diensten — alleen op de Diensten-pagina (full)
const energyItems = [
  { icon: Gauge, key: "s5", href: "/services/energielabel" },
  { icon: Calculator, key: "s6", href: "/services/wws" },
] as const;

export function Services({
  full = false,
  showHeading = true,
}: {
  full?: boolean;
  showHeading?: boolean;
}) {
  const t = useTranslations("Services");
  const cards = full ? [...items, ...energyItems] : items;

  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20">
      {showHeading && (
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-muted">{t("subtitle")}</p>
          </div>
        </Reveal>
      )}

      <div
        className={`grid gap-6 sm:grid-cols-2 ${showHeading ? "mt-14 " : ""}${
          full ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {cards.map(({ icon: Icon, key, href }, i) => (
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
