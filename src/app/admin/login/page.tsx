import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Al ingelogd? Direct door naar het panel.
  if (await isAuthed()) redirect("/admin");
  const lang = await getAdminLang();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-5 py-16">
      <LoginForm lang={lang} />
    </main>
  );
}
