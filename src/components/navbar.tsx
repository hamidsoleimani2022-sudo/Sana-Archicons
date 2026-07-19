"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "./logo";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/about", label: t("about") },
    { href: "/assistant", label: t("assistant") },
    { href: "/consult", label: t("consult") },
    { href: "/academie", label: t("academy") },
    { href: "/contact", label: t("contact") },
    { href: "/webinars", label: t("webinars") },
    { href: "/blog", label: t("blog") },
  ] as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "glass shadow-lg shadow-black/30" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-emerald"
                    : "text-muted hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher />
          <Link
            href="/login"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            {t("login")}
          </Link>
          <Link
            href="/booking"
            className="rounded-full bg-emerald px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-emerald/20 transition-transform hover:scale-[1.03] active:scale-95"
          >
            {t("bookCta")}
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="glass border-t border-line/60 px-5 pb-6 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-foreground/90 hover:bg-navy-soft"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <LocaleSwitcher />
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground"
              >
                {t("login")}
              </Link>
              <Link
                href="/booking"
                className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-ink"
              >
                {t("bookCta")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
