import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { TeacherForm } from "@/components/academy/teacher-form";

export default async function AcademyTeacherPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Academy.Teacher");

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        eyebrow={t("eyebrow")}
      />
      <section className="mx-auto max-w-3xl px-5 py-16">
        <TeacherForm />
      </section>
    </>
  );
}
