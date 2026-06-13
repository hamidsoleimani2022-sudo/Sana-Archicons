import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Link } from "@/i18n/navigation";
import { CalendarClock, Bell } from "lucide-react";

export default async function WebinarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Webinars");

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} eyebrow="Live · Online" />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="glass relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-emerald/20 blur-3xl" />
          <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
            <CalendarClock size={30} />
          </span>
          <h2 className="relative mt-6 text-2xl font-bold">{t("comingSoon")}</h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-muted">
            {t("comingSoonDesc")}
          </p>
          <Link
            href="/register"
            className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
          >
            <Bell size={16} />
            {t("notify")}
          </Link>
        </div>
      </section>
    </>
  );
}
