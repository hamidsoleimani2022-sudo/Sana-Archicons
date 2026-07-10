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
    knowledge: string;
    models: string;
    conversations: string;
    feedback: string;
  };
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
};

const nl: AdminDict = {
  common: {
    panelTitle: "Beheerpanel",
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
    knowledge: "Kennisbank",
    models: "Modellen",
    conversations: "Gesprekken",
    feedback: "Feedback",
  },
  login: {
    title: "Beheerpanel",
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
};

const en: AdminDict = {
  common: {
    panelTitle: "Admin panel",
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
    knowledge: "Knowledge base",
    models: "Models",
    conversations: "Conversations",
    feedback: "Feedback",
  },
  login: {
    title: "Admin panel",
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
};

const fa: AdminDict = {
  common: {
    panelTitle: "پنل مدیریت",
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
    knowledge: "پایگاه دانش",
    models: "مدل‌ها",
    conversations: "گفتگوها",
    feedback: "بازخورد",
  },
  login: {
    title: "پنل مدیریت",
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
};

export const ADMIN_DICTS: Record<AdminLang, AdminDict> = { nl, en, fa };

export function getDict(lang: AdminLang): AdminDict {
  return ADMIN_DICTS[lang] ?? ADMIN_DICTS.nl;
}

export function normalizeLang(value?: string | null): AdminLang {
  return value === "fa" || value === "en" || value === "nl" ? value : "nl";
}
