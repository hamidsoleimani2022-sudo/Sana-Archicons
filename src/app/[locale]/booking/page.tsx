import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { CalBooking } from "@/components/booking/cal-booking";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Booking");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} eyebrow="15 min · Gratis" />
      <section className="mx-auto max-w-5xl px-5 py-14">
        <CalBooking calLink="hamid-soleimani-ge0bxu" />
      </section>
    </>
  );
}
