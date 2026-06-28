import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { BouwkundigAdvies } from "@/components/sections/bouwkundig-advies";
import { CtaBanner } from "@/components/sections/cta";

export default async function BouwkundigPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Bouwkundig");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <BouwkundigAdvies showHeading={false} />
      <CtaBanner />
    </>
  );
}
