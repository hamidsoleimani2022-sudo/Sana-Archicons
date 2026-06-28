import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { EnergyPlan } from "@/components/sections/energy-plan";
import { CtaBanner } from "@/components/sections/cta";

export default async function VerbeterplanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("EnergyPlan");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <EnergyPlan showHeading={false} />
      <CtaBanner />
    </>
  );
}
