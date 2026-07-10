import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/admin/auth";
import { getAdminLang } from "@/lib/admin/lang";
import { getDict, fmtNum, fmtDate } from "@/lib/admin/i18n";
import { AdminShell } from "@/components/admin/admin-shell";
import { getReviewData } from "@/lib/rag/analytics";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  if (!(await isAuthed())) redirect("/admin/login");
  const lang = await getAdminLang();
  const d = getDict(lang);
  const data = await getReviewData();

  return (
    <AdminShell active="feedback">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{d.feedback.title}</h1>
          <p className="mt-1 text-sm text-muted">{d.feedback.subtitle}</p>
        </div>

        {!data ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {d.common.notConfigured}
          </div>
        ) : (
          <>
            <section>
              <h2 className="mb-3 text-base font-semibold text-foreground">
                {d.feedback.negTitle} ({fmtNum(lang, data.downFeedback.length)})
              </h2>
              {data.downFeedback.length === 0 ? (
                <Empty>{d.feedback.negEmpty}</Empty>
              ) : (
                <div className="space-y-2">
                  {data.downFeedback.map((fb, i) => (
                    <div key={i} className="rounded-2xl border border-line/70 bg-navy/40 p-4">
                      <p className="text-sm leading-6 text-foreground/90">{fb.answer}…</p>
                      <p className="mt-1.5 text-xs text-muted">{fmtDate(lang, fb.when)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-1 text-base font-semibold text-foreground">
                {d.feedback.gapsTitle} ({fmtNum(lang, data.gapQuestions.length)})
              </h2>
              <p className="mb-3 text-sm text-muted">{d.feedback.gapsSubtitle}</p>
              {data.gapQuestions.length === 0 ? (
                <Empty>{d.feedback.gapsEmpty}</Empty>
              ) : (
                <div className="space-y-2">
                  {data.gapQuestions.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-navy/40 p-4"
                    >
                      <p className="text-sm text-foreground/90">{g.question}</p>
                      <span className="shrink-0 text-xs text-muted">{fmtDate(lang, g.when)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line/70 bg-navy/30 px-5 py-10 text-center text-muted">
      {children}
    </div>
  );
}
