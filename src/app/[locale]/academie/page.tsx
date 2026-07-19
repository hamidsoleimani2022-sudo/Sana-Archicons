import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/i18n/navigation";
import {
  GraduationCap,
  Users,
  Upload,
  Sparkles,
  Share2,
  ArrowRight,
} from "lucide-react";

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Academy");

  const steps = [
    { icon: Upload, title: t("how1Title"), desc: t("how1Desc") },
    { icon: Sparkles, title: t("how2Title"), desc: t("how2Desc") },
    { icon: Share2, title: t("how3Title"), desc: t("how3Desc") },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        eyebrow="Energielabel · E-learning"
      />

      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="glass relative overflow-hidden rounded-3xl p-8">
            <div className="pointer-events-none absolute -top-12 right-0 h-36 w-36 rounded-full bg-emerald/15 blur-3xl" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
              <GraduationCap size={26} />
            </span>
            <h2 className="relative mt-5 text-xl font-bold">
              {t("teacherCardTitle")}
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-muted">
              {t("teacherCardDesc")}
            </p>
            <Link
              href="/academie/docent"
              className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-emerald/20 transition-transform hover:scale-[1.03] active:scale-95"
            >
              {t("teacherCardCta")}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="glass relative overflow-hidden rounded-3xl p-8">
            <div className="pointer-events-none absolute -top-12 right-0 h-36 w-36 rounded-full bg-emerald-bright/10 blur-3xl" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
              <Users size={26} />
            </span>
            <h2 className="relative mt-5 text-xl font-bold">
              {t("studentCardTitle")}
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-muted">
              {t("studentCardDesc")}
            </p>
            <Link
              href="/academie/les/voorbeeld"
              className="group relative mt-6 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-emerald/60 hover:text-emerald"
            >
              {t("studentCardCta")}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("howTitle")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="glass rounded-3xl p-7 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <s.icon size={22} />
                </span>
                <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
                  {i + 1}
                </div>
                <h3 className="mt-1 font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
