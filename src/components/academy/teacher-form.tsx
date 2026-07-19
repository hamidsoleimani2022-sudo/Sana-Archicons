"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileText, Upload, Sparkles } from "lucide-react";

export function TeacherForm() {
  const t = useTranslations("Academy.Teacher");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError(t("fileError"));
      setFileName(null);
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ""));
      setFileName(file.name);
      setError(null);
    };
    reader.readAsText(file);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setError(t("emptyError"));
      return;
    }
    setError(null);
    // Fase 1: demo — doorsturen naar de hardcoded voorbeeldles.
    // Fase 2: hier wordt de tekst naar de AI-endpoint gestuurd.
    router.push("/academie/les/voorbeeld");
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-3xl p-7 sm:p-9">
      <label className="block text-sm font-semibold" htmlFor="lesson-title">
        {t("lessonTitleLabel")}
      </label>
      <input
        id="lesson-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("lessonTitlePlaceholder")}
        className="mt-2 w-full rounded-xl border border-line bg-navy-soft/60 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-emerald/60"
      />

      <label
        className="mt-6 block text-sm font-semibold"
        htmlFor="lesson-text"
      >
        {t("textLabel")}
      </label>
      <textarea
        id="lesson-text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFileName(null);
        }}
        placeholder={t("textPlaceholder")}
        rows={10}
        className="mt-2 w-full resize-y rounded-xl border border-line bg-navy-soft/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-emerald/60"
      />
      <div className="mt-1.5 text-right text-xs text-muted">
        {t("charCount", { count: text.length })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted">{t("orUpload")}</span>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-emerald/60 hover:text-emerald"
        >
          <Upload size={16} />
          {t("uploadButton")}
        </button>
        <span className="text-xs text-muted">{t("uploadHint")}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {fileName && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-4 py-1.5 text-xs font-semibold text-emerald">
          <FileText size={14} />
          {t("fileLoaded", { name: fileName })}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-ink shadow-xl shadow-emerald/25 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <Sparkles size={17} />
          {t("generateButton")}
        </button>
        <p className="text-xs text-muted">{t("generateDemoNote")}</p>
      </div>
    </form>
  );
}
