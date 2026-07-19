"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, ListChecks, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/lib/academy/lesson";

export function LessonQuiz({ questions }: { questions: Quiz[] }) {
  const t = useTranslations("Academy.Lesson");

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const quiz = questions[current];

  function check() {
    if (selected === null || checked) return;
    setChecked(true);
    if (selected === quiz.answer) setScore((s) => s + 1);
  }

  function next() {
    if (current + 1 >= total) {
      setDone(true);
      return;
    }
    setCurrent((c) => c + 1);
    setSelected(null);
    setChecked(false);
  }

  function restart() {
    setCurrent(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald/10 text-emerald">
          <ListChecks size={26} />
        </span>
        <p className="mt-5 text-xl font-bold">
          {t("quizDone", { score, total })}
        </p>
        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-emerald/60 hover:text-emerald"
        >
          <RotateCcw size={16} />
          {t("restartQuiz")}
        </button>
      </div>
    );
  }

  const isCorrect = checked && selected === quiz.answer;

  return (
    <div className="glass rounded-3xl p-7 sm:p-9">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald">
        {t("quizQuestionOf", { current: current + 1, total })}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug">{quiz.q}</h3>

      <div className="mt-6 grid gap-3">
        {quiz.options.map((opt, i) => {
          const isSelected = selected === i;
          const showCorrect = checked && i === quiz.answer;
          const showWrong = checked && isSelected && i !== quiz.answer;
          return (
            <button
              key={i}
              type="button"
              disabled={checked}
              onClick={() => setSelected(i)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
                showCorrect
                  ? "border-emerald bg-emerald/10 text-emerald"
                  : showWrong
                    ? "border-red-500/60 bg-red-500/10 text-red-300"
                    : isSelected
                      ? "border-emerald/60 bg-emerald/5 text-foreground"
                      : "border-line text-foreground/90 hover:border-emerald/40",
                checked && "cursor-default",
              )}
            >
              <span>{opt}</span>
              {showCorrect && <CheckCircle2 size={18} className="shrink-0" />}
              {showWrong && <XCircle size={18} className="shrink-0" />}
            </button>
          );
        })}
      </div>

      {checked && (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-xl border px-4 py-3 text-sm font-medium",
            isCorrect
              ? "border-emerald/40 bg-emerald/10 text-emerald"
              : "border-red-500/30 bg-red-500/10 text-red-300",
          )}
        >
          {isCorrect
            ? t("correct")
            : t("incorrect", { answer: quiz.options[quiz.answer] })}
        </p>
      )}

      <div className="mt-7">
        {!checked ? (
          <button
            type="button"
            onClick={check}
            disabled={selected === null}
            className="rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("checkAnswer")}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95"
          >
            {t("nextQuestion")}
          </button>
        )}
      </div>
    </div>
  );
}
