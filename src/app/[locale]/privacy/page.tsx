import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";

/**
 * Privacy- en cookieverklaring (AVG/GDPR) + AI-transparantie.
 * Lange juridische tekst leeft hier per taal in het bestand zelf in plaats
 * van in de messages-JSON, zodat de verklaring als één document leesbaar
 * en onderhoudbaar blijft.
 */

type Section = { title: string; body: (string | string[])[] };

const CONTENT: Record<
  string,
  { title: string; subtitle: string; updated: string; sections: Section[] }
> = {
  nl: {
    title: "Privacy & cookies",
    subtitle:
      "Hoe Arc Wise omgaat met uw persoonsgegevens — volgens de Algemene Verordening Gegevensbescherming (AVG/GDPR).",
    updated: "Laatst bijgewerkt: 12 augustus 2026",
    sections: [
      {
        title: "1. Wie zijn wij",
        body: [
          "Arc Wise is een Nederlands advies- en consultancybureau voor bouwadvies, energieadvies, AI-consultancy en procesautomatisering. Arc Wise is de verwerkingsverantwoordelijke voor de verwerking van persoonsgegevens die in deze verklaring wordt beschreven.",
          "Contact: info@arcwise.nl · Nederland.",
        ],
      },
      {
        title: "2. Welke persoonsgegevens verwerken wij",
        body: [
          [
            "Contact- en adviesformulier: naam, e-mailadres, telefoonnummer, eventuele bedrijfsnaam en uw bericht.",
            "Chat met de AI-assistent: de berichten die u in de chat typt en een anoniem gespreksnummer.",
            "Afspraken en boekingen: naam, contactgegevens en de gekozen dienst.",
            "Technische gegevens: beperkte loggegevens (zoals IP-adres) die onze hostingprovider automatisch verwerkt voor beveiliging en de goede werking van de website.",
          ],
          "Wij verzamelen geen bijzondere categorieën persoonsgegevens en vragen u die ook niet met ons te delen — ook niet via de chat.",
        ],
      },
      {
        title: "3. Waarvoor en op welke grondslag",
        body: [
          [
            "Het beantwoorden van uw vraag of aanvraag en het inplannen van een adviesgesprek — uitvoering van de overeenkomst of de precontractuele fase (art. 6 lid 1 sub b AVG).",
            "Het verbeteren van onze dienstverlening en het veilig houden van de website — gerechtvaardigd belang (art. 6 lid 1 sub f AVG).",
            "Waar toestemming vereist is, vragen wij die vooraf (art. 6 lid 1 sub a AVG); u kunt uw toestemming op elk moment intrekken.",
          ],
        ],
      },
      {
        title: "4. Transparantie over AI",
        body: [
          "Deze website is (mede) met behulp van AI-technologie ontwikkeld.",
          "De chatassistent op deze website is een AI-systeem: u chat met software, niet met een mens. Antwoorden worden automatisch gegenereerd en kunnen onvolledig of onjuist zijn; aan chatantwoorden kunnen geen rechten worden ontleend. Voor definitief advies plannen wij graag een persoonlijk adviesgesprek.",
          "Chatberichten worden verwerkt door onze AI-dienstverlener om een antwoord te kunnen genereren. Deel daarom geen gevoelige of vertrouwelijke gegevens in de chat.",
          "Wij nemen geen besluiten met rechtsgevolgen voor u op basis van uitsluitend geautomatiseerde verwerking (art. 22 AVG).",
        ],
      },
      {
        title: "5. Met wie delen wij gegevens",
        body: [
          "Wij delen persoonsgegevens uitsluitend met dienstverleners (verwerkers) die nodig zijn om de website en onze diensten te laten werken:",
          [
            "Hosting van de website (Vercel).",
            "Database en formulieropslag (Supabase).",
            "AI-modelprovider voor het genereren van chatantwoorden (OpenRouter).",
          ],
          "Sommige dienstverleners verwerken gegevens buiten de Europese Economische Ruimte. In dat geval gebeurt dit uitsluitend met passende waarborgen, zoals de standaardcontractbepalingen (SCC's) van de Europese Commissie. Wij verkopen uw gegevens nooit aan derden.",
        ],
      },
      {
        title: "6. Bewaartermijnen",
        body: [
          [
            "Aanvragen en leads: maximaal 2 jaar na het laatste contact.",
            "Chatgesprekken: maximaal 12 maanden.",
            "Administratieve gegevens waarvoor een wettelijke bewaarplicht geldt: 7 jaar (fiscale bewaarplicht).",
          ],
          "Daarna worden gegevens verwijderd of geanonimiseerd.",
        ],
      },
      {
        title: "7. Cookies",
        body: [
          "Deze website gebruikt alleen functionele cookies en vergelijkbare opslag die noodzakelijk zijn voor de werking van de site: uw taalvoorkeur, de inlogsessie voor beheerders en het onthouden van uw chatgesprek.",
          "Wij gebruiken geen tracking-, advertentie- of analysecookies van derden. Daarom is er geen cookiebanner nodig. Mocht dit in de toekomst veranderen, dan vragen wij eerst uw toestemming.",
        ],
      },
      {
        title: "8. Uw rechten",
        body: [
          "Op grond van de AVG heeft u het recht op inzage, rectificatie, verwijdering (“recht op vergetelheid”), beperking van de verwerking, overdraagbaarheid van gegevens en bezwaar tegen de verwerking.",
          "Stuur uw verzoek naar info@arcwise.nl; wij reageren binnen één maand. Bent u niet tevreden over hoe wij met uw gegevens omgaan, dan kunt u een klacht indienen bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).",
        ],
      },
      {
        title: "9. Beveiliging",
        body: [
          "Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen, waaronder versleutelde verbindingen (HTTPS), toegangsbeperking tot systemen en zorgvuldig gekozen dienstverleners.",
        ],
      },
      {
        title: "10. Wijzigingen",
        body: [
          "Wij kunnen deze verklaring aanpassen, bijvoorbeeld bij nieuwe functionaliteit of gewijzigde regelgeving. De actuele versie staat altijd op deze pagina.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy & cookies",
    subtitle:
      "How Arc Wise handles your personal data — in accordance with the EU General Data Protection Regulation (GDPR).",
    updated: "Last updated: 12 August 2026",
    sections: [
      {
        title: "1. Who we are",
        body: [
          "Arc Wise is a Dutch advisory and consultancy firm for construction advice, energy consulting, AI consultancy and process automation. Arc Wise is the data controller for the processing of personal data described in this statement.",
          "Contact: info@arcwise.nl · The Netherlands.",
        ],
      },
      {
        title: "2. What personal data we process",
        body: [
          [
            "Contact and advice form: name, e-mail address, phone number, company name (optional) and your message.",
            "Chat with the AI assistant: the messages you type in the chat and an anonymous conversation ID.",
            "Appointments and bookings: name, contact details and the selected service.",
            "Technical data: limited log data (such as IP address) processed automatically by our hosting provider for security and proper operation of the website.",
          ],
          "We do not collect special categories of personal data and ask you not to share such data with us — including via the chat.",
        ],
      },
      {
        title: "3. Purposes and legal basis",
        body: [
          [
            "Answering your question or request and scheduling a consultation — performance of a contract or pre-contractual steps (Art. 6(1)(b) GDPR).",
            "Improving our services and keeping the website secure — legitimate interest (Art. 6(1)(f) GDPR).",
            "Where consent is required, we ask for it in advance (Art. 6(1)(a) GDPR); you can withdraw your consent at any time.",
          ],
        ],
      },
      {
        title: "4. AI transparency",
        body: [
          "This website was developed (in part) with the help of AI technology.",
          "The chat assistant on this website is an AI system: you are chatting with software, not with a human. Answers are generated automatically and may be incomplete or incorrect; no rights can be derived from chat answers. For definitive advice we are happy to schedule a personal consultation.",
          "Chat messages are processed by our AI service provider in order to generate a response. Please do not share sensitive or confidential information in the chat.",
          "We do not make decisions with legal effects concerning you based solely on automated processing (Art. 22 GDPR).",
        ],
      },
      {
        title: "5. Who we share data with",
        body: [
          "We only share personal data with service providers (processors) needed to run the website and our services:",
          [
            "Website hosting (Vercel).",
            "Database and form storage (Supabase).",
            "AI model provider for generating chat responses (OpenRouter).",
          ],
          "Some providers process data outside the European Economic Area. Where that happens, it is done exclusively with appropriate safeguards, such as the European Commission's Standard Contractual Clauses (SCCs). We never sell your data to third parties.",
        ],
      },
      {
        title: "6. Retention periods",
        body: [
          [
            "Requests and leads: up to 2 years after the last contact.",
            "Chat conversations: up to 12 months.",
            "Administrative records subject to a statutory retention obligation: 7 years (Dutch tax law).",
          ],
          "After that, data is deleted or anonymised.",
        ],
      },
      {
        title: "7. Cookies",
        body: [
          "This website only uses functional cookies and similar storage that are necessary for the site to work: your language preference, the administrator login session and remembering your chat conversation.",
          "We do not use third-party tracking, advertising or analytics cookies. That is why no cookie banner is required. Should this change in the future, we will ask for your consent first.",
        ],
      },
      {
        title: "8. Your rights",
        body: [
          "Under the GDPR you have the right of access, rectification, erasure (“right to be forgotten”), restriction of processing, data portability and objection to processing.",
          "Send your request to info@arcwise.nl; we will respond within one month. If you are not satisfied with how we handle your data, you can lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens, autoriteitpersoonsgegevens.nl).",
        ],
      },
      {
        title: "9. Security",
        body: [
          "We take appropriate technical and organisational measures to protect your data, including encrypted connections (HTTPS), restricted access to systems and carefully selected service providers.",
        ],
      },
      {
        title: "10. Changes",
        body: [
          "We may update this statement, for example for new functionality or changed regulations. The current version is always available on this page.",
        ],
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const c = CONTENT[locale] ?? CONTENT.nl;
  return { title: c.title, description: c.subtitle };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale] ?? CONTENT.nl;

  return (
    <>
      <PageHeader title={c.title} subtitle={c.subtitle} eyebrow="Arc Wise" />
      <section className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-xs uppercase tracking-[0.16em] text-emerald/80">
          {c.updated}
        </p>
        <div className="mt-8 space-y-10">
          {c.sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-foreground">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
                {s.body.map((part, i) =>
                  Array.isArray(part) ? (
                    <ul key={i} className="list-disc space-y-2 pl-5">
                      {part.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={i}>{part}</p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
