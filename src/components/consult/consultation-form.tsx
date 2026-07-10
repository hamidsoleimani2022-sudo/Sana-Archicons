"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { submitLead } from "@/app/actions/lead";
import {
  leadSchema,
  SERVICE_OPTIONS,
  TIME_OPTIONS,
  type LeadInput,
  type LeadFieldErrors,
} from "@/lib/leads/validation";

const EMPTY: LeadInput = {
  full_name: "",
  phone: "",
  email: "",
  business_name: "",
  service: "" as LeadInput["service"],
  message: "",
  preferred_time: "",
};

const FIELD_ORDER: (keyof LeadInput)[] = [
  "full_name",
  "phone",
  "email",
  "business_name",
  "service",
  "message",
  "preferred_time",
];

type Status = "idle" | "submitting" | "success" | "error";

const inputCls =
  "w-full rounded-xl border bg-navy/60 px-4 py-3 text-sm text-foreground placeholder-muted/50 outline-none transition focus:ring-1 focus:ring-emerald/30";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground/80";
const errorCls = "mt-1.5 text-xs text-red-400";

function borderCls(hasError?: boolean) {
  return hasError
    ? "border-red-400/70 focus:border-red-400"
    : "border-line/70 focus:border-emerald/60";
}

export function ConsultationForm() {
  const t = useTranslations("Consult");
  const locale = useLocale();
  const [values, setValues] = useState<LeadInput>(EMPTY);
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateField(key: keyof LeadInput) {
    const result = leadSchema.safeParse(values);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === key);
      if (issue) setErrors((e) => ({ ...e, [key]: issue.message }));
    }
  }

  // Foutcodes uit het schema → vertaalde teksten
  function errText(code?: string): string | undefined {
    if (!code) return undefined;
    return t(`errors.${code}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    const result = leadSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: LeadFieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof LeadInput;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const firstInvalid = FIELD_ORDER.find((k) => fieldErrors[k]);
      if (firstInvalid) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)
          ?.focus();
      }
      return;
    }

    setStatus("submitting");
    try {
      const res = await submitLead(result.data, locale);
      if (res.ok) {
        setStatus("success");
        setValues(EMPTY);
        setErrors({});
        requestAnimationFrame(() => successRef.current?.focus());
      } else {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        setFormError(res.formError ? t(`errors.${res.formError}`) : t("errors.fix_errors"));
        setStatus("error");
      }
    } catch {
      setFormError(t("errors.network"));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-line/70 bg-navy/40 p-8">
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className="flex flex-col items-center py-10 text-center outline-none"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald/15 text-emerald">
            <CheckCircle2 size={34} />
          </span>
          <h3 className="mt-6 text-xl font-bold text-foreground">{t("successTitle")}</h3>
          <p className="mt-3 max-w-sm text-sm text-muted">{t("successBody")}</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm font-medium text-emerald underline-offset-4 hover:underline"
          >
            {t("another")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line/70 bg-navy/40 p-6 sm:p-8">
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {formError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="full_name"
            label={t("name")}
            required
            value={values.full_name}
            error={errText(errors.full_name)}
            onChange={(v) => update("full_name", v)}
            onBlur={() => validateField("full_name")}
            autoComplete="name"
          />
          <Field
            name="phone"
            label={t("phone")}
            required
            type="tel"
            inputMode="tel"
            value={values.phone}
            error={errText(errors.phone)}
            onChange={(v) => update("phone", v)}
            onBlur={() => validateField("phone")}
            autoComplete="tel"
          />
          <Field
            name="email"
            label={t("email")}
            type="email"
            inputMode="email"
            value={values.email ?? ""}
            error={errText(errors.email)}
            onChange={(v) => update("email", v)}
            onBlur={() => validateField("email")}
            autoComplete="email"
          />
          <Field
            name="business_name"
            label={t("business")}
            value={values.business_name ?? ""}
            error={errText(errors.business_name)}
            onChange={(v) => update("business_name", v)}
            autoComplete="organization"
          />
          <div className="sm:col-span-2">
            <label htmlFor="service" className={labelCls}>
              {t("service")}
              <Req />
            </label>
            <select
              id="service"
              name="service"
              value={values.service}
              required
              aria-invalid={!!errors.service}
              onChange={(e) => update("service", e.target.value as LeadInput["service"])}
              onBlur={() => validateField("service")}
              className={`${inputCls} cursor-pointer appearance-none ${borderCls(!!errors.service)} ${
                values.service ? "text-foreground" : "text-muted/60"
              }`}
            >
              <option value="" disabled>
                {t("servicePlaceholder")}
              </option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-navy text-foreground">
                  {t(`services.${opt}`)}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className={errorCls} aria-live="polite">
                {errText(errors.service)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="message" className={labelCls}>
            {t("message")}
            <Req />
          </label>
          <textarea
            id="message"
            name="message"
            value={values.message}
            required
            rows={4}
            aria-invalid={!!errors.message}
            onChange={(e) => update("message", e.target.value)}
            onBlur={() => validateField("message")}
            placeholder={t("messagePlaceholder")}
            className={`${inputCls} resize-y leading-6 ${borderCls(!!errors.message)}`}
          />
          {errors.message && (
            <p className={errorCls} aria-live="polite">
              {errText(errors.message)}
            </p>
          )}
        </div>

        <div className="mt-5 sm:max-w-[50%]">
          <label htmlFor="preferred_time" className={labelCls}>
            {t("time")}
          </label>
          <select
            id="preferred_time"
            name="preferred_time"
            value={values.preferred_time ?? ""}
            onChange={(e) =>
              update("preferred_time", e.target.value as LeadInput["preferred_time"])
            }
            className={`${inputCls} cursor-pointer appearance-none ${borderCls(false)} ${
              values.preferred_time ? "text-foreground" : "text-muted/60"
            }`}
          >
            <option value="">{t("timePlaceholder")}</option>
            {TIME_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-navy text-foreground">
                {t(`times.${opt}`)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-emerald/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
                aria-hidden="true"
              />
              {t("submitting")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-muted">{t("footnote")}</p>
      </form>
    </div>
  );
}

function Req() {
  return (
    <span className="text-emerald" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

type FieldProps = {
  name: string;
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  type?: string;
  inputMode?: "tel" | "email" | "text";
  autoComplete?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
};

function Field({
  name,
  label,
  value,
  error,
  required,
  type = "text",
  inputMode,
  autoComplete,
  onChange,
  onBlur,
}: FieldProps) {
  const errId = error ? `${name}-error` : undefined;
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
        {required && <Req />}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        value={value}
        required={required}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={errId}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={`${inputCls} ${borderCls(!!error)}`}
      />
      {error && (
        <p id={errId} className={errorCls} aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
