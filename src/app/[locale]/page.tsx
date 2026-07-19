import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/sections/hero";
import { AcademyTeaser } from "@/components/sections/academy-teaser";
import { Values } from "@/components/sections/values";
import { Services } from "@/components/sections/services";
import { AboutTeaser } from "@/components/sections/about-teaser";
import { CtaBanner } from "@/components/sections/cta";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <AcademyTeaser />
      <Values />
      <Services />
      <AboutTeaser />
      <CtaBanner />
    </>
  );
}
