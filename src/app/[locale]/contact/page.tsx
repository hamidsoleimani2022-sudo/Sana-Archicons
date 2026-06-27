"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const subject = (form.elements.namedItem("subject") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    const body = `Naam: ${name}\nE-mail: ${email}\n\n${message}`;
    window.location.href = `mailto:info@sana-archicons.nl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        eyebrow={t("eyebrow")}
      />

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 lg:grid-cols-2">

          {/* Contact form */}
          <div className="rounded-2xl border border-line/70 bg-navy/40 p-8">
            <h2 className="text-xl font-bold text-foreground">{t("formTitle")}</h2>

            {sent ? (
              <div className="mt-8 rounded-xl border border-emerald/40 bg-emerald/10 p-6 text-center">
                <p className="text-base font-semibold text-emerald">✓ Uw e-mailprogramma is geopend</p>
                <p className="mt-2 text-sm text-muted">Verstuur het bericht vanuit uw e-mailprogramma om contact op te nemen.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                      {t("name")}
                    </label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full rounded-xl border border-line/70 bg-navy/60 px-4 py-3 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/60 focus:ring-1 focus:ring-emerald/30"
                      placeholder="Uw naam"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                      {t("email")}
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-xl border border-line/70 bg-navy/60 px-4 py-3 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/60 focus:ring-1 focus:ring-emerald/30"
                      placeholder="uw@email.nl"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                    {t("subject")}
                  </label>
                  <input
                    name="subject"
                    type="text"
                    required
                    className="w-full rounded-xl border border-line/70 bg-navy/60 px-4 py-3 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/60 focus:ring-1 focus:ring-emerald/30"
                    placeholder="Onderwerp"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground/80">
                    {t("message")}
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    required
                    className="w-full resize-none rounded-xl border border-line/70 bg-navy/60 px-4 py-3 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/60 focus:ring-1 focus:ring-emerald/30"
                    placeholder="Hoe kunnen wij u helpen?"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-emerald/20 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  {t("send")}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-8">
            <div className="rounded-2xl border border-line/70 bg-navy/40 p-8">
              <h2 className="text-xl font-bold text-foreground">{t("infoTitle")}</h2>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <Mail size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted">{t("emailLabel")}</p>
                    <a
                      href="mailto:info@sana-archicons.nl"
                      className="mt-0.5 text-sm font-medium text-foreground transition-colors hover:text-emerald"
                    >
                      info@sana-archicons.nl
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <Phone size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted">{t("phoneLabel")}</p>
                    <a
                      href="tel:+31655861642"
                      className="mt-0.5 text-sm font-medium text-foreground transition-colors hover:text-emerald"
                    >
                      +31 6 55861642
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted">{t("locationLabel")}</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{t("locationValue")}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald/10 text-emerald">
                    <Clock size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted">Beschikbaarheid</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{t("hours")}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Book CTA card */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald/30 bg-navy/60 p-8">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald/10 blur-2xl" />
              <p className="relative text-sm font-medium text-muted">{t("orBook")}</p>
              <p className="relative mt-2 text-lg font-bold text-foreground">
                60 min · €85 · Telefonisch of op locatie
              </p>
              <Link
                href="/booking"
                className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-emerald/50 px-5 py-2.5 text-sm font-semibold text-emerald transition hover:bg-emerald hover:text-ink"
              >
                {t("bookBtn")}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
