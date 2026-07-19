import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLessonBySlug } from "@/lib/academy/lesson";
import { LessonQuiz } from "@/components/academy/lesson-quiz";
import { Lightbulb, BookOpen, ArrowLeft } from "lucide-react";

export default async function AcademyLessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Academy.Lesson");

  // Fase 1: hardcoded testdata · Fase 2: uit Supabase lezen
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const exampleLabels = [
    t("example1Label"),
    t("example2Label"),
    t("example3Label"),
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/50">
        <div className="tech-grid pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[30rem] -translate-x-1/2 rounded-full bg-emerald/15 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-16 sm:py-20">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald">
              {t("eyebrow")}
            </span>
            <span className="rounded-full border border-emerald/30 bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald">
              {t("demoBadge")}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {lesson.title}
          </h1>
          <p className="mt-4 max-w-2xl text-muted">{lesson.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14">
        {/* Kernpunten */}
        <div className="glass rounded-3xl p-7 sm:p-9">
          <h2 className="flex items-center gap-3 text-xl font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
              <Lightbulb size={20} />
            </span>
            {t("keyPointsTitle")}
          </h2>
          <ul className="mt-5 space-y-3">
            {lesson.keyPoints.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />
                <span className="text-foreground/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Begrippen met voorbeelden */}
        <h2 className="mt-14 flex items-center gap-3 text-xl font-bold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
            <BookOpen size={20} />
          </span>
          {t("termsTitle")}
        </h2>
        <div className="mt-6 space-y-6">
          {lesson.terms.map((term) => (
            <article key={term.term} className="glass rounded-3xl p-7 sm:p-9">
              <h3 className="text-lg font-bold text-emerald">{term.term}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {t("meaningLabel")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {term.meaning}
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {t("examplesLabel")}
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-3">
                {term.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-line bg-navy-soft/50 p-4"
                  >
                    <div className="text-xs font-semibold text-emerald">
                      {exampleLabels[i]}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
                      {ex}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Quiz */}
        <h2 className="mt-14 text-xl font-bold">{t("quizTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("quizSubtitle")}</p>
        <div className="mt-6">
          <LessonQuiz questions={lesson.terms.map((term) => term.quiz)} />
        </div>

        <div className="mt-12">
          <Link
            href="/academie"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-emerald"
          >
            <ArrowLeft size={16} />
            {t("backToAcademy")}
          </Link>
        </div>
      </section>
    </>
  );
}
