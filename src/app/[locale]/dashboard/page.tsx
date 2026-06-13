import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CalendarCheck, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Booking = {
  id: string;
  starts_at: string;
  status: "pending" | "confirmed" | "cancelled";
  meeting_type: string;
  price_cents: number;
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Dashboard");

  let userName = "";
  let bookings: Booking[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect({ href: "/login", locale });
    userName =
      (user!.user_metadata?.full_name as string) || user!.email || "";
    const { data } = await supabase
      .from("bookings")
      .select("id, starts_at, status, meeting_type, price_cents")
      .order("starts_at", { ascending: true });
    bookings = (data as Booking[]) ?? [];
  }

  const statusLabel: Record<Booking["status"], string> = {
    pending: t("pending"),
    confirmed: t("confirmed"),
    cancelled: t("cancelled"),
  };
  const statusClass: Record<Booking["status"], string> = {
    pending: "bg-amber-500/15 text-amber-300",
    confirmed: "bg-emerald/15 text-emerald",
    cancelled: "bg-red-500/15 text-red-300",
  };

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={userName ? `${t("welcome")}, ${userName}` : undefined}
      />
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CalendarCheck size={20} className="text-emerald" />
            {t("myBookings")}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-ink"
            >
              <Plus size={15} /> {t("bookNow")}
            </Link>
            {isSupabaseConfigured && (
              <form action="/auth/signout" method="post">
                <button className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted hover:text-foreground">
                  <LogOut size={15} />
                </button>
              </form>
            )}
          </div>
        </div>

        {!isSupabaseConfigured ? (
          <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 p-10 text-center text-sm text-muted">
            {t("noBookings")}
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 p-10 text-center text-sm text-muted">
            {t("noBookings")}
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-2xl border border-line/70 bg-navy/40 px-5 py-4"
              >
                <div>
                  <p className="font-semibold">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(new Date(b.starts_at))}
                  </p>
                  <p className="text-sm text-muted">
                    € {(b.price_cents / 100).toFixed(2)} · {b.meeting_type}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    statusClass[b.status],
                  )}
                >
                  {statusLabel[b.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
