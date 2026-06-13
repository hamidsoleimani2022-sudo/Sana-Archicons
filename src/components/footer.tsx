import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";
import { Mail, MapPin } from "lucide-react";

function LinkedinGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-emerald" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34v-7.2H6.06v7.2h2.28zM7.2 10a1.32 1.32 0 1 0 0-2.64A1.32 1.32 0 0 0 7.2 10zm11.14 8.34v-3.95c0-2.11-.45-3.74-2.92-3.74-1.19 0-1.98.65-2.31 1.27h-.03v-1.08h-2.19v7.2h2.28v-3.56c0-.94.18-1.85 1.34-1.85 1.15 0 1.16 1.07 1.16 1.91v3.5h2.4z" />
    </svg>
  );
}

export function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Nav");

  return (
    <footer className="relative mt-24 border-t border-line/60 bg-navy/40">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-[0.12]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">{t("tagline")}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-emerald/80">
            {t("madeWith")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("navTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/" className="hover:text-emerald">{nav("home")}</Link></li>
            <li><Link href="/services" className="hover:text-emerald">{nav("services")}</Link></li>
            <li><Link href="/about" className="hover:text-emerald">{nav("about")}</Link></li>
            <li><Link href="/webinars" className="hover:text-emerald">{nav("webinars")}</Link></li>
            <li><Link href="/blog" className="hover:text-emerald">{nav("blog")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("servicesTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/services" className="hover:text-emerald">Bouwkundig Advies</Link></li>
            <li><Link href="/services" className="hover:text-emerald">Energieadvies</Link></li>
            <li><Link href="/services" className="hover:text-emerald">AI Consultancy</Link></li>
            <li><Link href="/services" className="hover:text-emerald">Procesautomatisering</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("contactTitle")}
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-emerald" />
              <a href="mailto:info@sana-archicons.nl" className="hover:text-emerald">
                info@sana-archicons.nl
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={16} className="text-emerald" />
              Nederland
            </li>
            <li className="flex items-center gap-2.5">
              <LinkedinGlyph />
              <a href="#" className="hover:text-emerald">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-line/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Sana Archicons. {t("rights")}</p>
          <p className="uppercase tracking-[0.16em]">{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
