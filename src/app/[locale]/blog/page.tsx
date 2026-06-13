import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { PenLine } from "lucide-react";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} eyebrow="Insights" />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line/70 bg-navy/30 p-12 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
            <PenLine size={26} />
          </span>
          <p className="text-sm text-muted">{t("comingSoon")}</p>
        </div>
      </section>
    </>
  );
}
