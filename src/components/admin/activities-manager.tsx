"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteActivity, saveActivity, setActivityDone } from "@/app/admin/crm-actions";
import { getDict, fmtNum, fmtDate, type AdminLang } from "@/lib/admin/i18n";
import { ACTIVITY_TYPE_ICONS, type ActivityType, type ActivityWithRefs } from "@/lib/crm/types";

const INPUT_CLS =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50";

const TYPES: ActivityType[] = ["task", "call", "meeting", "note"];

type Filter = "all" | "open" | "done";

export function ActivitiesManager({
  lang,
  activities,
  contacts,
  deals,
  error,
}: {
  lang: AdminLang;
  activities: ActivityWithRefs[];
  contacts: Array<{ id: string; full_name: string }>;
  deals: Array<{ id: string; title: string }>;
  error: string | null;
}) {
  const d = getDict(lang);
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "open") return activities.filter((a) => !a.done_at);
    if (filter === "done") return activities.filter((a) => a.done_at);
    return activities;
  }, [activities, filter]);

  const counts = useMemo(
    () => ({
      all: activities.length,
      open: activities.filter((a) => !a.done_at).length,
      done: activities.filter((a) => a.done_at).length,
    }),
    [activities]
  );

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await saveActivity(formData);
      if (res.ok) {
        setShowForm(false);
        router.refresh();
      } else {
        alert(res.error === "not_configured" ? d.common.notConfigured : res.error ?? d.common.error);
      }
    });
  }

  function toggleDone(activity: ActivityWithRefs) {
    setBusyId(activity.id);
    startTransition(async () => {
      const res = await setActivityDone(activity.id, !activity.done_at);
      setBusyId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  function remove(id: string) {
    if (!confirm(d.crm.confirmDelete)) return;
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteActivity(id);
      setBusyId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  // Eenmalig "nu" bij mount — stabiel tussen renders (react-hooks/purity)
  const [now] = useState(() => Date.now());

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.crm.activities.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {fmtNum(lang, activities.length)} {d.crm.activities.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="shrink-0 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          {d.crm.activities.addBtn}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          {showForm && (
            <form action={submit} className="mb-6 rounded-2xl border border-emerald/30 bg-navy/40 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={d.crm.activities.titleLabel}>
                  <input name="title" required className={INPUT_CLS} />
                </Field>
                <Field label={d.crm.activities.typeLabel}>
                  <select name="type" defaultValue="task" className={INPUT_CLS}>
                    {TYPES.map((t) => (
                      <option key={t} value={t} className="bg-navy">
                        {ACTIVITY_TYPE_ICONS[t]} {d.crm.activities.types[t]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={d.crm.activities.dueAt}>
                  <input name="due_at" type="datetime-local" dir="ltr" className={INPUT_CLS} />
                </Field>
                <Field label={d.crm.activities.details}>
                  <input name="body" className={INPUT_CLS} />
                </Field>
                <Field label={d.crm.activities.contact}>
                  <select name="contact_id" defaultValue="" className={INPUT_CLS}>
                    <option value="" className="bg-navy">
                      {d.crm.notLinked}
                    </option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-navy">
                        {c.full_name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={d.crm.activities.deal}>
                  <select name="deal_id" defaultValue="" className={INPUT_CLS}>
                    <option value="" className="bg-navy">
                      {d.crm.notLinked}
                    </option>
                    {deals.map((deal) => (
                      <option key={deal.id} value={deal.id} className="bg-navy">
                        {deal.title}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-emerald px-5 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
                >
                  {d.common.save}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-line/70 px-5 py-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  {d.crm.cancel}
                </button>
              </div>
            </form>
          )}

          <div className="mb-5 flex flex-wrap gap-2">
            {(["all", "open", "done"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                  filter === f
                    ? "bg-emerald text-ink"
                    : "border border-line/70 bg-navy/40 text-muted hover:border-emerald/40 hover:text-foreground"
                }`}
              >
                {f === "all"
                  ? d.crm.activities.filterAll
                  : f === "open"
                    ? d.crm.activities.filterOpen
                    : d.crm.activities.filterDone}{" "}
                ({fmtNum(lang, counts[f])})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-16 text-center text-muted">
              {d.crm.activities.empty}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((activity) => {
                const overdue =
                  !activity.done_at && activity.due_at && new Date(activity.due_at).getTime() < now;
                return (
                  <article
                    key={activity.id}
                    className={`rounded-2xl border p-4 ${
                      overdue
                        ? "border-red-400/40 bg-red-500/5"
                        : activity.done_at
                          ? "border-line/50 bg-navy/25 opacity-75"
                          : "border-line/70 bg-navy/40"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span aria-hidden="true">{ACTIVITY_TYPE_ICONS[activity.type] ?? "✅"}</span>
                          <h2
                            className={`text-sm font-semibold ${
                              activity.done_at ? "text-muted line-through" : "text-foreground"
                            }`}
                          >
                            {activity.title}
                          </h2>
                          <span className="rounded-full border border-line/60 px-2 py-0.5 text-[0.7rem] text-muted">
                            {d.crm.activities.types[activity.type] ?? activity.type}
                          </span>
                          {overdue && (
                            <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[0.7rem] font-medium text-red-300">
                              {d.crm.activities.overdue}
                            </span>
                          )}
                        </div>
                        {activity.body && (
                          <p className="mt-1 text-sm leading-6 text-foreground/80">{activity.body}</p>
                        )}
                        <p className="mt-1.5 text-xs text-muted">
                          {activity.due_at && (
                            <>
                              {d.crm.activities.dueAt}: {fmtDate(lang, activity.due_at)} ·{" "}
                            </>
                          )}
                          {activity.contact && (
                            <>
                              {d.crm.activities.contact}: {activity.contact.full_name} ·{" "}
                            </>
                          )}
                          {activity.deal && (
                            <>
                              {d.crm.activities.deal}: {activity.deal.title} ·{" "}
                            </>
                          )}
                          {activity.done_at
                            ? `${d.crm.activities.doneAt}: ${fmtDate(lang, activity.done_at)}`
                            : fmtDate(lang, activity.created_at)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={busyId === activity.id}
                          onClick={() => toggleDone(activity)}
                          className={`rounded-full px-3.5 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                            activity.done_at
                              ? "border border-line/70 text-muted hover:text-foreground"
                              : "bg-emerald font-medium text-ink hover:opacity-90"
                          }`}
                        >
                          {activity.done_at ? d.crm.activities.reopen : d.crm.activities.markDone}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === activity.id}
                          onClick={() => remove(activity.id)}
                          className="rounded-full border border-red-400/40 px-3.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {d.common.delete}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
