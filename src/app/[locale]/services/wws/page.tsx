import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { WWS } from "@/components/sections/wws";
import { CtaBanner } from "@/components/sections/cta";

export default async function WWSPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("WWS");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <WWS showHeading={false} />
      <CtaBanner />
    </>
  );
}
