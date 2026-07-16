import { LogoMark } from "@/components/logo";
import {
  fmtEuro,
  fmtOfferDate,
  offerValidUntil,
  sectionNumbers,
  type OfferData,
  type OfferTextSectionKey,
} from "@/lib/admin/offer-defaults";

/**
 * Het offertedocument: wit A4-"papier", altijd in het Nederlands.
 * Puur presentationeel — alle inhoud komt uit OfferData.
 * Bij afdrukken is alléén dit element zichtbaar (zie .offer-print-root in globals.css).
 */

/** Vrije tekst → alinea's en opsommingen ("- " = bullet, regel eindigend op ":" = vet). */
function Body({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === "") {
      blocks.push({ type: "p", lines: [] });
      continue;
    }
    const isBullet = line.trimStart().startsWith("- ");
    const last = blocks[blocks.length - 1];
    if (isBullet) {
      if (last?.type === "ul") last.lines.push(line.trim().slice(2));
      else blocks.push({ type: "ul", lines: [line.trim().slice(2)] });
    } else {
      if (last?.type === "p" && last.lines.length > 0) last.lines.push(line);
      else blocks.push({ type: "p", lines: [line] });
    }
  }

  return (
    <div className="space-y-2.5">
      {blocks.map((b, i) =>
        b.lines.length === 0 ? null : b.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.lines.map((li, j) => (
              <li key={j}>{li}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className={b.lines.join(" ").endsWith(":") ? "font-semibold text-slate-900" : undefined}>
            {b.lines.join(" ")}
          </p>
        )
      )}
    </div>
  );
}

function SectionHeading({ nr, title }: { nr: number; title: string }) {
  return (
    <h2 className="mb-2 flex items-baseline gap-2 border-b border-emerald/40 pb-1.5 text-[15px] font-bold text-slate-900">
      <span className="text-emerald-deep">{nr}.</span>
      {title}
    </h2>
  );
}

export function OfferDocument({ data }: { data: OfferData }) {
  const subtotal = data.services.reduce((sum, s) => sum + (Number.isFinite(s.amount) ? s.amount : 0), 0);
  const vat = data.vatEnabled ? (subtotal * data.vatRate) / 100 : 0;
  const total = subtotal + vat;

  const numberOf = sectionNumbers(data);

  const textSection = (key: OfferTextSectionKey) => {
    const s = data.sections[key];
    if (!s.enabled) return null;
    return (
      <section key={key} className="avoid-break">
        <SectionHeading nr={numberOf.get(key)!} title={s.title} />
        <Body text={s.body} />
      </section>
    );
  };

  return (
    <div
      className="offer-print-root mx-auto w-full max-w-[210mm] bg-white text-[13px] leading-relaxed text-slate-700 shadow-2xl"
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      dir="ltr"
      lang="nl"
    >
      {/* Merkbalk */}
      <div className="h-2.5 bg-gradient-to-r from-emerald-deep via-emerald to-emerald-bright" />

      <div className="space-y-6 px-10 py-8">
        {/* Kop: logo + woordmerk + OFFERTE */}
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <LogoMark className="h-14" />
            <span className="flex flex-col leading-none">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                SANA <span className="text-emerald-deep">ARCHICONS</span>
              </span>
              <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Bouw · Energie · AI Consultancy
              </span>
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold uppercase tracking-[0.2em] text-slate-900">Offerte</div>
            <div className="mt-1 text-sm font-semibold text-emerald-deep">{data.offerNumber}</div>
          </div>
        </header>

        {/* Projecttitel */}
        <div className="rounded-lg bg-slate-50 px-5 py-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Betreft</div>
          <div className="text-base font-bold text-slate-900">{data.projectTitle}</div>
        </div>

        {/* Metagegevens: voor / van / datum / geldigheid */}
        <div className="grid grid-cols-2 gap-6 avoid-break">
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep">Voor</div>
            <div className="space-y-0.5">
              {data.client.company && <div className="font-semibold text-slate-900">{data.client.company}</div>}
              {data.client.contact && <div>t.a.v. {data.client.contact}</div>}
              {data.client.city && <div>{data.client.city}</div>}
              {data.client.email && <div>{data.client.email}</div>}
              {data.client.phone && <div>{data.client.phone}</div>}
            </div>
          </div>
          <div>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-deep">Van</div>
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-900">{data.sender.company}</div>
              {data.sender.contact && <div>{data.sender.contact}</div>}
              {data.sender.email && <div>{data.sender.email}</div>}
              {data.sender.phone && <div>{data.sender.phone}</div>}
              {data.sender.website && <div>{data.sender.website}</div>}
            </div>
          </div>
          <div className="col-span-2 flex flex-wrap gap-x-8 gap-y-1 border-y border-slate-200 py-2 text-[12px]">
            <span>
              <span className="text-slate-500">Datum:</span>{" "}
              <span className="font-medium text-slate-900">{fmtOfferDate(data.date)}</span>
            </span>
            <span>
              <span className="text-slate-500">Geldig tot:</span>{" "}
              <span className="font-medium text-slate-900">
                {offerValidUntil(data.date, data.validityDays)}
              </span>
            </span>
            <span>
              <span className="text-slate-500">Offertenummer:</span>{" "}
              <span className="font-medium text-slate-900">{data.offerNumber}</span>
            </span>
          </div>
        </div>

        {/* Tekstsecties vóór de planning */}
        {(["summary", "situation", "solution", "scope", "approach"] as const).map(textSection)}

        {/* Planning en fasen */}
        {data.phasesEnabled && (
          <section className="avoid-break">
            <SectionHeading nr={numberOf.get("phases")!} title="Planning en fasen" />
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-emerald/50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="w-12 py-1.5 pr-2 font-semibold">Fase</th>
                  <th className="py-1.5 pr-2 font-semibold">Werkzaamheden</th>
                  <th className="w-32 py-1.5 font-semibold">Duur</th>
                </tr>
              </thead>
              <tbody>
                {data.phases.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-1.5 pr-2 font-semibold text-emerald-deep">{i + 1}</td>
                    <td className="py-1.5 pr-2">{p.name}</td>
                    <td className="py-1.5">{p.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalDuration && (
              <p className="mt-2 font-semibold text-slate-900">{data.totalDuration}</p>
            )}
          </section>
        )}

        {/* Tekstsecties tussen planning en investering */}
        {(["results", "privacy"] as const).map(textSection)}

        {/* Investering en betaling */}
        <section className="avoid-break">
          <SectionHeading nr={numberOf.get("investment")!} title="Investering en betaling" />
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-emerald/50 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="py-1.5 pr-2 font-semibold">Omschrijving</th>
                <th className="w-36 py-1.5 text-right font-semibold">Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((s) => (
                <tr key={s.id} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2">{s.description}</td>
                  <td className="py-1.5 text-right tabular-nums">{fmtEuro(s.amount)}</td>
                </tr>
              ))}
              {data.vatEnabled ? (
                <>
                  <tr>
                    <td className="py-1.5 pr-2 text-right text-slate-500">Subtotaal (excl. btw)</td>
                    <td className="py-1.5 text-right tabular-nums">{fmtEuro(subtotal)}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 pr-2 text-right text-slate-500">btw {data.vatRate}%</td>
                    <td className="py-1.5 text-right tabular-nums">{fmtEuro(vat)}</td>
                  </tr>
                </>
              ) : null}
              <tr className="border-t-2 border-emerald/50">
                <td className="py-2 pr-2 text-right font-bold text-slate-900">
                  Totaal {data.vatEnabled ? "(incl. btw)" : "(excl. btw)"}
                </td>
                <td className="py-2 text-right font-bold tabular-nums text-emerald-deep">{fmtEuro(total)}</td>
              </tr>
            </tbody>
          </table>
          {data.paymentTerms && (
            <p className="mt-2">
              <span className="font-semibold text-slate-900">Betalingsvoorwaarden:</span> {data.paymentTerms}
            </p>
          )}
          {data.investmentNote && <p className="mt-1.5 text-[12px] text-slate-500">{data.investmentNote}</p>}
        </section>

        {/* Slotsecties */}
        {(["needs", "about", "terms", "acceptance"] as const).map(textSection)}

        {/* Handtekeningen */}
        <section className="avoid-break grid grid-cols-2 gap-10 pt-4">
          {[
            { label: "Voor akkoord — opdrachtgever", name: data.client.company || "[Opdrachtgever]" },
            { label: "Voor akkoord — opdrachtnemer", name: data.sender.company },
          ].map((sig) => (
            <div key={sig.label}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-deep">
                {sig.label}
              </div>
              <div className="mt-14 border-t border-slate-300 pt-1.5 text-[12px]">
                <div className="font-medium text-slate-900">{sig.name}</div>
                <div className="text-slate-500">Naam, datum en handtekening</div>
              </div>
            </div>
          ))}
        </section>

        {/* Voettekst */}
        <footer className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          <span>
            {data.sender.company} — {[data.sender.email, data.sender.phone].filter(Boolean).join(" · ")}
          </span>
          <span>
            {data.offerNumber} · {fmtOfferDate(data.date)}
          </span>
        </footer>
      </div>
    </div>
  );
}
