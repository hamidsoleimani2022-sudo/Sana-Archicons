/**
 * Drietalige vertalingen voor het admin-panel (NL / FA / EN).
 * Bewust los van next-intl: het panel leeft buiten de [locale]-routing en
 * schakelt via een cookie (sana_admin_lang). Dit bestand is client- én
 * server-safe (geen "server-only").
 */

export type AdminLang = "nl" | "fa" | "en";

export const ADMIN_LANG_COOKIE = "sana_admin_lang";

export const ADMIN_LANGS: { code: AdminLang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
];

export function langDir(lang: AdminLang): "ltr" | "rtl" {
  return lang === "fa" ? "rtl" : "ltr";
}

export function fmtNum(lang: AdminLang, n: number): string {
  const locale = lang === "fa" ? "fa-IR" : lang === "nl" ? "nl-NL" : "en-US";
  return n.toLocaleString(locale);
}

export function fmtDate(lang: AdminLang, iso: string): string {
  const locale = lang === "fa" ? "fa-IR" : lang === "nl" ? "nl-NL" : "en-GB";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export function fmtCost(usd: number): string {
  return "$" + usd.toFixed(usd < 1 ? 4 : 2);
}

export function fmtEur(lang: AdminLang, n: number): string {
  const locale = lang === "fa" ? "fa-IR" : lang === "nl" ? "nl-NL" : "en-IE";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return "€" + n.toFixed(0);
  }
}

type Statuses = { new: string; contacted: string; scheduled: string; won: string; lost: string };
type DocStatuses = { pending: string; processing: string; ready: string; error: string };
type Channels = { web: string; widget: string };
type ServiceLabels = {
  "bouwkundig-advies": string;
  energieadvies: string;
  "ai-consultancy": string;
  procesautomatisering: string;
  anders: string;
};
type TimeLabels = { morning: string; afternoon: string; evening: string };
type StageLabels = {
  new: string;
  qualifying: string;
  meeting: string;
  proposal: string;
  negotiation: string;
  won: string;
  lost: string;
};
type ContactSources = { website: string; chatbot: string; manual: string };
type ActivityTypes = { call: string; meeting: string; note: string; task: string };
type DealStatuses = { open: string; won: string; lost: string };
type ChannelStatuses = { active: string; configurable: string; planned: string };
type ChannelItem = { name: string; desc: string };

export type AdminDict = {
  common: {
    panelTitle: string;
    logout: string;
    save: string;
    saving: string;
    delete: string;
    search: string;
    all: string;
    done: string;
    error: string;
    loading: string;
    notConfigured: string;
    noData: string;
    unauthorized: string;
  };
  tabs: {
    dashboard: string;
    leads: string;
    offers: string;
    knowledge: string;
    models: string;
    conversations: string;
    feedback: string;
    contacts: string;
    companies: string;
    deals: string;
    activities: string;
    reports: string;
    assistant: string;
    channels: string;
  };
  navGroups: { overview: string; crm: string; chatbot: string; settings: string };
  login: {
    title: string;
    subtitle: string;
    password: string;
    submit: string;
    submitting: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    conversations: string;
    users: string;
    messages: string;
    chatbotLeads: string;
    ofTotalLeads: string; // "van X leads totaal" — count wordt ervoor gezet
    conversionRate: string;
    conversionHint: string;
    satisfaction: string;
    estCost: string;
    tokensHint: string;
    gaps: string;
    gapsHint: string;
    byChannel: string;
    noConversations: string;
    modelUsage: string;
    estimated: string;
    model: string;
    replies: string;
    tokensIn: string;
    tokensOut: string;
    cost: string;
    total: string;
    channels: Channels;
    crmTitle: string;
    openDeals: string;
    pipelineValue: string;
    contactsTotal: string;
    openTasks: string;
    overdueSuffix: string;
    agentTitle: string;
    agentEmpty: string;
    agentAll: string;
  };
  leads: {
    title: string;
    subtitle: string; // "aanvragen in totaal" — count ervoor
    exportCsv: string;
    searchPlaceholder: string;
    statuses: Statuses;
    empty: string;
    noResults: string;
    business: string;
    service: string;
    phone: string;
    email: string;
    time: string;
    message: string;
    submittedAt: string;
    status: string;
    sourceChatbot: string;
    services: ServiceLabels;
    times: TimeLabels;
    convert: string;
    converting: string;
    convertDone: string;
  };
  knowledge: {
    title: string;
    subtitle: string; // "documenten" — count ervoor
    addTitle: string;
    tabText: string;
    tabUrl: string;
    tabFile: string;
    docTitle: string;
    docTitlePlaceholder: string;
    text: string;
    textPlaceholder: string;
    tags: string;
    tagsPlaceholder: string;
    urlLabel: string;
    urlTitleOptional: string;
    filesLabel: string;
    filesSelected: string; // "bestanden geselecteerd" — count ervoor
    addIndex: string;
    fetchIndex: string;
    uploadIndex: string;
    processing: string;
    testTitle: string;
    testPlaceholder: string;
    searchBtn: string;
    testEmpty: string;
    similarity: string;
    docs: string;
    docsEmpty: string;
    reindex: string;
    deleteConfirm: string;
    chunks: string;
    statuses: DocStatuses;
  };
  models: {
    title: string;
    subtitle: string;
    genTitle: string;
    activeModel: string;
    current: string;
    fallback: string;
    none: string;
    temperature: string;
    maxTokens: string;
    topP: string;
    saveModel: string;
    retrTitle: string;
    embedInfoPrefix: string; // "Huidig embedding-model:"
    embedInfoSuffix: string; // uitleg re-index
    chunkSize: string;
    overlap: string;
    topK: string;
    threshold: string;
    saveRetrieval: string;
  };
  conversations: {
    title: string;
    subtitle: string;
    empty: string;
    noMessages: string;
    retrievedSources: string;
    tokensOut: string;
    channels: Channels;
  };
  feedback: {
    title: string;
    subtitle: string;
    negTitle: string;
    negEmpty: string;
    gapsTitle: string;
    gapsSubtitle: string;
    gapsEmpty: string;
  };
  offers: {
    title: string;
    subtitle: string;
    docLanguageHint: string;
    print: string;
    word: string;
    reset: string;
    resetConfirm: string;
    metaTitle: string;
    offerNumber: string;
    date: string;
    validityDays: string;
    projectTitle: string;
    clientTitle: string;
    clientCompany: string;
    clientContact: string;
    clientEmail: string;
    clientPhone: string;
    clientCity: string;
    senderTitle: string;
    senderContact: string;
    senderEmail: string;
    senderPhone: string;
    senderWebsite: string;
    servicesTitle: string;
    serviceDescription: string;
    serviceAmount: string;
    addService: string;
    removeLine: string;
    vatEnabled: string;
    paymentTerms: string;
    investmentNote: string;
    phasesTitle: string;
    phasesEnabled: string;
    phaseName: string;
    phaseDuration: string;
    addPhase: string;
    totalDuration: string;
    sectionsTitle: string;
    sectionsHint: string;
    previewTitle: string;
  };
  crm: {
    stages: StageLabels;
    sources: ContactSources;
    add: string;
    edit: string;
    cancel: string;
    confirmDelete: string;
    notLinked: string;
    contacts: {
      title: string;
      subtitle: string;
      addBtn: string;
      editTitle: string;
      empty: string;
      noResults: string;
      searchPlaceholder: string;
      name: string;
      position: string;
      company: string;
      noCompany: string;
      source: string;
      notes: string;
      dealsCount: string;
    };
    companies: {
      title: string;
      subtitle: string;
      addBtn: string;
      editTitle: string;
      empty: string;
      searchPlaceholder: string;
      name: string;
      industry: string;
      website: string;
      city: string;
      size: string;
      notes: string;
      contactsCount: string;
      dealsCount: string;
    };
    deals: {
      title: string;
      subtitle: string;
      addBtn: string;
      editTitle: string;
      empty: string;
      dealTitle: string;
      contact: string;
      stage: string;
      amount: string;
      expectedClose: string;
      daysInStage: string;
      statuses: DealStatuses;
      lostReason: string;
      pipelineValue: string;
      openDeals: string;
    };
    activities: {
      title: string;
      subtitle: string;
      addBtn: string;
      empty: string;
      types: ActivityTypes;
      typeLabel: string;
      titleLabel: string;
      details: string;
      dueAt: string;
      contact: string;
      deal: string;
      markDone: string;
      reopen: string;
      doneAt: string;
      overdue: string;
      filterAll: string;
      filterOpen: string;
      filterDone: string;
    };
    reports: {
      title: string;
      subtitle: string;
      pipelineByStage: string;
      dealsSuffix: string;
      winRate: string;
      winRateHint: string;
      wonValue: string;
      openValue: string;
      avgDeal: string;
      bySource: string;
      monthly: string;
      noData: string;
    };
  };
  agent: {
    title: string;
    subtitle: string;
    insightsTitle: string;
    insightsEmpty: string;
    severity: { high: string; medium: string; low: string };
    insights: {
      overdueTask: string;
      dueSoon: string;
      staleDeal: string;
      noNextStep: string;
      newLead: string;
    };
    chatTitle: string;
    chatIntro: string;
    chatPlaceholder: string;
    send: string;
    thinking: string;
    aiNotConfigured: string;
    contextNote: string;
  };
  channels: {
    title: string;
    subtitle: string;
    statuses: ChannelStatuses;
    envHint: string;
    plannedHint: string;
    items: {
      website: ChannelItem;
      widget: ChannelItem;
      telegram: ChannelItem;
      instagram: ChannelItem;
      whatsapp: ChannelItem;
      linkedin: ChannelItem;
    };
  };
};

const nl: AdminDict = {
  common: {
    panelTitle: "Admin panel Sana Archicons",
    logout: "Uitloggen",
    save: "Opslaan",
    saving: "Bezig met opslaan…",
    delete: "Verwijderen",
    search: "Zoeken",
    all: "Alle",
    done: "Gelukt.",
    error: "Er ging iets mis.",
    loading: "Laden…",
    notConfigured: "De Supabase-verbinding is nog niet ingesteld.",
    noData: "Geen gegevens beschikbaar.",
    unauthorized: "Geen toegang.",
  },
  tabs: {
    dashboard: "Dashboard",
    leads: "Aanvragen",
    offers: "Offertes",
    knowledge: "Kennisbank",
    models: "Modellen",
    conversations: "Gesprekken",
    feedback: "Feedback",
    contacts: "Contacten",
    companies: "Bedrijven",
    deals: "Deals",
    activities: "Taken",
    reports: "Rapporten",
    assistant: "Agent CRM",
    channels: "Kanalen",
  },
  navGroups: { overview: "Overzicht", crm: "CRM", chatbot: "Chatbot", settings: "Instellingen" },
  login: {
    title: "Admin panel Sana Archicons",
    subtitle: "Log in om adviesaanvragen en de chatbot te beheren.",
    password: "Wachtwoord",
    submit: "Inloggen",
    submitting: "Bezig met inloggen…",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Overzicht van de chatbot-prestaties in alle kanalen.",
    conversations: "Gesprekken",
    users: "Unieke gebruikers",
    messages: "Berichten",
    chatbotLeads: "Chatbot-aanvragen",
    ofTotalLeads: "van het totaal aan aanvragen",
    conversionRate: "Conversie naar aanvraag",
    conversionHint: "chatbot-aanvragen ÷ gesprekken",
    satisfaction: "Tevredenheid",
    estCost: "Geschatte kosten",
    tokensHint: "tokens",
    gaps: "Antwoorden zonder bron",
    gapsHint: "mogelijke kennishiaten",
    byChannel: "Gesprekken per kanaal",
    noConversations: "Nog geen gesprekken geregistreerd.",
    modelUsage: "Tokenverbruik en kosten per model",
    estimated: "kosten zijn indicatief",
    model: "Model",
    replies: "Antwoorden",
    tokensIn: "Tokens in",
    tokensOut: "Tokens uit",
    cost: "Kosten",
    total: "Totaal",
    channels: { web: "Chatpagina", widget: "Widget" },
    crmTitle: "CRM-overzicht",
    openDeals: "Open deals",
    pipelineValue: "Pijplijnwaarde",
    contactsTotal: "Contacten",
    openTasks: "Open taken",
    overdueSuffix: "verlopen",
    agentTitle: "Agent CRM — aandachtspunten",
    agentEmpty: "Geen aandachtspunten — alles is bijgewerkt.",
    agentAll: "Alle adviezen bekijken →",
  },
  leads: {
    title: "Adviesaanvragen",
    subtitle: "aanvragen in totaal.",
    exportCsv: "CSV-export",
    searchPlaceholder: "Zoek op naam, telefoon, bedrijf of omschrijving…",
    statuses: {
      new: "Nieuw",
      contacted: "Contact gehad",
      scheduled: "Afspraak gepland",
      won: "Klant geworden",
      lost: "Afgevallen",
    },
    empty: "Er zijn nog geen aanvragen.",
    noResults: "Geen resultaten voor deze zoekopdracht/filter.",
    business: "Bedrijf",
    service: "Dienst",
    phone: "Telefoon",
    email: "E-mail",
    time: "Voorkeurstijd",
    message: "Omschrijving",
    submittedAt: "Ingediend op",
    status: "Status",
    sourceChatbot: "via chatbot",
    services: {
      "bouwkundig-advies": "Bouwkundig advies",
      energieadvies: "Energieadvies / energielabel",
      "ai-consultancy": "AI consultancy",
      procesautomatisering: "Procesautomatisering",
      anders: "Anders",
    },
    times: { morning: "Ochtend", afternoon: "Middag", evening: "Avond" },
    convert: "Converteer naar CRM",
    converting: "Bezig met converteren…",
    convertDone: "Aanvraag omgezet naar CRM-contact en deal.",
  },
  knowledge: {
    title: "Kennisbank",
    subtitle: "documenten waar de chatbot zijn antwoorden op baseert.",
    addTitle: "Nieuwe bron toevoegen",
    tabText: "Tekst",
    tabUrl: "Webadres",
    tabFile: "Bestand",
    docTitle: "Documenttitel",
    docTitlePlaceholder: "Bijv.: Diensten van Sana Archicons",
    text: "Tekst",
    textPlaceholder: "Plak hier de brontekst…",
    tags: "Labels (optioneel, komma-gescheiden)",
    tagsPlaceholder: "bijv.: diensten, tarieven",
    urlLabel: "Adres van de pagina (URL)",
    urlTitleOptional: "Titel (optioneel; anders paginatitel)",
    filesLabel: "Bestanden (md, txt, csv, json, yaml, html, pdf — max 10 MB per stuk)",
    filesSelected: "bestand(en) geselecteerd.",
    addIndex: "Toevoegen en indexeren",
    fetchIndex: "Ophalen en indexeren",
    uploadIndex: "Uploaden en indexeren",
    processing: "Bezig met verwerken…",
    testTitle: "Testzoekopdracht",
    testPlaceholder: "Typ een testvraag om de opgehaalde fragmenten te zien…",
    searchBtn: "Zoeken",
    testEmpty: "Geen resultaat boven de similariteitsdrempel.",
    similarity: "similariteit",
    docs: "Documenten",
    docsEmpty: "Nog geen documenten toegevoegd.",
    reindex: "Herindexeren",
    deleteConfirm: "Document verwijderen:",
    chunks: "fragmenten",
    statuses: {
      pending: "In wachtrij",
      processing: "Bezig",
      ready: "Gereed",
      error: "Fout",
    },
  },
  models: {
    title: "Modellen en retrieval",
    subtitle: "Alle antwoordmodellen lopen via OpenRouter; wisselen van model is één instelling.",
    genTitle: "Antwoordmodel",
    activeModel: "Actief model",
    current: "huidig",
    fallback: "Fallback-model",
    none: "Geen",
    temperature: "Temperature",
    maxTokens: "Max. tokens per antwoord",
    topP: "top_p",
    saveModel: "Modelinstellingen opslaan",
    retrTitle: "Embedding en retrieval",
    embedInfoPrefix: "Huidig embedding-model:",
    embedInfoSuffix:
      "Een ander embedding-model of andere dimensies vereist een volledige herindexering van de kennisbank.",
    chunkSize: "Fragmentgrootte (tokens)",
    overlap: "Overlap (tokens)",
    topK: "top_k (aantal bronnen)",
    threshold: "Similariteitsdrempel",
    saveRetrieval: "Retrieval-instellingen opslaan",
  },
  conversations: {
    title: "Gesprekken",
    subtitle: "recente gesprekken. Klik op een gesprek voor de berichten en opgehaalde bronnen.",
    empty: "Nog geen gesprekken geregistreerd.",
    noMessages: "Geen berichten.",
    retrievedSources: "Opgehaalde bronnen:",
    tokensOut: "tokens uit",
    channels: { web: "Chatpagina", widget: "Widget" },
  },
  feedback: {
    title: "Feedback en onbeantwoorde vragen",
    subtitle: "Verbeterpunten: afgekeurde antwoorden en vragen zonder bron in de kennisbank.",
    negTitle: "Negatieve feedback 👎",
    negEmpty: "Nog geen negatieve feedback.",
    gapsTitle: "Onbeantwoorde vragen",
    gapsSubtitle: "Deze vragen hadden geen bron in de kennisbank — goede kandidaten voor een nieuw document.",
    gapsEmpty: "Geen onbeantwoorde vragen geregistreerd.",
  },
  offers: {
    title: "Offertes",
    subtitle: "Stel een professionele offerte samen; rechts zie je direct het resultaat.",
    docLanguageHint: "Het offertedocument zelf is altijd in het Nederlands.",
    print: "Afdrukken / PDF",
    word: "Download Word",
    reset: "Nieuwe offerte",
    resetConfirm: "Alle velden terugzetten naar de standaardtekst?",
    metaTitle: "Offertegegevens",
    offerNumber: "Offertenummer",
    date: "Datum",
    validityDays: "Geldigheid (dagen)",
    projectTitle: "Titel van het project (Betreft)",
    clientTitle: "Opdrachtgever (klant)",
    clientCompany: "Bedrijfsnaam",
    clientContact: "Contactpersoon",
    clientEmail: "E-mail",
    clientPhone: "Telefoon",
    clientCity: "Plaats",
    senderTitle: "Uw gegevens (afzender)",
    senderContact: "Naam",
    senderEmail: "E-mail",
    senderPhone: "Telefoon",
    senderWebsite: "Website",
    servicesTitle: "Diensten en prijzen",
    serviceDescription: "Omschrijving",
    serviceAmount: "Bedrag (€, excl. btw)",
    addService: "+ Regel toevoegen",
    removeLine: "Verwijderen",
    vatEnabled: "btw (21%) berekenen en tonen",
    paymentTerms: "Betalingsvoorwaarden",
    investmentNote: "Toelichting bij de investering",
    phasesTitle: "Planning en fasen",
    phasesEnabled: "Planningstabel opnemen in de offerte",
    phaseName: "Werkzaamheden",
    phaseDuration: "Duur",
    addPhase: "+ Fase toevoegen",
    totalDuration: "Totale doorlooptijd (zin onder de tabel)",
    sectionsTitle: "Tekstsecties",
    sectionsHint:
      "Pas de teksten per sectie aan; zet een sectie uit om die in deze offerte te verbergen. Begin een regel met \"- \" voor een opsomming.",
    previewTitle: "Live voorbeeld",
  },
  crm: {
    stages: {
      new: "Nieuw",
      qualifying: "Kwalificatie",
      meeting: "Adviesgesprek",
      proposal: "Offerte verstuurd",
      negotiation: "Onderhandeling",
      won: "Gewonnen",
      lost: "Verloren",
    },
    sources: { website: "Website", chatbot: "Chatbot", manual: "Handmatig" },
    add: "Toevoegen",
    edit: "Bewerken",
    cancel: "Annuleren",
    confirmDelete: "Definitief verwijderen?",
    notLinked: "Niet gekoppeld",
    contacts: {
      title: "Contacten",
      subtitle: "contacten in het CRM.",
      addBtn: "+ Nieuw contact",
      editTitle: "Contact bewerken",
      empty: "Nog geen contacten. Converteer een aanvraag of voeg handmatig een contact toe.",
      noResults: "Geen resultaten voor deze zoekopdracht.",
      searchPlaceholder: "Zoek op naam, e-mail, telefoon of bedrijf…",
      name: "Naam",
      position: "Functie",
      company: "Bedrijf",
      noCompany: "Geen bedrijf",
      source: "Bron",
      notes: "Notities",
      dealsCount: "deals",
    },
    companies: {
      title: "Bedrijven",
      subtitle: "bedrijven in het CRM.",
      addBtn: "+ Nieuw bedrijf",
      editTitle: "Bedrijf bewerken",
      empty: "Nog geen bedrijven toegevoegd.",
      searchPlaceholder: "Zoek op naam, branche of plaats…",
      name: "Bedrijfsnaam",
      industry: "Branche",
      website: "Website",
      city: "Plaats",
      size: "Omvang",
      notes: "Notities",
      contactsCount: "contacten",
      dealsCount: "deals",
    },
    deals: {
      title: "Deals",
      subtitle: "de verkooppijplijn van aanvraag tot opdracht.",
      addBtn: "+ Nieuwe deal",
      editTitle: "Deal bewerken",
      empty: "Nog geen deals in de pijplijn.",
      dealTitle: "Titel",
      contact: "Contact",
      stage: "Fase",
      amount: "Bedrag (€)",
      expectedClose: "Verwachte afronding",
      daysInStage: "dgn in fase",
      statuses: { open: "Open", won: "Gewonnen", lost: "Verloren" },
      lostReason: "Reden van verlies",
      pipelineValue: "Pijplijnwaarde",
      openDeals: "open deals",
    },
    activities: {
      title: "Taken en activiteiten",
      subtitle: "taken, afspraken en notities met deadlines.",
      addBtn: "+ Nieuwe activiteit",
      empty: "Nog geen activiteiten geregistreerd.",
      types: { call: "Telefoongesprek", meeting: "Afspraak", note: "Notitie", task: "Taak" },
      typeLabel: "Type",
      titleLabel: "Titel",
      details: "Details",
      dueAt: "Deadline",
      contact: "Contact",
      deal: "Deal",
      markDone: "Afronden",
      reopen: "Heropenen",
      doneAt: "Afgerond",
      overdue: "Verlopen",
      filterAll: "Alle",
      filterOpen: "Open",
      filterDone: "Afgerond",
    },
    reports: {
      title: "Rapporten",
      subtitle: "Inzicht in de pijplijn, conversie en resultaten.",
      pipelineByStage: "Pijplijn per fase",
      dealsSuffix: "deals",
      winRate: "Winratio",
      winRateHint: "gewonnen ÷ afgesloten deals",
      wonValue: "Gewonnen waarde",
      openValue: "Open pijplijnwaarde",
      avgDeal: "Gemiddelde dealwaarde",
      bySource: "Contacten per bron",
      monthly: "Nieuwe deals per maand",
      noData: "Nog geen gegevens — voeg deals toe of converteer aanvragen.",
    },
  },
  agent: {
    title: "Agent CRM",
    subtitle:
      "Uw AI-assistent bewaakt aanvragen, taken, deadlines en opvolging — en geeft concrete adviezen voor de volgende actie.",
    insightsTitle: "Meldingen en adviezen",
    insightsEmpty: "Alles is bijgewerkt — geen openstaande aandachtspunten.",
    severity: { high: "Urgent", medium: "Aandacht", low: "Info" },
    insights: {
      overdueTask: "Taak “{title}” is over de deadline ({date}). Rond af of plan opnieuw in.",
      dueSoon: "Taak “{title}” moet binnen 48 uur af ({date}).",
      staleDeal: "Deal “{title}” staat al {days} dagen in fase “{stage}” — plan een vervolgactie.",
      noNextStep: "Deal “{title}” heeft geen openstaande vervolgactie — plan een taak in.",
      newLead: "Aanvraag van {name} wacht al {days} dagen op opvolging.",
    },
    chatTitle: "Vraag het de agent",
    chatIntro: "Stel een vraag over uw klanten, taken of pijplijn — de agent kijkt live mee in het CRM.",
    chatPlaceholder: "Bijv.: welke aanvragen moet ik deze week opvolgen?",
    send: "Versturen",
    thinking: "De agent denkt na…",
    aiNotConfigured:
      "De AI-koppeling (OPENROUTER_API_KEY) is nog niet ingesteld — de chat werkt zodra die actief is.",
    contextNote: "De agent gebruikt live CRM-gegevens (aanvragen, deals en taken) als context.",
  },
  channels: {
    title: "Kanalen en koppelingen",
    subtitle: "Alle kanalen waar klanten binnenkomen — actief, instelbaar of gepland.",
    statuses: { active: "Actief", configurable: "Instelbaar", planned: "Binnenkort" },
    envHint: "Configuratie loopt via omgevingsvariabelen (.env.local of Vercel).",
    plannedHint: "Deze koppeling staat op de roadmap en verschijnt hier zodra die actief is.",
    items: {
      website: {
        name: "Websiteformulier",
        desc: "Adviesaanvragen via het formulier op de website komen direct binnen bij Aanvragen.",
      },
      widget: {
        name: "Chatbot en widget",
        desc: "De RAG-chatbot beantwoordt vragen op de site en registreert aanvragen automatisch.",
      },
      telegram: {
        name: "Telegram",
        desc: "De chatbot draait ook als Telegram-bot via een webhook. Vereist TELEGRAM_BOT_TOKEN.",
      },
      instagram: {
        name: "Instagram",
        desc: "Directe berichten automatisch beantwoorden en als aanvraag registreren.",
      },
      whatsapp: {
        name: "WhatsApp Business",
        desc: "Gesprekken en aanvragen via WhatsApp koppelen aan het CRM.",
      },
      linkedin: {
        name: "LinkedIn",
        desc: "Leads uit LinkedIn-berichten en campagnes opvolgen in het CRM.",
      },
    },
  },
};

const en: AdminDict = {
  common: {
    panelTitle: "Admin panel Sana Archicons",
    logout: "Log out",
    save: "Save",
    saving: "Saving…",
    delete: "Delete",
    search: "Search",
    all: "All",
    done: "Done.",
    error: "Something went wrong.",
    loading: "Loading…",
    notConfigured: "The Supabase connection is not configured yet.",
    noData: "No data available.",
    unauthorized: "Unauthorized.",
  },
  tabs: {
    dashboard: "Dashboard",
    leads: "Requests",
    offers: "Quotes",
    knowledge: "Knowledge base",
    models: "Models",
    conversations: "Conversations",
    feedback: "Feedback",
    contacts: "Contacts",
    companies: "Companies",
    deals: "Deals",
    activities: "Tasks",
    reports: "Reports",
    assistant: "CRM Agent",
    channels: "Channels",
  },
  navGroups: { overview: "Overview", crm: "CRM", chatbot: "Chatbot", settings: "Settings" },
  login: {
    title: "Admin panel Sana Archicons",
    subtitle: "Log in to manage consultation requests and the chatbot.",
    password: "Password",
    submit: "Log in",
    submitting: "Logging in…",
  },
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview of chatbot performance across all channels.",
    conversations: "Conversations",
    users: "Unique users",
    messages: "Messages",
    chatbotLeads: "Chatbot requests",
    ofTotalLeads: "of all requests",
    conversionRate: "Conversion to request",
    conversionHint: "chatbot requests ÷ conversations",
    satisfaction: "Satisfaction",
    estCost: "Estimated cost",
    tokensHint: "tokens",
    gaps: "Answers without a source",
    gapsHint: "possible knowledge gaps",
    byChannel: "Conversations by channel",
    noConversations: "No conversations recorded yet.",
    modelUsage: "Token usage and cost per model",
    estimated: "costs are indicative",
    model: "Model",
    replies: "Replies",
    tokensIn: "Tokens in",
    tokensOut: "Tokens out",
    cost: "Cost",
    total: "Total",
    channels: { web: "Chat page", widget: "Widget" },
    crmTitle: "CRM overview",
    openDeals: "Open deals",
    pipelineValue: "Pipeline value",
    contactsTotal: "Contacts",
    openTasks: "Open tasks",
    overdueSuffix: "overdue",
    agentTitle: "CRM Agent — needs attention",
    agentEmpty: "Nothing needs attention — everything is up to date.",
    agentAll: "View all advice →",
  },
  leads: {
    title: "Consultation requests",
    subtitle: "requests in total.",
    exportCsv: "CSV export",
    searchPlaceholder: "Search by name, phone, company or description…",
    statuses: {
      new: "New",
      contacted: "Contacted",
      scheduled: "Meeting scheduled",
      won: "Won",
      lost: "Lost",
    },
    empty: "No requests yet.",
    noResults: "No results for this search/filter.",
    business: "Company",
    service: "Service",
    phone: "Phone",
    email: "Email",
    time: "Preferred time",
    message: "Description",
    submittedAt: "Submitted at",
    status: "Status",
    sourceChatbot: "via chatbot",
    services: {
      "bouwkundig-advies": "Building consultancy",
      energieadvies: "Energy advice / energy label",
      "ai-consultancy": "AI consultancy",
      procesautomatisering: "Process automation",
      anders: "Other",
    },
    times: { morning: "Morning", afternoon: "Afternoon", evening: "Evening" },
    convert: "Convert to CRM",
    converting: "Converting…",
    convertDone: "Request converted to a CRM contact and deal.",
  },
  knowledge: {
    title: "Knowledge base",
    subtitle: "documents the chatbot bases its answers on.",
    addTitle: "Add a new source",
    tabText: "Text",
    tabUrl: "Web address",
    tabFile: "File",
    docTitle: "Document title",
    docTitlePlaceholder: "E.g.: Sana Archicons services",
    text: "Text",
    textPlaceholder: "Paste the source text here…",
    tags: "Tags (optional, comma-separated)",
    tagsPlaceholder: "e.g.: services, rates",
    urlLabel: "Page address (URL)",
    urlTitleOptional: "Title (optional; page title otherwise)",
    filesLabel: "Files (md, txt, csv, json, yaml, html, pdf — max 10 MB each)",
    filesSelected: "file(s) selected.",
    addIndex: "Add and index",
    fetchIndex: "Fetch and index",
    uploadIndex: "Upload and index",
    processing: "Processing…",
    testTitle: "Test search",
    testPlaceholder: "Type a test question to see the retrieved fragments…",
    searchBtn: "Search",
    testEmpty: "No result above the similarity threshold.",
    similarity: "similarity",
    docs: "Documents",
    docsEmpty: "No documents added yet.",
    reindex: "Re-index",
    deleteConfirm: "Delete document:",
    chunks: "chunks",
    statuses: {
      pending: "Queued",
      processing: "Processing",
      ready: "Ready",
      error: "Error",
    },
  },
  models: {
    title: "Models & retrieval",
    subtitle: "All answer models run through OpenRouter; switching models is a single setting.",
    genTitle: "Answer model",
    activeModel: "Active model",
    current: "current",
    fallback: "Fallback model",
    none: "None",
    temperature: "Temperature",
    maxTokens: "Max tokens per answer",
    topP: "top_p",
    saveModel: "Save model settings",
    retrTitle: "Embedding & retrieval",
    embedInfoPrefix: "Current embedding model:",
    embedInfoSuffix:
      "Changing the embedding model or dimensions requires a full re-index of the knowledge base.",
    chunkSize: "Chunk size (tokens)",
    overlap: "Overlap (tokens)",
    topK: "top_k (number of sources)",
    threshold: "Similarity threshold",
    saveRetrieval: "Save retrieval settings",
  },
  conversations: {
    title: "Conversations",
    subtitle: "recent conversations. Click one to see the messages and retrieved sources.",
    empty: "No conversations recorded yet.",
    noMessages: "No messages.",
    retrievedSources: "Retrieved sources:",
    tokensOut: "tokens out",
    channels: { web: "Chat page", widget: "Widget" },
  },
  feedback: {
    title: "Feedback & unanswered questions",
    subtitle: "Where to improve: rejected answers and questions without a knowledge-base source.",
    negTitle: "Negative feedback 👎",
    negEmpty: "No negative feedback yet.",
    gapsTitle: "Unanswered questions",
    gapsSubtitle: "These questions had no source in the knowledge base — good candidates for a new document.",
    gapsEmpty: "No unanswered questions recorded.",
  },
  offers: {
    title: "Quotes",
    subtitle: "Compose a professional quote; the live preview on the right updates as you type.",
    docLanguageHint: "The quote document itself is always in Dutch.",
    print: "Print / PDF",
    word: "Download Word",
    reset: "New quote",
    resetConfirm: "Reset all fields to the default text?",
    metaTitle: "Quote details",
    offerNumber: "Quote number",
    date: "Date",
    validityDays: "Validity (days)",
    projectTitle: "Project title (subject)",
    clientTitle: "Client",
    clientCompany: "Company name",
    clientContact: "Contact person",
    clientEmail: "Email",
    clientPhone: "Phone",
    clientCity: "City",
    senderTitle: "Your details (sender)",
    senderContact: "Name",
    senderEmail: "Email",
    senderPhone: "Phone",
    senderWebsite: "Website",
    servicesTitle: "Services & pricing",
    serviceDescription: "Description",
    serviceAmount: "Amount (€, excl. VAT)",
    addService: "+ Add line",
    removeLine: "Remove",
    vatEnabled: "Calculate and show VAT (21%)",
    paymentTerms: "Payment terms",
    investmentNote: "Note under the investment table",
    phasesTitle: "Planning & phases",
    phasesEnabled: "Include the planning table in the quote",
    phaseName: "Work",
    phaseDuration: "Duration",
    addPhase: "+ Add phase",
    totalDuration: "Total lead time (sentence under the table)",
    sectionsTitle: "Text sections",
    sectionsHint:
      "Edit the text per section; untick a section to hide it in this quote. Start a line with \"- \" for a bullet list.",
    previewTitle: "Live preview",
  },
  crm: {
    stages: {
      new: "New",
      qualifying: "Qualifying",
      meeting: "Consultation",
      proposal: "Quote sent",
      negotiation: "Negotiation",
      won: "Won",
      lost: "Lost",
    },
    sources: { website: "Website", chatbot: "Chatbot", manual: "Manual" },
    add: "Add",
    edit: "Edit",
    cancel: "Cancel",
    confirmDelete: "Delete permanently?",
    notLinked: "Not linked",
    contacts: {
      title: "Contacts",
      subtitle: "contacts in the CRM.",
      addBtn: "+ New contact",
      editTitle: "Edit contact",
      empty: "No contacts yet. Convert a request or add a contact manually.",
      noResults: "No results for this search.",
      searchPlaceholder: "Search by name, email, phone or company…",
      name: "Name",
      position: "Position",
      company: "Company",
      noCompany: "No company",
      source: "Source",
      notes: "Notes",
      dealsCount: "deals",
    },
    companies: {
      title: "Companies",
      subtitle: "companies in the CRM.",
      addBtn: "+ New company",
      editTitle: "Edit company",
      empty: "No companies added yet.",
      searchPlaceholder: "Search by name, industry or city…",
      name: "Company name",
      industry: "Industry",
      website: "Website",
      city: "City",
      size: "Size",
      notes: "Notes",
      contactsCount: "contacts",
      dealsCount: "deals",
    },
    deals: {
      title: "Deals",
      subtitle: "the sales pipeline from request to project.",
      addBtn: "+ New deal",
      editTitle: "Edit deal",
      empty: "No deals in the pipeline yet.",
      dealTitle: "Title",
      contact: "Contact",
      stage: "Stage",
      amount: "Amount (€)",
      expectedClose: "Expected close",
      daysInStage: "days in stage",
      statuses: { open: "Open", won: "Won", lost: "Lost" },
      lostReason: "Lost reason",
      pipelineValue: "Pipeline value",
      openDeals: "open deals",
    },
    activities: {
      title: "Tasks & activities",
      subtitle: "tasks, appointments and notes with deadlines.",
      addBtn: "+ New activity",
      empty: "No activities recorded yet.",
      types: { call: "Phone call", meeting: "Meeting", note: "Note", task: "Task" },
      typeLabel: "Type",
      titleLabel: "Title",
      details: "Details",
      dueAt: "Deadline",
      contact: "Contact",
      deal: "Deal",
      markDone: "Mark done",
      reopen: "Reopen",
      doneAt: "Done",
      overdue: "Overdue",
      filterAll: "All",
      filterOpen: "Open",
      filterDone: "Done",
    },
    reports: {
      title: "Reports",
      subtitle: "Insight into the pipeline, conversion and results.",
      pipelineByStage: "Pipeline by stage",
      dealsSuffix: "deals",
      winRate: "Win rate",
      winRateHint: "won ÷ closed deals",
      wonValue: "Won value",
      openValue: "Open pipeline value",
      avgDeal: "Average deal value",
      bySource: "Contacts by source",
      monthly: "New deals per month",
      noData: "No data yet — add deals or convert requests.",
    },
  },
  agent: {
    title: "CRM Agent",
    subtitle:
      "Your AI assistant watches requests, tasks, deadlines and follow-ups — and gives concrete advice on the next action.",
    insightsTitle: "Notifications & advice",
    insightsEmpty: "Everything is up to date — nothing needs attention.",
    severity: { high: "Urgent", medium: "Attention", low: "Info" },
    insights: {
      overdueTask: "Task “{title}” is past its deadline ({date}). Finish it or reschedule.",
      dueSoon: "Task “{title}” is due within 48 hours ({date}).",
      staleDeal: "Deal “{title}” has been in stage “{stage}” for {days} days — plan a follow-up.",
      noNextStep: "Deal “{title}” has no open next step — schedule a task.",
      newLead: "Request from {name} has been waiting {days} days for follow-up.",
    },
    chatTitle: "Ask the agent",
    chatIntro: "Ask about your customers, tasks or pipeline — the agent looks at the live CRM data.",
    chatPlaceholder: "E.g.: which requests should I follow up this week?",
    send: "Send",
    thinking: "The agent is thinking…",
    aiNotConfigured:
      "The AI connection (OPENROUTER_API_KEY) is not configured yet — chat works once it is active.",
    contextNote: "The agent uses live CRM data (requests, deals and tasks) as context.",
  },
  channels: {
    title: "Channels & integrations",
    subtitle: "All channels where customers come in — active, configurable or planned.",
    statuses: { active: "Active", configurable: "Configurable", planned: "Coming soon" },
    envHint: "Configuration is done via environment variables (.env.local or Vercel).",
    plannedHint: "This integration is on the roadmap and will appear here once active.",
    items: {
      website: {
        name: "Website form",
        desc: "Consultation requests from the website form arrive directly under Requests.",
      },
      widget: {
        name: "Chatbot & widget",
        desc: "The RAG chatbot answers questions on the site and records requests automatically.",
      },
      telegram: {
        name: "Telegram",
        desc: "The chatbot also runs as a Telegram bot via a webhook. Requires TELEGRAM_BOT_TOKEN.",
      },
      instagram: {
        name: "Instagram",
        desc: "Answer direct messages automatically and record them as requests.",
      },
      whatsapp: {
        name: "WhatsApp Business",
        desc: "Connect WhatsApp conversations and requests to the CRM.",
      },
      linkedin: {
        name: "LinkedIn",
        desc: "Follow up leads from LinkedIn messages and campaigns in the CRM.",
      },
    },
  },
};

const fa: AdminDict = {
  common: {
    panelTitle: "پنل مدیریت سانا آرکیکانز",
    logout: "خروج",
    save: "ذخیره",
    saving: "در حال ذخیره…",
    delete: "حذف",
    search: "جستجو",
    all: "همه",
    done: "انجام شد.",
    error: "خطایی رخ داد.",
    loading: "در حال بارگذاری…",
    notConfigured: "اتصال Supabase هنوز تنظیم نشده است.",
    noData: "داده‌ای در دسترس نیست.",
    unauthorized: "دسترسی غیرمجاز.",
  },
  tabs: {
    dashboard: "داشبورد",
    leads: "درخواست‌ها",
    offers: "پیشنهادها",
    knowledge: "پایگاه دانش",
    models: "مدل‌ها",
    conversations: "گفتگوها",
    feedback: "بازخورد",
    contacts: "مخاطبان",
    companies: "شرکت‌ها",
    deals: "معاملات",
    activities: "وظایف",
    reports: "گزارش‌ها",
    assistant: "ایجنت CRM",
    channels: "کانال‌ها",
  },
  navGroups: { overview: "نمای کلی", crm: "CRM", chatbot: "چت‌بات", settings: "تنظیمات" },
  login: {
    title: "پنل مدیریت سانا آرکیکانز",
    subtitle: "برای مدیریت درخواست‌های مشاوره و چت‌بات وارد شوید.",
    password: "رمز عبور",
    submit: "ورود",
    submitting: "در حال ورود…",
  },
  dashboard: {
    title: "داشبورد",
    subtitle: "نمای کلی عملکرد چت‌بات در همه‌ی کانال‌ها.",
    conversations: "گفتگوها",
    users: "کاربران یکتا",
    messages: "پیام‌ها",
    chatbotLeads: "درخواست‌های چت‌بات",
    ofTotalLeads: "از کل درخواست‌ها",
    conversionRate: "نرخ تبدیل به درخواست",
    conversionHint: "درخواست چت‌بات ÷ گفتگوها",
    satisfaction: "نرخ رضایت",
    estCost: "هزینه‌ی تخمینی",
    tokensHint: "توکن",
    gaps: "پاسخ‌های بدون منبع",
    gapsHint: "شکاف‌های احتمالی دانش",
    byChannel: "گفتگوها به تفکیک کانال",
    noConversations: "هنوز گفتگویی ثبت نشده است.",
    modelUsage: "مصرف توکن و هزینه به‌تفکیک مدل",
    estimated: "هزینه تخمینی است",
    model: "مدل",
    replies: "پاسخ‌ها",
    tokensIn: "توکن ورودی",
    tokensOut: "توکن خروجی",
    cost: "هزینه",
    total: "مجموع",
    channels: { web: "صفحه‌ی چت", widget: "ویجت" },
    crmTitle: "نمای کلی CRM",
    openDeals: "معاملات باز",
    pipelineValue: "ارزش پایپ‌لاین",
    contactsTotal: "مخاطبان",
    openTasks: "وظایف باز",
    overdueSuffix: "معوق",
    agentTitle: "ایجنت CRM — نیازمند توجه",
    agentEmpty: "همه‌چیز به‌روز است — موردی برای پیگیری نیست.",
    agentAll: "مشاهده‌ی همه‌ی توصیه‌ها ←",
  },
  leads: {
    title: "درخواست‌های مشاوره",
    subtitle: "درخواست ثبت شده است.",
    exportCsv: "خروجی CSV",
    searchPlaceholder: "جستجو در نام، تلفن، شرکت یا توضیح…",
    statuses: {
      new: "جدید",
      contacted: "تماس گرفته شد",
      scheduled: "جلسه تنظیم شد",
      won: "مشتری شد",
      lost: "منصرف",
    },
    empty: "هنوز درخواستی ثبت نشده است.",
    noResults: "نتیجه‌ای برای این جستجو/فیلتر یافت نشد.",
    business: "شرکت",
    service: "خدمت",
    phone: "تلفن",
    email: "ایمیل",
    time: "زمان مناسب تماس",
    message: "توضیح",
    submittedAt: "ثبت شده در",
    status: "وضعیت",
    sourceChatbot: "از طریق چت‌بات",
    services: {
      "bouwkundig-advies": "مشاوره‌ی ساختمانی",
      energieadvies: "مشاوره‌ی انرژی / برچسب انرژی",
      "ai-consultancy": "مشاوره‌ی هوش مصنوعی",
      procesautomatisering: "اتوماسیون فرایندها",
      anders: "سایر",
    },
    times: { morning: "صبح", afternoon: "بعدازظهر", evening: "عصر" },
    convert: "تبدیل به CRM",
    converting: "در حال تبدیل…",
    convertDone: "درخواست به مخاطب و معامله در CRM تبدیل شد.",
  },
  knowledge: {
    title: "پایگاه دانش",
    subtitle: "سندی که چت‌بات پاسخ‌هایش را بر پایه‌ی آن‌ها می‌دهد.",
    addTitle: "افزودن منبع جدید",
    tabText: "متن",
    tabUrl: "آدرس وب",
    tabFile: "فایل",
    docTitle: "عنوان سند",
    docTitlePlaceholder: "مثلاً: خدمات سانا آرکیکانز",
    text: "متن",
    textPlaceholder: "متن منبع را اینجا بچسبانید…",
    tags: "برچسب‌ها (اختیاری، با ویرگول جدا کنید)",
    tagsPlaceholder: "مثلاً: خدمات، قیمت",
    urlLabel: "آدرس صفحه (URL)",
    urlTitleOptional: "عنوان (اختیاری؛ در غیر این صورت عنوان صفحه)",
    filesLabel: "فایل‌ها (md، txt، csv، json، yaml، html، pdf — حداکثر ۱۰ مگابایت)",
    filesSelected: "فایل انتخاب شد.",
    addIndex: "افزودن و ایندکس",
    fetchIndex: "دریافت و ایندکس",
    uploadIndex: "آپلود و ایندکس",
    processing: "در حال پردازش…",
    testTitle: "جست‌وجوی آزمایشی",
    testPlaceholder: "یک سؤال آزمایشی بنویسید تا قطعه‌های بازیابی‌شده را ببینید…",
    searchBtn: "جستجو",
    testEmpty: "نتیجه‌ای بالای آستانه‌ی شباهت یافت نشد.",
    similarity: "شباهت",
    docs: "اسناد",
    docsEmpty: "هنوز سندی اضافه نشده است.",
    reindex: "بازسازی",
    deleteConfirm: "حذف سند:",
    chunks: "قطعه",
    statuses: {
      pending: "در صف",
      processing: "در حال پردازش",
      ready: "آماده",
      error: "خطا",
    },
  },
  models: {
    title: "مدل‌ها و بازیابی",
    subtitle: "همه‌ی مدل‌های پاسخ از طریق OpenRouter فراخوانی می‌شوند؛ تعویض مدل فقط یک تنظیم است.",
    genTitle: "مدل تولید پاسخ",
    activeModel: "مدل فعال",
    current: "فعلی",
    fallback: "مدل جایگزین (fallback)",
    none: "بدون",
    temperature: "Temperature",
    maxTokens: "حداکثر توکن پاسخ",
    topP: "top_p",
    saveModel: "ذخیره‌ی تنظیمات مدل",
    retrTitle: "Embedding و بازیابی",
    embedInfoPrefix: "مدل embedding فعلی:",
    embedInfoSuffix: "تغییر مدل embedding یا ابعاد، نیاز به بازسازی کامل ایندکس پایگاه دانش دارد.",
    chunkSize: "اندازه‌ی قطعه (توکن)",
    overlap: "همپوشانی (توکن)",
    topK: "top_k (تعداد منبع)",
    threshold: "آستانه‌ی شباهت",
    saveRetrieval: "ذخیره‌ی تنظیمات بازیابی",
  },
  conversations: {
    title: "گفتگوها",
    subtitle: "گفتگوی اخیر. روی هر کدام بزنید تا پیام‌ها و منابع بازیابی‌شده را ببینید.",
    empty: "هنوز گفتگویی ثبت نشده است.",
    noMessages: "پیامی ثبت نشده است.",
    retrievedSources: "منابع بازیابی‌شده:",
    tokensOut: "توکن خروجی",
    channels: { web: "صفحه‌ی چت", widget: "ویجت" },
  },
  feedback: {
    title: "بازخورد و سؤالات بی‌جواب",
    subtitle: "جای بهبود: پاسخ‌هایی که کاربر نپسندیده و سؤالاتی که منبعی در پایگاه دانش نداشتند.",
    negTitle: "بازخوردهای منفی 👎",
    negEmpty: "هنوز بازخورد منفی‌ای ثبت نشده است.",
    gapsTitle: "سؤالات بی‌جواب",
    gapsSubtitle: "این سؤالات منبعی در پایگاه دانش نداشتند — کاندیدای خوبی برای افزودن سند جدیدند.",
    gapsEmpty: "سؤال بی‌جوابی ثبت نشده است.",
  },
  offers: {
    title: "پیشنهادها (Offertes)",
    subtitle: "یک پیشنهاد قیمت حرفه‌ای بسازید؛ پیش‌نمایش زنده در سمت دیگر بلافاصله به‌روز می‌شود.",
    docLanguageHint: "خود سند پیشنهاد همیشه به زبان هلندی است.",
    print: "چاپ / PDF",
    word: "دانلود Word",
    reset: "پیشنهاد جدید",
    resetConfirm: "همه‌ی فیلدها به متن پیش‌فرض بازگردند؟",
    metaTitle: "مشخصات پیشنهاد",
    offerNumber: "شماره‌ی پیشنهاد",
    date: "تاریخ",
    validityDays: "اعتبار (روز)",
    projectTitle: "عنوان پروژه (موضوع)",
    clientTitle: "کارفرما (مشتری)",
    clientCompany: "نام شرکت",
    clientContact: "شخص رابط",
    clientEmail: "ایمیل",
    clientPhone: "تلفن",
    clientCity: "شهر",
    senderTitle: "مشخصات شما (فرستنده)",
    senderContact: "نام",
    senderEmail: "ایمیل",
    senderPhone: "تلفن",
    senderWebsite: "وب‌سایت",
    servicesTitle: "خدمات و قیمت‌ها",
    serviceDescription: "شرح",
    serviceAmount: "مبلغ (یورو، بدون مالیات)",
    addService: "+ افزودن ردیف",
    removeLine: "حذف",
    vatEnabled: "محاسبه و نمایش مالیات بر ارزش افزوده (۲۱٪)",
    paymentTerms: "شرایط پرداخت",
    investmentNote: "توضیح زیر جدول سرمایه‌گذاری",
    phasesTitle: "برنامه‌ریزی و مراحل",
    phasesEnabled: "جدول برنامه‌ریزی در پیشنهاد گنجانده شود",
    phaseName: "شرح کار",
    phaseDuration: "مدت",
    addPhase: "+ افزودن مرحله",
    totalDuration: "مدت کل (جمله‌ی زیر جدول)",
    sectionsTitle: "بخش‌های متنی",
    sectionsHint:
      "متن هر بخش را ویرایش کنید؛ برای پنهان کردن یک بخش در این پیشنهاد، تیک آن را بردارید. برای فهرست، خط را با «- » شروع کنید.",
    previewTitle: "پیش‌نمایش زنده",
  },
  crm: {
    stages: {
      new: "جدید",
      qualifying: "در حال بررسی",
      meeting: "جلسه‌ی مشاوره",
      proposal: "پیشنهاد ارسال شد",
      negotiation: "مذاکره",
      won: "موفق",
      lost: "ناموفق",
    },
    sources: { website: "وب‌سایت", chatbot: "چت‌بات", manual: "دستی" },
    add: "افزودن",
    edit: "ویرایش",
    cancel: "انصراف",
    confirmDelete: "برای همیشه حذف شود؟",
    notLinked: "بدون اتصال",
    contacts: {
      title: "مخاطبان",
      subtitle: "مخاطب در CRM.",
      addBtn: "+ مخاطب جدید",
      editTitle: "ویرایش مخاطب",
      empty: "هنوز مخاطبی ثبت نشده است. یک درخواست را تبدیل کنید یا مخاطب را دستی اضافه کنید.",
      noResults: "نتیجه‌ای برای این جستجو یافت نشد.",
      searchPlaceholder: "جستجو در نام، ایمیل، تلفن یا شرکت…",
      name: "نام",
      position: "سمت",
      company: "شرکت",
      noCompany: "بدون شرکت",
      source: "منبع",
      notes: "یادداشت‌ها",
      dealsCount: "معامله",
    },
    companies: {
      title: "شرکت‌ها",
      subtitle: "شرکت در CRM.",
      addBtn: "+ شرکت جدید",
      editTitle: "ویرایش شرکت",
      empty: "هنوز شرکتی اضافه نشده است.",
      searchPlaceholder: "جستجو در نام، صنعت یا شهر…",
      name: "نام شرکت",
      industry: "صنعت",
      website: "وب‌سایت",
      city: "شهر",
      size: "اندازه",
      notes: "یادداشت‌ها",
      contactsCount: "مخاطب",
      dealsCount: "معامله",
    },
    deals: {
      title: "معاملات",
      subtitle: "پایپ‌لاین فروش از درخواست تا پروژه.",
      addBtn: "+ معامله‌ی جدید",
      editTitle: "ویرایش معامله",
      empty: "هنوز معامله‌ای در پایپ‌لاین نیست.",
      dealTitle: "عنوان",
      contact: "مخاطب",
      stage: "مرحله",
      amount: "مبلغ (یورو)",
      expectedClose: "تاریخ بستن مورد انتظار",
      daysInStage: "روز در این مرحله",
      statuses: { open: "باز", won: "موفق", lost: "ناموفق" },
      lostReason: "دلیل شکست",
      pipelineValue: "ارزش پایپ‌لاین",
      openDeals: "معامله‌ی باز",
    },
    activities: {
      title: "وظایف و فعالیت‌ها",
      subtitle: "وظایف، جلسات و یادداشت‌ها با مهلت انجام.",
      addBtn: "+ فعالیت جدید",
      empty: "هنوز فعالیتی ثبت نشده است.",
      types: { call: "تماس تلفنی", meeting: "جلسه", note: "یادداشت", task: "وظیفه" },
      typeLabel: "نوع",
      titleLabel: "عنوان",
      details: "جزئیات",
      dueAt: "مهلت انجام",
      contact: "مخاطب",
      deal: "معامله",
      markDone: "انجام شد",
      reopen: "بازکردن دوباره",
      doneAt: "انجام‌شده",
      overdue: "معوق",
      filterAll: "همه",
      filterOpen: "باز",
      filterDone: "انجام‌شده",
    },
    reports: {
      title: "گزارش‌ها",
      subtitle: "دید کامل از پایپ‌لاین، نرخ تبدیل و نتایج.",
      pipelineByStage: "پایپ‌لاین به تفکیک مرحله",
      dealsSuffix: "معامله",
      winRate: "نرخ موفقیت",
      winRateHint: "موفق ÷ معاملات بسته‌شده",
      wonValue: "ارزش معاملات موفق",
      openValue: "ارزش پایپ‌لاین باز",
      avgDeal: "میانگین ارزش معامله",
      bySource: "مخاطبان به تفکیک منبع",
      monthly: "معاملات جدید در هر ماه",
      noData: "هنوز داده‌ای نیست — معامله اضافه کنید یا درخواست‌ها را تبدیل کنید.",
    },
  },
  agent: {
    title: "ایجنت CRM",
    subtitle:
      "دستیار هوش مصنوعی شما درخواست‌ها، وظایف، مهلت‌ها و پیگیری‌ها را زیر نظر دارد و برای اقدام بعدی توصیه‌ی مشخص می‌دهد.",
    insightsTitle: "اعلان‌ها و توصیه‌ها",
    insightsEmpty: "همه‌چیز به‌روز است — موردی برای پیگیری نیست.",
    severity: { high: "فوری", medium: "نیازمند توجه", low: "اطلاع" },
    insights: {
      overdueTask: "وظیفه‌ی «{title}» از مهلت گذشته است ({date}). آن را انجام دهید یا زمان‌بندی دوباره کنید.",
      dueSoon: "وظیفه‌ی «{title}» باید تا ۴۸ ساعت آینده انجام شود ({date}).",
      staleDeal: "معامله‌ی «{title}» {days} روز است در مرحله‌ی «{stage}» مانده — یک پیگیری برنامه‌ریزی کنید.",
      noNextStep: "معامله‌ی «{title}» اقدام بعدیِ باز ندارد — یک وظیفه تعریف کنید.",
      newLead: "درخواست {name} از {days} روز پیش منتظر پیگیری است.",
    },
    chatTitle: "از ایجنت بپرسید",
    chatIntro: "درباره‌ی مشتریان، وظایف یا پایپ‌لاین بپرسید — ایجنت داده‌های زنده‌ی CRM را می‌بیند.",
    chatPlaceholder: "مثلاً: این هفته کدام درخواست‌ها را باید پیگیری کنم؟",
    send: "ارسال",
    thinking: "ایجنت در حال فکر کردن است…",
    aiNotConfigured:
      "اتصال هوش مصنوعی (OPENROUTER_API_KEY) هنوز تنظیم نشده است — چت پس از فعال‌سازی کار می‌کند.",
    contextNote: "ایجنت از داده‌های زنده‌ی CRM (درخواست‌ها، معاملات و وظایف) به‌عنوان زمینه استفاده می‌کند.",
  },
  channels: {
    title: "کانال‌ها و اتصال‌ها",
    subtitle: "همه‌ی کانال‌های ورودی مشتری — فعال، قابل‌تنظیم یا در برنامه.",
    statuses: { active: "فعال", configurable: "قابل تنظیم", planned: "به‌زودی" },
    envHint: "پیکربندی از طریق متغیرهای محیطی (.env.local یا Vercel) انجام می‌شود.",
    plannedHint: "این اتصال در نقشه‌ی راه است و پس از فعال‌سازی اینجا نمایش داده می‌شود.",
    items: {
      website: {
        name: "فرم وب‌سایت",
        desc: "درخواست‌های مشاوره از فرم وب‌سایت مستقیماً در بخش درخواست‌ها ثبت می‌شوند.",
      },
      widget: {
        name: "چت‌بات و ویجت",
        desc: "چت‌بات RAG پرسش‌ها را در سایت پاسخ می‌دهد و درخواست‌ها را خودکار ثبت می‌کند.",
      },
      telegram: {
        name: "تلگرام",
        desc: "چت‌بات از طریق وب‌هوک به‌صورت بات تلگرام هم کار می‌کند. نیازمند TELEGRAM_BOT_TOKEN.",
      },
      instagram: {
        name: "اینستاگرام",
        desc: "پاسخ خودکار به پیام‌های مستقیم و ثبت آن‌ها به‌عنوان درخواست.",
      },
      whatsapp: {
        name: "واتس‌اپ بیزینس",
        desc: "اتصال گفتگوها و درخواست‌های واتس‌اپ به CRM.",
      },
      linkedin: {
        name: "لینکدین",
        desc: "پیگیری لیدهای پیام‌ها و کمپین‌های لینکدین در CRM.",
      },
    },
  },
};

export const ADMIN_DICTS: Record<AdminLang, AdminDict> = { nl, en, fa };

export function getDict(lang: AdminLang): AdminDict {
  return ADMIN_DICTS[lang] ?? ADMIN_DICTS.nl;
}

export function normalizeLang(value?: string | null): AdminLang {
  return value === "fa" || value === "en" || value === "nl" ? value : "nl";
}
