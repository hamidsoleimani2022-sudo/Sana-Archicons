// Datamodel voor academie-lessen. Dit is exact de structuur die in fase 2
// door Claude wordt gegenereerd en in Supabase wordt opgeslagen:
// { terms: [{ term, meaning, examples[3], quiz: { q, options[4], answer } }] }

export type Quiz = {
  q: string;
  options: [string, string, string, string];
  /** index (0-3) van het juiste antwoord in options */
  answer: number;
};

export type Term = {
  term: string;
  meaning: string;
  examples: [string, string, string];
  quiz: Quiz;
};

export type Lesson = {
  slug: string;
  title: string;
  intro: string;
  keyPoints: string[];
  terms: Term[];
};

export const sampleLesson: Lesson = {
  slug: "voorbeeld",
  title: "Introductie energielabels voor woningen",
  intro:
    "In deze les leert u wat een energielabel is, hoe het wordt bepaald volgens de NTA 8800 en welke rol isolatie (Rc-waarde) daarbij speelt.",
  keyPoints: [
    "Een energielabel (A++++ t/m G) laat zien hoe energiezuinig een gebouw is en is verplicht bij verkoop en verhuur.",
    "Sinds 2021 wordt het label bepaald volgens de NTA 8800-rekenmethode, uitgedrukt in kWh/m² per jaar.",
    "De Rc-waarde geeft de warmteweerstand van een constructie aan: hoe hoger, hoe beter geïsoleerd.",
    "Alleen een gecertificeerd (vakbekwaam) adviseur mag een geldig energielabel afgeven.",
    "Een beter label verhoogt de woningwaarde en verlaagt de energiekosten.",
  ],
  terms: [
    {
      term: "Energielabel",
      meaning:
        "Een officiële classificatie (A++++ t/m G) die aangeeft hoe energiezuinig een gebouw is, gebaseerd op het primaire fossiele energiegebruik in kWh/m² per jaar.",
      examples: [
        "Bij de verkoop van een tussenwoning uit 1985 is een geldig energielabel verplicht; zonder label riskeert de verkoper een boete.",
        "Een verhuurder wil de huur verhogen, maar het appartement heeft label F — sinds 2024 gelden er beperkingen voor het verhuren van slecht geïsoleerde woningen.",
        "Een koper vergelijkt twee vergelijkbare woningen: de woning met label B heeft naar verwachting honderden euro's per jaar lagere energiekosten dan die met label E.",
      ],
      quiz: {
        q: "Wat geeft een energielabel van een woning aan?",
        options: [
          "De hoogte van de WOZ-waarde",
          "Hoe energiezuinig de woning is",
          "De ouderdom van de cv-ketel",
          "Het maximale aantal bewoners",
        ],
        answer: 1,
      },
    },
    {
      term: "NTA 8800",
      meaning:
        "De Nederlandse rekenmethode (sinds 2021) waarmee de energieprestatie van gebouwen wordt bepaald; het resultaat wordt uitgedrukt in kWh/m² per jaar.",
      examples: [
        "Een energieadviseur neemt de woning op — isolatie, installaties, beglazing — en voert de gegevens in software in die volgens de NTA 8800 rekent.",
        "Een woning die vóór 2021 label C had op basis van de oude Energie-Index, kan na herberekening volgens NTA 8800 een ander label krijgen.",
        "Bij nieuwbouw wordt met de NTA 8800 getoetst of het ontwerp voldoet aan de BENG-eisen (Bijna Energieneutrale Gebouwen).",
      ],
      quiz: {
        q: "In welke eenheid drukt de NTA 8800 de energieprestatie van een gebouw uit?",
        options: [
          "kWh/m² per jaar",
          "m³ gas per maand",
          "Euro per jaar",
          "Watt per m³",
        ],
        answer: 0,
      },
    },
    {
      term: "Rc-waarde",
      meaning:
        "De warmteweerstand van een constructie (dak, gevel, vloer) in m²·K/W. Hoe hoger de Rc-waarde, hoe beter de constructie isoleert.",
      examples: [
        "Een jaren-70-woning heeft een spouwmuur zonder isolatie (Rc ≈ 0,4); na het inblazen van spouwisolatie stijgt de Rc naar circa 1,7 en verbetert het label.",
        "Voor nieuwbouw geldt een minimale Rc-waarde van 6,3 voor het dak — daarom wordt daar dik isolatiemateriaal toegepast.",
        "Een eigenaar twijfelt tussen dakisolatie (Rc +3,5) en nieuwe kozijnen; de adviseur rekent voor welke maatregel het meeste labelstappen oplevert.",
      ],
      quiz: {
        q: "Wat betekent een hogere Rc-waarde van een dak?",
        options: [
          "Het dak is zwaarder belastbaar",
          "Het dak laat meer daglicht door",
          "Het dak isoleert beter tegen warmteverlies",
          "Het dak is beter bestand tegen regen",
        ],
        answer: 2,
      },
    },
  ],
};

/** In fase 2 wordt dit vervangen door een query naar Supabase. */
export function getLessonBySlug(slug: string): Lesson | null {
  return slug === sampleLesson.slug ? sampleLesson : null;
}
