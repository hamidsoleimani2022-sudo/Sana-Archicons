"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";

export function AcademyTeaser() {
  const t = useTranslations("Academy");

  return (
    <section className="mx-auto max-w-7xl px-5 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="glass glow-emerald relative overflow-hidden rounded-3xl p-1"
      >
        <div className="relative flex flex-col items-center gap-6 rounded-[1.35rem] bg-gradient-to-r from-navy-soft to-ink px-7 py-8 sm:flex-row sm:justify-between sm:px-10">
          <div className="pointer-events-none absolute -top-20 left-1/4 h-48 w-48 rounded-full bg-emerald/20 blur-[90px]" />
          <div className="relative flex items-center gap-5 text-center sm:text-left">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald/10 text-emerald sm:flex">
              <GraduationCap size={28} />
            </span>
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                {t("homeTitle")}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-muted">
                {t("homeDesc")}
              </p>
            </div>
          </div>
          <Link
            href="/academie"
            className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-ink shadow-xl shadow-emerald/25 transition-transform hover:scale-[1.03] active:scale-95"
          >
            {t("homeCta")}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
