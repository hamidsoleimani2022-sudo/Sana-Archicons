"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { Logo } from "@/components/logo";
import { getDict, type AdminLang } from "@/lib/admin/i18n";

const ERROR_TEXT: Record<string, Record<AdminLang, string>> = {
  no_password_configured: {
    nl: "Het beheerderswachtwoord is niet ingesteld op de server (ADMIN_PASSWORD).",
    en: "The admin password is not configured on the server (ADMIN_PASSWORD).",
    fa: "رمز مدیر روی سرور تنظیم نشده است (ADMIN_PASSWORD).",
  },
  wrong_password: {
    nl: "Onjuist wachtwoord.",
    en: "Incorrect password.",
    fa: "رمز عبور نادرست است.",
  },
};

export function LoginForm({ lang }: { lang: AdminLang }) {
  const d = getDict(lang);
  const [state, formAction, pending] = useActionState(login, {});

  const errorText = state?.error
    ? ERROR_TEXT[state.error]?.[lang] ?? d.common.error
    : null;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-line/70 bg-navy/40 p-7 sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo />
        <h1 className="mt-5 text-xl font-bold text-foreground">{d.login.title}</h1>
        <p className="mt-2 text-sm text-muted">{d.login.subtitle}</p>
      </div>

      <form action={formAction} noValidate>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground/80">
          {d.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          dir="ltr"
          className="w-full rounded-xl border border-line/70 bg-navy/60 px-4 py-3 text-sm text-foreground outline-none transition focus:border-emerald/60 focus:ring-1 focus:ring-emerald/30"
        />

        {errorText && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            {errorText}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-emerald/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {pending ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
                aria-hidden="true"
              />
              {d.login.submitting}
            </>
          ) : (
            d.login.submit
          )}
        </button>
      </form>
    </div>
  );
}
