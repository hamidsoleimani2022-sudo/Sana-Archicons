import { setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth/auth-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-5 py-16">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-[0.1]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald/15 blur-[100px]" />
      <div className="relative">
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
