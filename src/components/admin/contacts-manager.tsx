"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContact, saveContact } from "@/app/admin/crm-actions";
import { getDict, fmtNum, fmtDate, type AdminLang } from "@/lib/admin/i18n";
import type { ContactSource, ContactWithCompany } from "@/lib/crm/types";

const SOURCE_CLS: Record<ContactSource, string> = {
  website: "bg-sky-500/15 text-sky-300",
  chatbot: "bg-emerald/15 text-emerald",
  manual: "bg-line/40 text-muted",
};

const INPUT_CLS =
  "w-full rounded-xl border border-line/70 bg-navy/50 px-3.5 py-2.5 text-sm text-foreground placeholder-muted/50 outline-none transition focus:border-emerald/50";

export function ContactsManager({
  lang,
  contacts,
  companies,
  error,
}: {
  lang: AdminLang;
  contacts: ContactWithCompany[];
  companies: Array<{ id: string; name: string }>;
  error: string | null;
}) {
  const d = getDict(lang);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ContactWithCompany | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) =>
      [c.full_name, c.email, c.phone, c.company?.name, c.position]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [contacts, query]);

  function submit(formData: FormData) {
    startTransition(async () => {
      const res = await saveContact(formData);
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
      const res = await deleteContact(id);
      setBusyId(null);
      if (res.ok) router.refresh();
      else alert(res.error ?? d.common.error);
    });
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.crm.contacts.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {fmtNum(lang, contacts.length)} {d.crm.contacts.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(editing ? null : "new")}
          className="shrink-0 rounded-full bg-emerald px-4 py-2 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          {d.crm.contacts.addBtn}
        </button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          {editing && (
            <form
              action={submit}
              className="mb-6 rounded-2xl border border-emerald/30 bg-navy/40 p-5"
            >
              <h2 className="mb-4 text-base font-semibold text-foreground">
                {editing === "new" ? d.crm.contacts.addBtn.replace("+ ", "") : d.crm.contacts.editTitle}
              </h2>
              {editing !== "new" && <input type="hidden" name="id" value={editing.id} />}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={d.crm.contacts.name}>
                  <input
                    name="full_name"
                    required
                    defaultValue={editing === "new" ? "" : editing.full_name}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.contacts.position}>
                  <input
                    name="position"
                    defaultValue={editing === "new" ? "" : editing.position ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.leads.phone}>
                  <input
                    name="phone"
                    dir="ltr"
                    defaultValue={editing === "new" ? "" : editing.phone ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.leads.email}>
                  <input
                    name="email"
                    type="email"
                    dir="ltr"
                    defaultValue={editing === "new" ? "" : editing.email ?? ""}
                    className={INPUT_CLS}
                  />
                </Field>
                <Field label={d.crm.contacts.company}>
                  <select
                    name="company_id"
                    defaultValue={editing === "new" ? "" : editing.company_id ?? ""}
                    className={INPUT_CLS}
                  >
                    <option value="" className="bg-navy">
                      {d.crm.contacts.noCompany}
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} className="bg-navy">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={d.crm.contacts.notes}>
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
            placeholder={d.crm.contacts.searchPlaceholder}
            className={`${INPUT_CLS} mb-5 sm:max-w-sm`}
          />

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-16 text-center text-muted">
              {contacts.length === 0 ? d.crm.contacts.empty : d.crm.contacts.noResults}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((contact) => {
                const dealCount = contact.deals?.[0]?.count ?? 0;
                return (
                  <article
                    key={contact.id}
                    className="rounded-2xl border border-line/70 bg-navy/40 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h2 className="text-base font-semibold text-foreground">
                            {contact.full_name}
                          </h2>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${SOURCE_CLS[contact.source] ?? ""}`}
                          >
                            {d.crm.sources[contact.source] ?? contact.source}
                          </span>
                          {dealCount > 0 && (
                            <span className="rounded-full border border-line/60 px-2 py-0.5 text-[0.7rem] text-muted">
                              {fmtNum(lang, dealCount)} {d.crm.contacts.dealsCount}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                          <Info label={d.crm.contacts.company} value={contact.company?.name} />
                          <Info label={d.crm.contacts.position} value={contact.position} />
                          <Info
                            label={d.leads.phone}
                            value={
                              contact.phone ? (
                                <a href={`tel:${contact.phone}`} dir="ltr" className="text-emerald hover:underline">
                                  {contact.phone}
                                </a>
                              ) : null
                            }
                          />
                          <Info
                            label={d.leads.email}
                            value={
                              contact.email ? (
                                <a href={`mailto:${contact.email}`} dir="ltr" className="text-emerald hover:underline">
                                  {contact.email}
                                </a>
                              ) : null
                            }
                          />
                        </div>
                        {contact.notes && (
                          <p className="mt-2 text-sm leading-6 text-foreground/80">{contact.notes}</p>
                        )}
                        <p className="mt-2 text-xs text-muted">{fmtDate(lang, contact.created_at)}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(contact)}
                          className="rounded-full border border-line/70 px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-emerald/40 hover:text-foreground"
                        >
                          {d.crm.edit}
                        </button>
                        <button
                          type="button"
                          disabled={busyId === contact.id}
                          onClick={() => remove(contact.id)}
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

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="shrink-0 text-muted">{label}:</span>
      <span className="min-w-0 break-words text-foreground/90">{value || "—"}</span>
    </div>
  );
}
