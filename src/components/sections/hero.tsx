"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const t = useTranslations("Hero");

  const stats = [
    { v: t("stat1Value"), l: t("stat1Label") },
    { v: t("stat2Value"), l: t("stat2Label") },
    { v: t("stat3Value"), l: t("stat3Label") },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] animate-grid" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-emerald-bright/10 blur-[100px]" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-1.5 text-xs font-semibold text-emerald"
          >
            <Sparkles size={14} />
            {t("badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t("titleLead")}{" "}
            <span className="text-gradient">{t("titleHighlight")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/booking"
              className="group inline-flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-ink shadow-xl shadow-emerald/25 transition-transform hover:scale-[1.03] active:scale-95"
            >
              {t("ctaPrimary")}
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald/60 hover:text-emerald"
            >
              {t("ctaSecondary")}
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.36 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6"
          >
            {stats.map((s) => (
              <div key={s.l}>
                <dt className="text-2xl font-extrabold text-foreground sm:text-3xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-xs text-muted">{s.l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="animate-float glass glow-emerald relative aspect-square rounded-3xl p-1">
            <div className="flex h-full flex-col justify-between rounded-[1.35rem] bg-gradient-to-br from-navy-soft to-ink p-7">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                  AI · Strategy
                </span>
                <span className="h-3 w-3 animate-glow rounded-full bg-emerald" />
              </div>

              {/* Stylised neural network */}
              <svg viewBox="0 0 220 180" className="my-2 w-full" fill="none">
                {[40, 90, 140].map((y) => (
                  <circle key={`a${y}`} cx="30" cy={y} r="7" fill="var(--color-emerald)" opacity="0.9" />
                ))}
                {[30, 70, 110, 150].map((y) => (
                  <circle key={`b${y}`} cx="110" cy={y} r="7" fill="var(--color-emerald-bright)" opacity="0.7" />
                ))}
                {[60, 110].map((y) => (
                  <circle key={`c${y}`} cx="190" cy={y} r="7" fill="var(--color-emerald)" />
                ))}
                <g stroke="var(--color-emerald)" strokeWidth="1" opacity="0.35">
                  {[40, 90, 140].map((y1) =>
                    [30, 70, 110, 150].map((y2) => (
                      <line key={`l${y1}-${y2}`} x1="30" y1={y1} x2="110" y2={y2} />
                    )),
                  )}
                  {[30, 70, 110, 150].map((y1) =>
                    [60, 110].map((y2) => (
                      <line key={`m${y1}-${y2}`} x1="110" y1={y1} x2="190" y2={y2} />
                    )),
                  )}
                </g>
              </svg>

              <div className="space-y-2">
                <div className="h-2 w-3/4 rounded-full bg-line" />
                <div className="h-2 w-1/2 rounded-full bg-line/70" />
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald/20 bg-emerald/5 px-3 py-2.5">
                  <span className="text-xs font-semibold text-emerald">●</span>
                  <span className="text-xs text-foreground/80">
                    Intelligent · Datagedreven · Duurzaam
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
