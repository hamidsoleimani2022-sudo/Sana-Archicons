"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { OAuthButtons } from "./oauth-buttons";
import { Loader2 } from "lucide-react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isSupabaseConfigured) {
      setError(t("notConfigured"));
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setInfo(t("checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-line bg-navy/40 px-4 py-3 text-sm text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-emerald/60";

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold">
          {isRegister ? t("registerTitle") : t("loginTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isRegister ? t("registerSubtitle") : t("loginSubtitle")}
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("name")}</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("email")}</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">{t("password")}</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg bg-emerald/10 px-3 py-2 text-sm text-emerald">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isRegister ? t("registerBtn") : t("loginBtn")}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          {t("or")}
          <span className="h-px flex-1 bg-line" />
        </div>

        <OAuthButtons />

        <p className="mt-7 text-center text-sm text-muted">
          {isRegister ? t("haveAccount") : t("noAccount")}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-semibold text-emerald hover:underline"
          >
            {isRegister ? t("signIn") : t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
