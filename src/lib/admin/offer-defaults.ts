/**
 * Offerte-generator: datamodel + Nederlandse standaardteksten.
 * Het offertedocument zelf is altijd Nederlands (klantgericht drukwerk);
 * de formulierlabels eromheen volgen de admin-taal (zie i18n.ts).
 */

export type OfferServiceLine = { id: string; description: string; amount: number };
export type OfferPhase = { id: string; name: string; duration: string };

/** Vrije-tekstsecties, in documentvolgorde (planning en investering zijn tabellen). */
export const OFFER_TEXT_SECTION_KEYS = [
  "summary",
  "situation",
  "solution",
  "scope",
  "approach",
  "results",
  "privacy",
  "needs",
  "about",
  "terms",
  "acceptance",
] as const;

export type OfferTextSectionKey = (typeof OFFER_TEXT_SECTION_KEYS)[number];

/** Documentvolgorde voor de sectienummering; "phases" en "investment" zijn tabellen. */
export const SECTION_ORDER: (OfferTextSectionKey | "phases" | "investment")[] = [
  "summary",
  "situation",
  "solution",
  "scope",
  "approach",
  "phases",
  "results",
  "privacy",
  "investment",
  "needs",
  "about",
  "terms",
  "acceptance",
];

/** Doorlopende nummering over alleen de ingeschakelde secties. */
export function sectionNumbers(data: OfferData): Map<string, number> {
  let nr = 0;
  const numberOf = new Map<string, number>();
  for (const key of SECTION_ORDER) {
    const enabled =
      key === "investment" ? true : key === "phases" ? data.phasesEnabled : data.sections[key].enabled;
    if (enabled) numberOf.set(key, ++nr);
  }
  return numberOf;
}

export type OfferTextSection = { enabled: boolean; title: string; body: string };

export type OfferData = {
  offerNumber: string;
  /** ISO-datum (yyyy-mm-dd) */
  date: string;
  validityDays: number;
  projectTitle: string;
  client: { company: string; contact: string; email: string; phone: string; city: string };
  sender: { company: string; contact: string; email: string; phone: string; website: string };
  sections: Record<OfferTextSectionKey, OfferTextSection>;
  phasesEnabled: boolean;
  phases: OfferPhase[];
  totalDuration: string;
  services: OfferServiceLine[];
  vatEnabled: boolean;
  vatRate: number;
  paymentTerms: string;
  investmentNote: string;
};

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function fmtEuro(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Documentdatum + geldigheidstermijn → "geldig tot"-datum, in het Nederlands. */
export function offerValidUntil(dateIso: string, validityDays: number): string {
  const d = new Date(dateIso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + validityDays);
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export function fmtOfferDate(dateIso: string): string {
  const d = new Date(dateIso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return dateIso;
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export function defaultOfferData(): OfferData {
  const now = new Date();
  const year = now.getFullYear();
  const iso = now.toISOString().slice(0, 10);

  return {
    offerNumber: `SA-${year}-001`,
    date: iso,
    validityDays: 14,
    projectTitle: "[Titel van het project]",
    client: { company: "", contact: "", email: "", phone: "", city: "" },
    sender: {
      company: "SANA ARCHICONS",
      contact: "Hamid Soleimani",
      email: "hamidsoleimani2022@gmail.com",
      phone: "",
      website: "sana-archicons.vercel.app",
    },
    sections: {
      summary: {
        enabled: true,
        title: "Samenvatting",
        body:
          "Naar aanleiding van ons gesprek bieden wij u graag deze offerte aan. Hieronder leest u hoe wij uw vraag begrijpen, welke oplossing wij voorstellen, hoe de planning eruitziet en wat de investering is — zodat u vooraf precies weet waar u aan toe bent.",
      },
      situation: {
        enabled: true,
        title: "Uw situatie en vraag",
        body:
          "In ons gesprek kwamen de volgende punten naar voren:\n" +
          "- [Beschrijf kort de situatie van de klant en de aanleiding van de vraag.]\n" +
          "- [Wat is het belangrijkste knelpunt of de wens?]\n" +
          "- [Wat is het gewenste eindresultaat voor de klant?]",
      },
      solution: {
        enabled: true,
        title: "Voorgestelde oplossing",
        body:
          "[Beschrijf hier in twee tot drie alinea's de oplossing die u voorstelt: wat gaat u concreet maken of doen, en waarom past dit bij de situatie van de klant?]\n\n" +
          "[Benoem eventueel de belangrijkste keuzes of uitgangspunten, bijvoorbeeld gebruikte methodes, technologie of normen.]",
      },
      scope: {
        enabled: true,
        title: "Omvang van het werk",
        body:
          "Inbegrepen in dit project:\n" +
          "- [Onderdeel 1]\n" +
          "- [Onderdeel 2]\n" +
          "- [Onderdeel 3]\n\n" +
          "Niet inbegrepen (op verzoek als apart project offreerbaar):\n" +
          "- [Bijvoorbeeld: doorlopend onderhoud of contentproductie]\n" +
          "- [Bijvoorbeeld: koppelingen met externe systemen]",
      },
      approach: {
        enabled: true,
        title: "Aanpak en werkwijze",
        body:
          "- Inventarisatie: wij brengen uw situatie, wensen en beschikbare gegevens in kaart.\n" +
          "- Uitwerking: wij werken de oplossing stap voor stap uit en stemmen tussentijds met u af.\n" +
          "- Oplevering: wij leveren het resultaat op, lichten het toe en dragen alles overzichtelijk aan u over.\n" +
          "- Nazorg: tot [twee] weken na oplevering kunt u bij ons terecht met vragen.",
      },
      results: {
        enabled: true,
        title: "Verwacht resultaat",
        body:
          "- [Concreet resultaat 1 — bijv. een helder adviesrapport met maatregelen en terugverdientijden.]\n" +
          "- [Concreet resultaat 2]\n" +
          "- Eén vast aanspreekpunt en heldere communicatie gedurende het hele traject.",
      },
      privacy: {
        enabled: true,
        title: "Gegevens, veiligheid en privacy",
        body:
          "Wij gaan zorgvuldig om met uw gegevens. Documenten en informatie die u met ons deelt, gebruiken wij uitsluitend voor dit project en delen wij niet met derden. Op verzoek verwijderen wij uw gegevens na afronding van het project.",
      },
      needs: {
        enabled: true,
        title: "Wat wij van u nodig hebben",
        body:
          "- [Documenten, tekeningen of gegevens die nodig zijn om te starten]\n" +
          "- [Toegang tot locatie of systemen, indien van toepassing]\n" +
          "- Eén contactpersoon voor vragen en akkoorden.",
      },
      about: {
        enabled: true,
        title: "Over Sana Archicons",
        body:
          "SANA ARCHICONS combineert bouwkundige kennis met moderne technologie. Wij adviseren bedrijven en particulieren op het gebied van bouwkundig advies, energieadvies, AI-consultancy en procesautomatisering — altijd praktisch, transparant en gericht op meetbaar resultaat.",
      },
      terms: {
        enabled: true,
        title: "Voorwaarden",
        body:
          "- Deze offerte is geldig gedurende de hierboven genoemde termijn.\n" +
          "- Tot twee revisierondes binnen de afgesproken omvang zijn inbegrepen.\n" +
          "- Na volledige betaling zijn alle opgeleverde resultaten uw eigendom.\n" +
          "- Beide partijen behandelen elkaars informatie vertrouwelijk.\n" +
          "- Doorlopende kosten van derden (zoals hosting, licenties of API-gebruik) vallen buiten deze offerte, tenzij anders vermeld.",
      },
      acceptance: {
        enabled: true,
        title: "Volgende stap en akkoord",
        body:
          "Kunt u zich vinden in dit voorstel? Dan ontvangen wij graag uw akkoord — een ondertekend exemplaar van deze offerte of een bevestiging per e-mail volstaat. Na uw akkoord plannen wij direct de startdatum in.\n\n" +
          "Heeft u vragen of wilt u de omvang nog aanscherpen? Dan bespreken wij dat graag in een kort gesprek.",
      },
    },
    phasesEnabled: true,
    phases: [
      { id: newId(), name: "Inventarisatie en informatie verzamelen", duration: "1 week" },
      { id: newId(), name: "Uitwerking en uitvoering", duration: "2 à 3 weken" },
      { id: newId(), name: "Oplevering en overdracht", duration: "1 week" },
    ],
    totalDuration: "Totale doorlooptijd: circa 4 à 5 weken (fasen kunnen deels overlappen).",
    services: [{ id: newId(), description: "[Dienst of projectonderdeel]", amount: 0 }],
    vatEnabled: true,
    vatRate: 21,
    paymentTerms: "50% bij opdracht, 25% halverwege het project, 25% bij oplevering.",
    investmentNote:
      "Alle bedragen zijn in euro's. Eventuele doorlopende kosten van derden (zoals hosting, licenties of API-gebruik) zijn niet inbegrepen en worden vooraf met u afgestemd.",
  };
}
