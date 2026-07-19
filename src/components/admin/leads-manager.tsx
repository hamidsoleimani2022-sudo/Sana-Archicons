"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus, type LeadStatus } from "@/app/admin/actions";
import { convertLead } from "@/app/admin/crm-actions";
import { getDict, fmtNum, fmtDate, type AdminLang } from "@/lib/admin/i18n";

export type Lead = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  email: string | null;
  business_name: string | null;
  service: string;
  message: string;
  preferred_time: string | null;
  locale: string | null;
  status: LeadStatus;
  source?: string | null;
};

const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "scheduled", "won", "lost"];

const STATUS_CLS: Record<LeadStatus, string> = {
  new: "bg-emerald/15 text-emerald",
  contacted: "bg-sky-500/15 text-sky-300",
  scheduled: "bg-indigo-500/15 text-indigo-300",
  won: "bg-green-500/15 text-green-300",
  lost: "bg-line/40 text-muted",
};

export function LeadsManager({
  lang,
  leads,
  error,
}: {
  lang: AdminLang;
  leads: Lead[];
  error: string | null;
}) {
  const d = getDict(lang);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return [l.full_name, l.phone, l.business_name, l.service, l.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, query, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const l of leads) c[l.status] = (c[l.status] ?? 0) + 1;
    return c;
  }, [leads]);

  function serviceLabel(code: string): string {
    return d.leads.services[code as keyof typeof d.leads.services] ?? code;
  }
  function timeLabel(code: string | null): string {
    if (!code) return "—";
    return d.leads.times[code as keyof typeof d.leads.times] ?? code;
  }

  function exportCsv(rows: Lead[]) {
    const headers = [
      "name", "phone", "email", "business", "service", "message",
      "preferred_time", "locale", "source", "status", "created_at",
    ];
    const data = rows.map((l) => [
      l.full_name, l.phone, l.email ?? "", l.business_name ?? "",
      serviceLabel(l.service), l.message, timeLabel(l.preferred_time),
      l.locale ?? "", l.source ?? "website", d.leads.statuses[l.status],
      new Date(l.created_at).toISOString(),
    ]);
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const csv = "﻿" + [headers, ...data].map((r) => r.map(esc).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sana-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function changeStatus(id: string, status: LeadStatus) {
    setPendingId(id);
    startTransition(async () => {
      const res = await updateLeadStatus(id, status);
      setPendingId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  // Klassieke CRM-flow: aanvraag omzetten naar contact (+ bedrijf) en deal
  function convert(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const res = await convertLead(id);
      setPendingId(null);
      if (res.ok) {
        alert(d.leads.convertDone);
        router.refresh();
      } else {
        alert(res.error === "not_configured" ? d.common.notConfigured : res.error ?? d.common.error);
      }
    });
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.leads.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {fmtNum(lang, leads.length)} {d.leads.subtitle}
          </p>
        </div>
        {leads.length > 0 && (
          <button
            type="button"
            onClick={() => exportCsv(filtered)}
            className="shrink-0 rounded-full border border-line/70 px-4 py-2 text-sm text-muted transition-colors hover:border-emerald/40 hover:text-foreground"
          >
            {d.leads.exportCsv}
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={d.leads.searchPlaceholder}
              className="w-full rounded-xl border border-line/70 bg-navy/50 px-4 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50 sm:max-w-sm"
            />
            <div className="flex flex-wrap gap-2">
              <FilterChip
                active={statusFilter === "all"}
                onClick={() => setStatusFilter("all")}
                label={`${d.common.all} (${fmtNum(lang, counts.all)})`}
              />
              {STATUS_ORDER.map((s) => (
                <FilterChip
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  label={`${d.leads.statuses[s]} (${fmtNum(lang, counts[s] ?? 0)})`}
                />
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-16 text-center text-muted">
              {leads.length === 0 ? d.leads.empty : d.leads.noResults}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lang={lang}
                  lead={lead}
                  pending={pendingId === lead.id}
                  onStatusChange={changeStatus}
                  onConvert={convert}
                  serviceLabel={serviceLabel}
                  timeLabel={timeLabel}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
        active
          ? "bg-emerald text-ink"
          : "border border-line/70 bg-navy/40 text-muted hover:border-emerald/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function LeadCard({
  lang,
  lead,
  pending,
  onStatusChange,
  onConvert,
  serviceLabel,
  timeLabel,
}: {
  lang: AdminLang;
  lead: Lead;
  pending: boolean;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onConvert: (id: string) => void;
  serviceLabel: (code: string) => string;
  timeLabel: (code: string | null) => string;
}) {
  const d = getDict(lang);
  return (
    <article className="rounded-2xl border border-line/70 bg-navy/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg font-semibold text-foreground">{lead.full_name}</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[lead.status] ?? ""}`}
            >
              {d.leads.statuses[lead.status] ?? lead.status}
            </span>
            {lead.source === "chatbot" && (
              <span className="rounded-full border border-emerald/40 px-2 py-0.5 text-[0.7rem] text-emerald">
                {d.leads.sourceChatbot}
              </span>
            )}
            {lead.locale && (
              <span className="rounded-full border border-line/60 px-2 py-0.5 text-[0.7rem] uppercase text-muted">
                {lead.locale}
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <InfoRow label={d.leads.business} value={lead.business_name} />
            <InfoRow label={d.leads.service} value={serviceLabel(lead.service)} />
            <InfoRow
              label={d.leads.phone}
              value={
                <a
                  href={`tel:${lead.phone}`}
                  dir="ltr"
                  className="text-emerald underline-offset-2 hover:underline"
                >
                  {lead.phone}
                </a>
              }
            />
            <InfoRow
              label={d.leads.email}
              value={
                lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    dir="ltr"
                    className="text-emerald underline-offset-2 hover:underline"
                  >
                    {lead.email}
                  </a>
                ) : null
              }
            />
            <InfoRow label={d.leads.time} value={timeLabel(lead.preferred_time)} />
          </div>

          <div className="mt-3">
            <p className="text-xs text-muted">{d.leads.message}:</p>
            <p className="mt-1 text-sm leading-6 text-foreground/90">{lead.message}</p>
          </div>

          <p className="mt-3 text-xs text-muted">
            {d.leads.submittedAt} {fmtDate(lang, lead.created_at)}
          </p>
        </div>

        {/* Status wijzigen */}
        <div className="shrink-0 sm:w-48">
          <label className="mb-1.5 block text-xs font-medium text-muted">
            {d.leads.status}
          </label>
          <div className="relative">
            <select
              value={lead.status}
              disabled={pending}
              onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-line/70 bg-navy/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-emerald/50 disabled:opacity-60"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s} className="bg-navy text-foreground">
                  {d.leads.statuses[s]}
                </option>
              ))}
            </select>
            {pending && (
              <span className="absolute end-3 top-1/2 -translate-y-1/2">
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-line/60 border-t-emerald" />
              </span>
            )}
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={() => onConvert(lead.id)}
            className="mt-2.5 w-full rounded-xl border border-emerald/40 px-3.5 py-2 text-sm text-emerald transition-colors hover:bg-emerald/10 disabled:opacity-50"
          >
            {pending ? d.leads.converting : d.leads.convert}
          </button>
        </div>
      </div>
    </article>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-muted">{label}:</span>
      <span className="min-w-0 break-words text-foreground/90">{value || "—"}</span>
    </div>
  );
}
