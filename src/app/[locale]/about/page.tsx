import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { CtaBanner } from "@/components/sections/cta";
import { Reveal } from "@/components/reveal";
import { Building2, Zap, BrainCircuit, BadgeCheck, User } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const expertise = [
    { icon: Building2, title: t("exp1Title"), desc: t("exp1Desc") },
    { icon: Zap, title: t("exp2Title"), desc: t("exp2Desc") },
    { icon: BrainCircuit, title: t("exp3Title"), desc: t("exp3Desc") },
  ];

  const certs = [t("cert1"), t("cert2"), t("cert3")];

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("lead")}
        eyebrow={t("subtitle")}
      />

      {/* Founder section */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Photo placeholder */}
            <div className="flex items-center justify-center">
              <div className="relative flex h-80 w-72 items-center justify-center overflow-hidden rounded-3xl border border-line/60 bg-navy/60 shadow-2xl shadow-black/40 sm:h-96 sm:w-80">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald/5 to-transparent" />
                <div className="flex flex-col items-center gap-3 text-muted/50">
                  <User size={56} strokeWidth={1} />
                  <span className="text-sm">{t("photoPlaceholder")}</span>
                </div>
                {/* decorative corner badge */}
                <div className="absolute bottom-4 right-4 rounded-xl border border-emerald/30 bg-navy px-3 py-1.5 text-xs font-semibold text-emerald">
                  AI Consultant
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald">
                {t("founderTitle")}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("founderName")}
              </h2>
              <p className="mt-1 text-base font-medium text-muted">
                {t("founderRole")}
              </p>
              <p className="mt-5 text-base leading-relaxed text-muted">
                {t("founderBio")}
              </p>

              {/* Mission & Vision */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line/60 bg-navy/50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
                    {t("missionTitle")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t("mission")}
                  </p>
                </div>
                <div className="rounded-xl border border-line/60 bg-navy/50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald">
                    {t("visionTitle")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t("vision")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Expertise */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <Reveal>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {t("expertiseTitle")}
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {expertise.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-line/70 bg-navy/40 p-6 transition-all hover:-translate-y-0.5 hover:border-emerald/40">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <Reveal>
          <div className="rounded-2xl border border-line/60 bg-navy/40 p-8">
            <h2 className="text-xl font-bold text-foreground">{t("certsTitle")}</h2>
            <ul className="mt-6 space-y-3">
              {certs.map((cert) => (
                <li key={cert} className="flex items-center gap-3">
                  <BadgeCheck size={18} className="shrink-0 text-emerald" />
                  <span className="text-sm text-muted">{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}
