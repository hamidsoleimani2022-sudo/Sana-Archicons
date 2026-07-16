/**
 * Word-export van de offerte: bouwt een MHTML-bestand (.doc) dat Microsoft Word
 * opent als bewerkbaar document, inclusief het logo als ingesloten afbeelding.
 * Zelfde inhoud en nummering als het A4-scherm-/printdocument (offer-document.tsx).
 */

import {
  fmtEuro,
  fmtOfferDate,
  offerValidUntil,
  sectionNumbers,
  type OfferData,
  type OfferTextSectionKey,
} from "./offer-defaults";

const EMERALD = "#1aa85a";
const EMERALD_LIGHT = "#2ecc71";
const DARK = "#0f172a";
const TEXT = "#334155";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

// logo-mark.png is 536 × 332 px → hoogte 44pt in de kop
const LOGO_H_PT = 44;
const LOGO_W_PT = Math.round((44 * 536) / 332);

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Zelfde tekstregels als <Body>: "- " = bullet, lege regel = alinea, regel op ":" = vet. */
function bodyHtml(text: string): string {
  const out: string[] = [];
  let bullets: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const joined = para.join(" ");
    const bold = joined.endsWith(":") ? `font-weight:bold;color:${DARK};` : "";
    out.push(`<p style="margin:0 0 6pt 0;${bold}">${esc(joined)}</p>`);
    para = [];
  };
  const flushBullets = () => {
    if (bullets.length === 0) return;
    out.push(
      `<ul style="margin:0 0 6pt 0;padding-left:18pt;">` +
        bullets.map((b) => `<li style="margin:0 0 3pt 0;">${esc(b)}</li>`).join("") +
        `</ul>`
    );
    bullets = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") {
      flushBullets();
      flushPara();
    } else if (line.startsWith("- ")) {
      flushPara();
      bullets.push(line.slice(2));
    } else {
      flushBullets();
      para.push(line);
    }
  }
  flushBullets();
  flushPara();
  return out.join("");
}

function headingHtml(nr: number, title: string): string {
  return (
    `<h2 style="font-size:12pt;font-weight:bold;color:${DARK};margin:16pt 0 6pt 0;` +
    `padding-bottom:3pt;border-bottom:1pt solid ${EMERALD_LIGHT};">` +
    `<span style="color:${EMERALD};">${nr}.</span> ${esc(title)}</h2>`
  );
}

const thStyle = `font-size:8.5pt;color:${MUTED};text-transform:uppercase;text-align:left;padding:3pt 4pt;border-bottom:1.5pt solid ${EMERALD_LIGHT};`;
const tdStyle = `padding:3pt 4pt;border-bottom:0.75pt solid ${LINE};`;

export function buildOfferWordHtml(data: OfferData, logoSrc: string): string {
  const subtotal = data.services.reduce((sum, s) => sum + (Number.isFinite(s.amount) ? s.amount : 0), 0);
  const vat = data.vatEnabled ? (subtotal * data.vatRate) / 100 : 0;
  const total = subtotal + vat;
  const numberOf = sectionNumbers(data);

  const textSection = (key: OfferTextSectionKey): string => {
    const s = data.sections[key];
    if (!s.enabled) return "";
    return headingHtml(numberOf.get(key)!, s.title) + bodyHtml(s.body);
  };

  const clientLines = [
    data.client.company && `<b style="color:${DARK};">${esc(data.client.company)}</b>`,
    data.client.contact && `t.a.v. ${esc(data.client.contact)}`,
    data.client.city && esc(data.client.city),
    data.client.email && esc(data.client.email),
    data.client.phone && esc(data.client.phone),
  ]
    .filter(Boolean)
    .join("<br>");

  const senderLines = [
    `<b style="color:${DARK};">${esc(data.sender.company)}</b>`,
    data.sender.contact && esc(data.sender.contact),
    data.sender.email && esc(data.sender.email),
    data.sender.phone && esc(data.sender.phone),
    data.sender.website && esc(data.sender.website),
  ]
    .filter(Boolean)
    .join("<br>");

  const phasesHtml = !data.phasesEnabled
    ? ""
    : headingHtml(numberOf.get("phases")!, "Planning en fasen") +
      `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <th width="40" style="${thStyle}">Fase</th>
          <th style="${thStyle}">Werkzaamheden</th>
          <th width="110" style="${thStyle}">Duur</th>
        </tr>` +
      data.phases
        .map(
          (p, i) =>
            `<tr>
              <td style="${tdStyle}color:${EMERALD};font-weight:bold;">${i + 1}</td>
              <td style="${tdStyle}">${esc(p.name)}</td>
              <td style="${tdStyle}">${esc(p.duration)}</td>
            </tr>`
        )
        .join("") +
      `</table>` +
      (data.totalDuration
        ? `<p style="margin:6pt 0 0 0;font-weight:bold;color:${DARK};">${esc(data.totalDuration)}</p>`
        : "");

  const vatRows = data.vatEnabled
    ? `<tr>
        <td style="${tdStyle}text-align:right;color:${MUTED};">Subtotaal (excl. btw)</td>
        <td style="${tdStyle}text-align:right;">${fmtEuro(subtotal)}</td>
      </tr>
      <tr>
        <td style="${tdStyle}text-align:right;color:${MUTED};">btw ${data.vatRate}%</td>
        <td style="${tdStyle}text-align:right;">${fmtEuro(vat)}</td>
      </tr>`
    : "";

  const investmentHtml =
    headingHtml(numberOf.get("investment")!, "Investering en betaling") +
    `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <th style="${thStyle}">Omschrijving</th>
        <th width="130" style="${thStyle}text-align:right;">Bedrag</th>
      </tr>` +
    data.services
      .map(
        (s) =>
          `<tr>
            <td style="${tdStyle}">${esc(s.description)}</td>
            <td style="${tdStyle}text-align:right;">${fmtEuro(s.amount)}</td>
          </tr>`
      )
      .join("") +
    vatRows +
    `<tr>
      <td style="padding:5pt 4pt;text-align:right;font-weight:bold;color:${DARK};border-top:1.5pt solid ${EMERALD_LIGHT};">
        Totaal ${data.vatEnabled ? "(incl. btw)" : "(excl. btw)"}
      </td>
      <td style="padding:5pt 4pt;text-align:right;font-weight:bold;color:${EMERALD};border-top:1.5pt solid ${EMERALD_LIGHT};">
        ${fmtEuro(total)}
      </td>
    </tr>
    </table>` +
    (data.paymentTerms
      ? `<p style="margin:6pt 0 0 0;"><b style="color:${DARK};">Betalingsvoorwaarden:</b> ${esc(data.paymentTerms)}</p>`
      : "") +
    (data.investmentNote
      ? `<p style="margin:4pt 0 0 0;font-size:9.5pt;color:${MUTED};">${esc(data.investmentNote)}</p>`
      : "");

  const sigCell = (label: string, name: string) =>
    `<td width="50%" style="vertical-align:top;padding-right:20pt;">
      <p style="margin:0;font-size:8.5pt;color:${EMERALD};text-transform:uppercase;font-weight:bold;">${esc(label)}</p>
      <p style="margin:50pt 0 0 0;border-top:0.75pt solid #cbd5e1;padding-top:4pt;">
        <b style="color:${DARK};">${esc(name)}</b><br>
        <span style="color:${MUTED};font-size:9.5pt;">Naam, datum en handtekening</span>
      </p>
    </td>`;

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="nl">
<head>
<meta charset="utf-8">
<title>Offerte ${esc(data.offerNumber)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page WordSection1 { size:595.3pt 841.9pt; margin:56.7pt 56.7pt 56.7pt 56.7pt; }
div.WordSection1 { page:WordSection1; }
body { font-family:Calibri,Arial,sans-serif; font-size:10.5pt; color:${TEXT}; line-height:1.4; }
</style>
</head>
<body>
<div class="WordSection1">

<table width="100%" cellpadding="0" cellspacing="0"><tr>
  <td style="background:${EMERALD_LIGHT};height:7pt;font-size:1pt;line-height:1pt;">&nbsp;</td>
</tr></table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14pt;"><tr>
  <td style="vertical-align:middle;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:10pt;">${logoSrc ? `<img src="${logoSrc}" width="${LOGO_W_PT}" height="${LOGO_H_PT}" alt="Sana Archicons">` : ""}</td>
      <td style="vertical-align:middle;">
        <span style="font-size:16pt;font-weight:bold;color:${DARK};">SANA <span style="color:${EMERALD};">ARCHICONS</span></span><br>
        <span style="font-size:7.5pt;color:${MUTED};letter-spacing:2pt;text-transform:uppercase;">Bouw · Energie · AI Consultancy</span>
      </td>
    </tr></table>
  </td>
  <td style="text-align:right;vertical-align:middle;">
    <span style="font-size:18pt;font-weight:bold;color:${DARK};letter-spacing:3pt;text-transform:uppercase;">Offerte</span><br>
    <span style="font-size:11pt;font-weight:bold;color:${EMERALD};">${esc(data.offerNumber)}</span>
  </td>
</tr></table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14pt;"><tr>
  <td style="background:#f8fafc;padding:8pt 12pt;">
    <span style="font-size:8pt;color:${MUTED};text-transform:uppercase;letter-spacing:1pt;">Betreft</span><br>
    <span style="font-size:12pt;font-weight:bold;color:${DARK};">${esc(data.projectTitle)}</span>
  </td>
</tr></table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14pt;"><tr>
  <td width="50%" style="vertical-align:top;">
    <p style="margin:0 0 3pt 0;font-size:8.5pt;color:${EMERALD};text-transform:uppercase;font-weight:bold;">Voor</p>
    <p style="margin:0;">${clientLines}</p>
  </td>
  <td width="50%" style="vertical-align:top;">
    <p style="margin:0 0 3pt 0;font-size:8.5pt;color:${EMERALD};text-transform:uppercase;font-weight:bold;">Van</p>
    <p style="margin:0;">${senderLines}</p>
  </td>
</tr></table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10pt;border-collapse:collapse;"><tr>
  <td style="border-top:0.75pt solid ${LINE};border-bottom:0.75pt solid ${LINE};padding:5pt 0;font-size:9.5pt;">
    <span style="color:${MUTED};">Datum:</span> <b style="color:${DARK};">${esc(fmtOfferDate(data.date))}</b> &nbsp;·&nbsp;
    <span style="color:${MUTED};">Geldig tot:</span> <b style="color:${DARK};">${esc(offerValidUntil(data.date, data.validityDays))}</b> &nbsp;·&nbsp;
    <span style="color:${MUTED};">Offertenummer:</span> <b style="color:${DARK};">${esc(data.offerNumber)}</b>
  </td>
</tr></table>

${(["summary", "situation", "solution", "scope", "approach"] as const).map(textSection).join("")}
${phasesHtml}
${(["results", "privacy"] as const).map(textSection).join("")}
${investmentHtml}
${(["needs", "about", "terms", "acceptance"] as const).map(textSection).join("")}

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20pt;"><tr>
  ${sigCell("Voor akkoord — opdrachtgever", data.client.company || "[Opdrachtgever]")}
  ${sigCell("Voor akkoord — opdrachtnemer", data.sender.company)}
</tr></table>

<p style="margin:24pt 0 0 0;border-top:0.75pt solid ${LINE};padding-top:6pt;font-size:9pt;color:${MUTED};">
  ${esc(data.sender.company)} — ${[data.sender.email, data.sender.phone].filter(Boolean).map(esc).join(" · ")}
  &nbsp;&nbsp;|&nbsp;&nbsp; ${esc(data.offerNumber)} · ${esc(fmtOfferDate(data.date))}
</p>

</div>
</body>
</html>`;
}

/** Base64 in nette MIME-regels van 76 tekens. */
function wrap76(b64: string): string {
  return b64.replace(/(.{76})/g, "$1\r\n");
}

const MHTML_BOUNDARY = "----=_NextPart_SanaArchicons_Offerte";
const HTML_LOCATION = "file:///C:/sana-archicons/offerte.htm";
const LOGO_LOCATION = "file:///C:/sana-archicons/logo-mark.png";

/** Verpakt de HTML + het logo als MHTML zodat Word de afbeelding meeneemt. */
function buildMhtml(html: string, logoBase64: string | null): string {
  const parts = [
    `MIME-Version: 1.0`,
    `Content-Type: multipart/related; boundary="${MHTML_BOUNDARY}"; type="text/html"`,
    ``,
    `--${MHTML_BOUNDARY}`,
    `Content-Type: text/html; charset="utf-8"`,
    `Content-Transfer-Encoding: 8bit`,
    `Content-Location: ${HTML_LOCATION}`,
    ``,
    html,
    ``,
  ];
  if (logoBase64) {
    parts.push(
      `--${MHTML_BOUNDARY}`,
      `Content-Type: image/png`,
      `Content-Transfer-Encoding: base64`,
      `Content-Location: ${LOGO_LOCATION}`,
      ``,
      wrap76(logoBase64),
      ``
    );
  }
  parts.push(`--${MHTML_BOUNDARY}--`, ``);
  return parts.join("\r\n");
}

/** Haalt het logo op, bouwt het Word-bestand en start de download in de browser. */
export async function downloadOfferAsWord(data: OfferData): Promise<void> {
  let logoBase64: string | null = null;
  try {
    const res = await fetch("/logo-mark.png");
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      logoBase64 = dataUrl.split(",")[1] ?? null;
    }
  } catch {
    // Zonder logo verder — het document blijft bruikbaar.
  }

  const html = buildOfferWordHtml(data, logoBase64 ? LOGO_LOCATION : "");
  const mhtml = buildMhtml(html, logoBase64);
  const blob = new Blob([mhtml], { type: "application/msword" });

  const clientPart = data.client.company
    ? "-" + data.client.company.replace(/[\\/:*?"<>|]+/g, "").trim().replaceAll(" ", "-")
    : "";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Offerte-${data.offerNumber}${clientPart}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
