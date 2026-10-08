// Questionnaire definition. The keys here are what lib/steps.js reads.
const o = (value, en, es = en) => ({ value, en, es });

export const SECTIONS = [
  {
    key: "about",
    bg: "#FFF6D6",
    en: "1 · About you",
    es: "1 · Sobre ti",
    fields: [
      { name: "artist_name", type: "text", required: true, en: "Artist name", es: "Nombre artístico" },
      { name: "legal_name", type: "text", en: "Legal name (for registrations)", es: "Nombre legal (para los registros)" },
      { name: "email", type: "email", required: true, en: "Email", es: "Correo" },
      { name: "phone", type: "tel", en: "Phone or WhatsApp", es: "Teléfono o WhatsApp" },
      { name: "city", type: "text", en: "City and country", es: "Ciudad y país" },
      { name: "preferred_lang", type: "select", en: "Preferred language", es: "Idioma preferido", options: [o("en", "English", "Inglés"), o("es", "Spanish", "Español")] },
    ],
  },
  {
    key: "music",
    bg: "#E3F1F8",
    en: "2 · Your music",
    es: "2 · Tu música",
    fields: [
      { name: "genre", type: "text", en: "Genre", es: "Género" },
      {
        name: "released", type: "select", en: "Songs released so far", es: "Canciones publicadas hasta ahora",
        options: [o("0", "None yet", "Ninguna todavía"), o("1-5", "1–5"), o("6-20", "6–20"), o("20+", "More than 20", "Más de 20")],
      },
      { name: "spotify", type: "url", en: "Spotify artist link", es: "Enlace de artista en Spotify" },
      { name: "instagram", type: "text", en: "Instagram", es: "Instagram" },
      { name: "tiktok", type: "text", en: "TikTok or YouTube", es: "TikTok o YouTube" },
      { name: "next_release", type: "date", en: "Next release date (if you have one)", es: "Fecha de tu próximo lanzamiento (si la tienes)" },
      { name: "single_title", type: "text", en: "Name of that song", es: "Nombre de esa canción" },
    ],
  },
  {
    key: "business",
    bg: "#FFFFFF",
    en: "3 · The business side",
    es: "3 · La parte de negocio",
    fields: [
      {
        name: "distributor", type: "select", en: "Distributor", es: "Distribuidora",
        options: [o("distrokid", "DistroKid"), o("cdbaby", "CD Baby"), o("tunecore", "TuneCore"), o("other", "Other", "Otra"), o("none", "I don't have one", "No tengo")],
      },
      {
        name: "pro", type: "radio", en: "Are you a member of a PRO (ASCAP, BMI or SESAC)?", es: "¿Estás afiliado a una PRO (ASCAP, BMI o SESAC)?",
        options: [o("ascap", "ASCAP"), o("bmi", "BMI"), o("sesac", "SESAC"), o("no", "No"), o("unsure", "Not sure", "No estoy seguro")],
      },
      {
        name: "have_setup", type: "checkbox", en: "Which of these are already set up? Leave blank if you're not sure.", es: "¿Cuáles de estos ya tienes? Déjalos en blanco si no estás seguro.",
        options: [o("mlc", "The MLC"), o("soundexchange", "SoundExchange"), o("copyright", "U.S. Copyright Office", "Copyright Office (EE. UU.)"), o("spotify_artists", "Spotify for Artists"), o("apple_artists", "Apple Music for Artists")],
      },
      {
        name: "cowrite", type: "radio", en: "Do you write with other people?", es: "¿Compones con otras personas?",
        options: [o("solo", "Always solo", "Siempre solo"), o("cowriters", "Sometimes with co-writers", "A veces con coautores"), o("producer", "With a producer who co-writes", "Con un productor que también compone")],
      },
    ],
  },
  {
    key: "brand",
    bg: "#FCE4EF",
    en: "4 · Your brand",
    es: "4 · Tu marca",
    fields: [
      { name: "three_words", type: "text", en: "Describe your music in three words", es: "Describe tu música en tres palabras" },
      { name: "sounds_like", type: "text", en: "Artists your fans also listen to", es: "Artistas que también escuchan tus fans" },
      {
        name: "brand_have", type: "checkbox", en: "What do you already have?", es: "¿Qué tienes ya?",
        options: [o("photos", "Professional photos", "Fotos profesionales"), o("bio", "Artist bio", "Biografía"), o("epk", "EPK"), o("logo", "Logo or visual identity", "Logo o identidad visual"), o("website", "Website", "Página web")],
      },
    ],
  },
  {
    key: "goals",
    bg: "#E4EAF7",
    en: "5 · Goals",
    es: "5 · Objetivos",
    fields: [
      {
        name: "help_with", type: "checkbox", en: "What would you like help with?", es: "¿En qué te gustaría que te ayudemos?",
        options: [o("Launchpad", "Launchpad · registrations", "Launchpad · registros"), o("Liftoff", "Liftoff · brand", "Liftoff · marca"), o("Spark", "Spark · campaign", "Spark · campaña"), o("Orbit", "Orbit · monthly support", "Orbit · acompañamiento mensual"), o("unsure", "Not sure yet", "Aún no lo sé")],
      },
      { name: "goal", type: "textarea", en: "Your main goal for the next 6 months", es: "Tu objetivo principal para los próximos 6 meses" },
      { name: "heard", type: "text", en: "How did you hear about us?", es: "¿Cómo nos conociste?" },
    ],
  },
];

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

// Read a submitted form into a plain answers object.
export function readAnswers(formData) {
  const out = {};
  for (const f of ALL_FIELDS) {
    if (f.type === "checkbox") out[f.name] = formData.getAll(f.name).map(String).slice(0, 10);
    else out[f.name] = String(formData.get(f.name) ?? "").trim().slice(0, 2000);
  }
  return out;
}

// Human-readable value of an answer, for the admin view.
export function answerLabel(field, value, lang = "en") {
  if (!field.options) return Array.isArray(value) ? value.join(", ") : value || "—";
  const label = (v) => field.options.find((op) => op.value === v)?.[lang] ?? v;
  if (Array.isArray(value)) return value.length ? value.map(label).join(", ") : "—";
  return value ? label(value) : "—";
}
