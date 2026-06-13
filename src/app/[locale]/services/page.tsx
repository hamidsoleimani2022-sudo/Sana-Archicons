import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Services } from "@/components/sections/services";
import { CtaBanner } from "@/components/sections/cta";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Services");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} eyebrow="Sana Archicons" />
      <Services />
      <CtaBanner />
    </>
  );
}
