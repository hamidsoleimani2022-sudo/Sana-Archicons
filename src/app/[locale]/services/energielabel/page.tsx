import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { EnergyLabel } from "@/components/sections/energy-label";
import { CtaBanner } from "@/components/sections/cta";

export default async function EnergielabelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("EnergyLabel");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <EnergyLabel showHeading={false} />
      <CtaBanner />
    </>
  );
}
