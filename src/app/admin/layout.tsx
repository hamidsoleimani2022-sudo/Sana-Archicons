import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getAdminLang } from "@/lib/admin/lang";
import { langDir } from "@/lib/admin/i18n";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Beheerpanel · Sana Archicons",
    template: "%s · Sana Archicons Admin",
  },
  robots: { index: false, follow: false },
};

/**
 * Eigen root-layout voor /admin (buiten de [locale]-routing van de site).
 * Taal en tekstrichting (fa ⇒ rtl) komen uit de admin-taalcookie.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getAdminLang();

  return (
    <html
      lang={lang}
      dir={langDir(lang)}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-ink text-foreground">{children}</body>
    </html>
  );
}
