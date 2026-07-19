"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCompany, saveCompany } from "@/app/admin/crm-actions";
import { getDict, fmtNum, type AdminLang } from "@/lib/admin/i18n";
import type { CompanyWithCounts } from "@/lib/crm/queries";

const INPUT_CLS =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50";

export function CompaniesManager({
  lang,
  companies,
  error,
}: {
  lang: AdminLang;
  companies: CompanyWithCounts[];
  error: string | null;
}) {
  const d = getDict(lang);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CompanyWithCounts | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      [c.name, c.industry, c.city].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [companies, query]);

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await saveCompany(formData);
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else {
        alert(res.error === "not_configured" ? d.common.notConfigured : res.error ?? d.common.error);
      }
    });
  }

  function remove(id: string) {
    if (!confirm(d.crm.confirmDelete)) return;
    setBusyId(id);
    startTransition(async () => {
      const res = await deleteCompany(id);
      setBusyId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.crm.companies.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {fmtNum(lang, companies.length)} {d.crm.companies.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(editing ? null : "new")}
          className="shrink-0 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          {d.crm.companies.addBtn}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          {editing && (
            <form action={submit} className="mb-6 rounded-2xl border border-emerald/30 bg-navy/40 p-5">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                {editing === "new" ? d.crm.companies.addBtn.replace("+ ", "") : d.crm.companies.editTitle}
              </h2>
              {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={d.crm.companies.name}>
                  <input
                    name="name"
                    required
                    defaultValue={editing === "new" ? "" : editing.name}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.companies.industry}>
                  <input
                    name="industry"
                    defaultValue={editing === "new" ? "" : editing.industry ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.companies.website}>
                  <input
                    name="website"
                    dir="ltr"
                    defaultValue={editing === "new" ? "" : editing.website ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.companies.city}>
                  <input
                    name="city"
                    defaultValue={editing === "new" ? "" : editing.city ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.companies.size}>
                  <input
                    name="size_label"
                    placeholder="1-10"
                    defaultValue={editing === "new" ? "" : editing.size_label ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.companies.notes}>
                  <input
                    name="notes"
                    defaultValue={editing === "new" ? "" : editing.notes ?? ""}
                    className={INPUT_CLS}
                  />
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
                  onClick={() => setEditing(null)}
                  className="rounded-full border border-line/70 px-5 py-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  {d.crm.cancel}
                </button>
              </div>
            </form>
          )}

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={d.crm.companies.searchPlaceholder}
            className={`${INPUT_CLS} mb-5 sm:max-w-sm`}
          />

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-16 text-center text-muted">
              {companies.length === 0 ? d.crm.companies.empty : d.crm.contacts.noResults}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((company) => (
                <article key={company.id} className="rounded-2xl border border-line/70 bg-navy/40 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="min-w-0 break-words text-base font-semibold text-foreground">
                      {company.name}
                    </h2>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(company)}
                        className="rounded-full border border-line/70 px-3 py-1 text-xs text-muted transition-colors hover:border-emerald/40 hover:text-foreground"
                      >
                        {d.crm.edit}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === company.id}
                        onClick={() => remove(company.id)}
                        className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {d.common.delete}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-foreground/85">
                    {company.industry && <p>{company.industry}</p>}
                    {company.city && <p className="text-muted">{company.city}</p>}
                    {company.website && (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        dir="ltr"
                        className="block truncate text-emerald hover:underline"
                      >
                        {company.website}
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {fmtNum(lang, company.contact_count)} {d.crm.companies.contactsCount} ·{" "}
                    {fmtNum(lang, company.deal_count)} {d.crm.companies.dealsCount}
                  </p>
                </article>
              ))}
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
