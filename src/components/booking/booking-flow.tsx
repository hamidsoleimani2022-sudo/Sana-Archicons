"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  Calendar,
  Clock,
  Check,
  Loader2,
  Phone,
  MapPin,
  CreditCard,
  Lock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MeetingType = "phone" | "in_person";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

function nextDays(count: number) {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) days.push(new Date(d)); // skip weekends
  }
  return days;
}

export function BookingFlow() {
  const t = useTranslations("Booking");
  const dt = useTranslations("Dashboard");
  const locale = useLocale();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("phone");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthChecked(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        setEmail(data.user.email ?? "");
        const fullName = (data.user.user_metadata?.full_name as string) ?? "";
        setName(fullName);
      }
      setAuthChecked(true);
    });
  }, []);

  const dateFmt = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const longDateFmt = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  async function confirm() {
    setError(null);
    if (!isSupabaseConfigured) {
      // Demo mode — no DB yet. Show success so the flow is reviewable.
      setStep(3);
      return;
    }
    if (!userId || !date || !time) return;

    setLoading(true);
    const supabase = createClient();
    const [h, m] = time.split(":").map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(h, m, 0, 0);

    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      service: "ai_consult",
      starts_at: startsAt.toISOString(),
      duration_minutes: 60,
      price_cents: 8500,
      currency: "EUR",
      meeting_type: meetingType,
      contact_name: name,
      contact_email: email,
      contact_phone: phone,
      notes,
      status: "pending",
      payment_status: "unpaid",
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep(3);
  }

  // Require login when Supabase is connected.
  if (authChecked && isSupabaseConfigured && !userId && step < 3) {
    return (
      <div className="glass mx-auto max-w-md rounded-3xl p-8 text-center">
        <Lock className="mx-auto text-emerald" size={32} />
        <h2 className="mt-4 text-xl font-bold">{t("loginRequired")}</h2>
        <p className="mt-2 text-sm text-muted">{t("loginRequiredDesc")}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-ink">
            {t("loginRequired")}
          </Link>
        </div>
      </div>
    );
  }

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      {/* Main column */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        {/* Stepper */}
        <div className="mb-8 flex items-center">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    i < step
                      ? "bg-emerald text-ink"
                      : i === step
                        ? "bg-emerald/20 text-emerald ring-2 ring-emerald"
                        : "bg-navy text-muted",
                  )}
                >
                  {i < step ? <Check size={15} /> : i + 1}
                </span>
                <span className={cn("hidden text-xs font-medium sm:block", i === step ? "text-foreground" : "text-muted")}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className={cn("mx-2 h-px flex-1", i < step ? "bg-emerald" : "bg-line")} />
              )}
            </div>
          ))}
        </div>

        {!isSupabaseConfigured && step < 3 && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{t("notConfigured")}</span>
          </div>
        )}

        {/* Step 1 — date & time */}
        {step === 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
              <Calendar size={16} className="text-emerald" /> {t("selectDate")}
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {days.map((d) => {
                const active = date?.toDateString() === d.toDateString();
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { setDate(d); setTime(null); }}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-sm transition-colors",
                      active
                        ? "border-emerald bg-emerald/15 text-foreground"
                        : "border-line bg-navy/30 text-muted hover:border-emerald/40",
                    )}
                  >
                    {dateFmt.format(d)}
                  </button>
                );
              })}
            </div>

            {date && (
              <>
                <h3 className="mb-3 mt-7 flex items-center gap-2 text-sm font-semibold text-muted">
                  <Clock size={16} className="text-emerald" /> {t("selectTime")}
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {TIME_SLOTS.map((slot) => {
                    const active = time === slot;
                    return (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={cn(
                          "rounded-xl border px-2 py-2.5 text-sm transition-colors",
                          active
                            ? "border-emerald bg-emerald/15 text-foreground"
                            : "border-line bg-navy/30 text-muted hover:border-emerald/40",
                        )}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              disabled={!date || !time}
              onClick={() => setStep(1)}
              className="mt-8 w-full rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              {t("continue")}
            </button>
          </div>
        )}

        {/* Step 2 — details */}
        {step === 1 && (
          <div className="space-y-4">
            <Field label={t("name")} value={name} onChange={setName} />
            <Field label={t("email")} value={email} onChange={setEmail} type="email" />
            <Field label={t("phone")} value={phone} onChange={setPhone} type="tel" />
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("meetingType")}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMeetingType("phone")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                    meetingType === "phone" ? "border-emerald bg-emerald/15" : "border-line bg-navy/30 text-muted",
                  )}
                >
                  <Phone size={16} /> {t("phoneCall")}
                </button>
                <button
                  onClick={() => setMeetingType("in_person")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
                    meetingType === "in_person" ? "border-emerald bg-emerald/15" : "border-line bg-navy/30 text-muted",
                  )}
                >
                  <MapPin size={16} /> {t("inPerson")}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t("notes")}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-navy/40 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald/60"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-foreground">
                {t("back")}
              </button>
              <button
                disabled={!name || !email}
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-ink disabled:opacity-50"
              >
                {t("continue")}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — payment */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-navy/30 px-4 py-4">
              <CreditCard className="text-emerald" size={22} />
              <div>
                <p className="text-sm font-semibold">{t("sessionTitle")}</p>
                <p className="text-xs text-muted">{t("duration")} · {t("price")}</p>
              </div>
              <span className="ml-auto text-lg font-extrabold text-emerald">{t("price")}</span>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald/5 px-4 py-3 text-xs text-muted">
              <Lock size={14} className="mt-0.5 shrink-0 text-emerald" />
              {t("paymentNote")}
            </p>
            {error && (
              <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-line px-4 py-3 text-sm font-semibold">
                {t("back")}
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald px-4 py-3 text-sm font-semibold text-ink disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {t("payNow")}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — success */}
        {step === 3 && (
          <div className="py-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/15 text-emerald">
              <Check size={34} />
            </span>
            <h3 className="mt-5 text-xl font-bold">{t("success")}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{t("successDesc")}</p>
            <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-ink">
              {dt("title")}
            </Link>
          </div>
        )}
      </div>

      {/* Summary column */}
      <aside className="h-fit rounded-3xl border border-line/70 bg-navy/40 p-6">
        <h3 className="text-lg font-bold">{t("sessionTitle")}</h3>
        <p className="mt-2 text-sm text-muted">{t("sessionDesc")}</p>
        <dl className="mt-6 space-y-3 text-sm">
          <Row icon={<Clock size={15} />} label={t("duration")} />
          <Row icon={<MapPin size={15} />} label={t("type")} />
          <Row icon={<CreditCard size={15} />} label={t("price")} strong />
        </dl>
        {date && time && (
          <div className="mt-6 rounded-xl border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm">
            <p className="font-semibold text-emerald">{longDateFmt.format(date)}</p>
            <p className="text-foreground/80">{time}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-navy/40 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald/60"
      />
    </div>
  );
}

function Row({ icon, label, strong }: { icon: React.ReactNode; label: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-emerald">{icon}</span>
      <span className={strong ? "font-bold text-foreground" : "text-muted"}>{label}</span>
    </div>
  );
}
