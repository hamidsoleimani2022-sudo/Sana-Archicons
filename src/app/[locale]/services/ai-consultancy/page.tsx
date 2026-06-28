import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { AIDepartment } from "@/components/sections/ai-department";
import { CtaBanner } from "@/components/sections/cta";

export default async function AIConsultancyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AI");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <AIDepartment showHeading={false} />
      <CtaBanner />
    </>
  );
}
