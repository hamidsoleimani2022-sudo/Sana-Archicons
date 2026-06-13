"use client";

import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.2 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.2 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.6-3.1-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.2 5.3C41.5 36.4 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0A66C2]" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34v-7.2H6.06v7.2h2.28zM7.2 10a1.32 1.32 0 1 0 0-2.64A1.32 1.32 0 0 0 7.2 10zm11.14 8.34v-3.95c0-2.11-.45-3.74-2.92-3.74-1.19 0-1.98.65-2.31 1.27h-.03v-1.08h-2.19v7.2h2.28v-3.56c0-.94.18-1.85 1.34-1.85 1.15 0 1.16 1.07 1.16 1.91v3.5h2.4z" />
    </svg>
  );
}

export function OAuthButtons() {
  const t = useTranslations("Auth");

  async function signInWith(provider: "google" | "linkedin_oidc") {
    if (!isSupabaseConfigured) {
      alert(t("notConfigured"));
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => signInWith("google")}
        className="flex items-center justify-center gap-3 rounded-xl border border-line bg-navy/40 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-emerald/50 hover:bg-navy-soft"
      >
        <GoogleIcon />
        {t("google")}
      </button>
      <button
        type="button"
        onClick={() => signInWith("linkedin_oidc")}
        className="flex items-center justify-center gap-3 rounded-xl border border-line bg-navy/40 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-emerald/50 hover:bg-navy-soft"
      >
        <LinkedInIcon />
        {t("linkedin")}
      </button>
    </div>
  );
}
