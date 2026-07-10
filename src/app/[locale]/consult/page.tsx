import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ConsultationForm } from "@/components/consult/consultation-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Consult" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ConsultPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Consult" });

  return (
    <>
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* Uitleg */}
          <div>
            <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {t("sideTitle")}
            </h2>
            <p className="mt-4 text-muted">{t("sideBody")}</p>

            <ul className="mt-8 space-y-4">
              {(["bullet1", "bullet2", "bullet3"] as const).map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm text-foreground/85">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald/15 text-emerald">
                    <CheckCircle2 size={15} />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          {/* Formulier */}
          <ConsultationForm />
        </div>
      </section>
    </>
  );
}
