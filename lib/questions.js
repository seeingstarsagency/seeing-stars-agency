// Two questionnaires:
// - FINDER: short public form on /questionnaire that recommends a package.
// - SECTIONS: the full Launchpad intake, filled in by the artist inside their dashboard.
//   Its keys are what lib/steps.js reads.
const o = (value, en, es = en) => ({ value, en, es });

// Answer sets used by many questions.
const YN = [o("yes", "Yes", "Sí"), o("no", "No")];
const YSN = [o("yes", "Yes", "Sí"), o("somewhat", "A little", "Un poco"), o("no", "No")];
const REG = [
  o("registered", "Yes, and my song is registered", "Sí, y mi canción ya está registrada"),
  o("know", "I know it, but my song isn't registered", "La conozco, pero mi canción no está registrada"),
  o("no", "I don't know it", "No la conozco"),
];

// Launchpad intake questionnaire.
export const SECTIONS = [
  {
    key: "about",
    bg: "#FFF6D6",
    en: "1 · About you",
    es: "1 · Sobre ti",
    fields: [
      { name: "legal_name", type: "text", required: true, en: "What is your full name?", es: "¿Cuál es tu nombre completo?" },
      { name: "artist_name", type: "text", required: true, en: "What is your artist name?", es: "¿Cuál es tu nombre artístico?" },
      { name: "phone", type: "tel", en: "Phone or WhatsApp", es: "Teléfono o WhatsApp" },
      { name: "city", type: "text", en: "City", es: "Ciudad" },
      { name: "state", type: "text", en: "State or province", es: "Estado o provincia" },
      { name: "country", type: "text", en: "Country", es: "País" },
    ],
  },
  {
    key: "song",
    bg: "#E3F1F8",
    en: "2 · Your song",
    es: "2 · Tu canción",
    fields: [
      { name: "single_title", type: "text", en: "Name of the song you're releasing", es: "Nombre de la canción que vas a lanzar" },
      { name: "next_release", type: "date", en: "Planned release date (if you have one)", es: "Fecha de lanzamiento prevista (si la tienes)" },
      { name: "first_release", type: "radio", options: YN, en: "Is this your first time releasing music?", es: "¿Es tu primera vez lanzando música?" },
      { name: "other_songs", type: "radio", options: YN, en: "Do you have other songs under the same artist name?", es: "¿Tienes otras canciones bajo el mismo nombre artístico?" },
      {
        name: "materials_ready", type: "checkbox",
        en: "Do you have the final master, the lyrics and the full list of credits? Check what's ready.",
        es: "¿Tienes el máster final, las letras y la lista completa de créditos? Marca lo que está listo.",
        options: [o("master", "Final master", "Máster final"), o("lyrics", "Lyrics", "Letras"), o("credits", "Full list of credits", "Lista completa de créditos")],
      },
      { name: "materials_notes", type: "textarea", en: "What's still missing?", es: "¿Qué falta?" },
      {
        name: "authorship", type: "radio", en: "Are you the only author of your song, or did you co-write it with other people?", es: "¿Eres el único autor de tu canción? ¿O la has coescrito con otras personas?",
        options: [o("solo", "I'm the only author", "Soy el único autor"), o("cowritten", "I co-wrote it with other people", "La coescribí con otras personas")],
      },
      {
        name: "master_owner", type: "radio", en: "Who owns the master of the song?", es: "¿Quién es el propietario del máster de la canción?",
        options: [o("me", "I do", "Yo"), o("shared", "Me and other people", "Yo y otras personas"), o("producer", "The producer", "El productor"), o("label", "A label", "Un sello discográfico"), o("unsure", "I'm not sure", "No estoy seguro")],
      },
    ],
  },
  {
    key: "rights",
    bg: "#FFFFFF",
    en: "3 · Rights and registrations",
    es: "3 · Derechos y registros",
    fields: [
      { name: "copyright", type: "radio", options: REG, en: "Do you know how to register your songs for copyright in the United States? Is your song already registered?", es: "¿Conoces cómo registrar tus canciones en los Estados Unidos bajo copyright? ¿Tu canción ya está registrada en esta entidad?" },
      {
        name: "copyright_ack", type: "radio", required: true,
        note: {
          en: "This service includes help registering the composition of the song (lyrics and melody). Registering the sound recording or master is done separately with an attorney who specializes in the music industry.",
          es: "Este servicio incluye asistencia para el registro de la composición de la canción (letra y melodía). El registro de la grabación o del máster se realiza por separado con un abogado especializado en la industria musical.",
        },
        en: "Do you understand that the registration included in this service covers only the composition (lyrics and melody) and not the master of the song?",
        es: "¿Entiendes que el registro incluido en este servicio corresponde únicamente a la composición (letra y melodía) y no al máster de la canción?",
        options: [o("yes", "Yes, I understand", "Sí, lo entiendo"), o("questions", "I have questions", "Tengo preguntas")],
      },
      { name: "mlc", type: "radio", options: REG, en: "Do you know the Mechanical Licensing Collective (The MLC)? Is your song already registered there?", es: "¿Conoces el Mechanical Licensing Collective (The MLC)? ¿Tu canción ya está registrada en esta entidad?" },
      { name: "soundexchange", type: "radio", options: REG, en: "Do you know SoundExchange? Is your song already registered there?", es: "¿Conoces SoundExchange? ¿Tu canción ya está registrada en esta entidad?" },
      { name: "pro", type: "radio", options: REG, en: "Do you know the performing rights organizations (PROs) such as ASCAP, BMI or SESAC? Is your song already registered with one?", es: "¿Conoces las organizaciones de derechos de autor (PRO) como ASCAP, BMI o SESAC? ¿Tu canción ya está registrada en esta entidad?" },
      {
        name: "pro_choice", type: "radio", en: "Have you decided which performing rights organization you want to join?", es: "¿Has tomado una decisión sobre a qué organización de derechos de autor quieres pertenecer?",
        options: [o("ascap", "ASCAP"), o("bmi", "BMI"), o("sesac", "SESAC"), o("undecided", "Not yet", "Todavía no")],
      },
    ],
  },
  {
    key: "release",
    bg: "#FCE4EF",
    en: "4 · Distribution and Spotify",
    es: "4 · Distribución y Spotify",
    fields: [
      { name: "distribution_know", type: "radio", options: YSN, en: "Do you know how to distribute music as an independent artist?", es: "¿Conoces cómo distribuir música como artista independiente?" },
      { name: "distributors_know", type: "radio", options: YSN, en: "Do you know independent music distributors?", es: "¿Conoces distribuidoras de música independiente?" },
      {
        name: "distributor", type: "radio", en: "Do you know which independent distributor you want to work with?", es: "¿Sabes de qué distribuidora de música independiente quieres formar parte?",
        options: [o("distrokid", "DistroKid"), o("cdbaby", "CD Baby"), o("tunecore", "TuneCore"), o("unitedmasters", "UnitedMasters"), o("amuse", "Amuse"), o("other", "Another one", "Otra"), o("undecided", "Not yet", "Todavía no")],
      },
      {
        name: "cover_art", type: "radio", en: "Is the single's cover art ready?", es: "¿Tienes lista la portada del sencillo?",
        options: [o("yes", "Yes", "Sí"), o("in_progress", "In progress", "En proceso"), o("no", "No")],
      },
      { name: "artist_links", type: "radio", options: YSN, en: "Do you know how to access your artist profiles on the streaming platforms (Spotify for Artists, Apple Music for Artists)?", es: "¿Sabes cómo acceder a tus enlaces de artista en las plataformas de streaming (Spotify for Artists, Apple Music for Artists)?" },
      { name: "pitch_what", type: "radio", options: YSN, en: "Do you know what a Spotify pitch is?", es: "¿Sabes qué es un pitch para Spotify?" },
      { name: "pitch_how", type: "radio", options: YSN, en: "Do you know how to send a pitch to Spotify?", es: "¿Conoces cómo enviar un pitch a Spotify?" },
      { name: "editorial", type: "radio", options: YSN, en: "Do you understand what Spotify's editorial playlists are?", es: "¿Entiendes qué son las playlists editoriales de Spotify?" },
    ],
  },
  {
    key: "social",
    bg: "#E4EAF7",
    en: "5 · Social media and promotion",
    es: "5 · Redes sociales y promoción",
    fields: [
      { name: "socials", type: "textarea", en: "Which social networks do you have artist profiles on? Share the links.", es: "¿En qué redes sociales tienes perfiles como artista? Comparte los enlaces." },
      {
        name: "socials_use", type: "radio", en: "Do you use your social media to promote yourself as an artist?", es: "¿Usas tus redes sociales para promocionarte como artista?",
        options: [o("yes", "Yes, regularly", "Sí, con frecuencia"), o("sometimes", "Sometimes", "A veces"), o("no", "No")],
      },
      { name: "linktree", type: "radio", options: YSN, en: "Do you know how to create a Linktree link?", es: "¿Conoces cómo crear un link en Linktree?" },
      { name: "presave", type: "radio", options: YSN, en: "Do you know how to create a pre-save link for your single before it comes out?", es: "¿Sabes cómo crear un enlace para \u201cpreguardar\u201d tu sencillo antes de su lanzamiento?" },
      { name: "doubts", type: "textarea", en: "Which part of releasing music raises the most questions for you, and where would you like support?", es: "¿Qué parte del proceso de lanzar música te genera más dudas y en qué te gustaría recibir apoyo?" },
    ],
  },
];

export const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

// Public "find your package" form.
export const FINDER = [
  {
    key: "you",
    bg: "#FFF6D6",
    en: "1 · About you",
    es: "1 · Sobre ti",
    fields: [
      { name: "artist_name", type: "text", required: true, en: "Artist name", es: "Nombre artístico" },
      { name: "email", type: "email", required: true, en: "Email", es: "Correo electrónico" },
    ],
  },
  {
    key: "where",
    bg: "#E3F1F8",
    en: "2 · Where you are",
    es: "2 · Dónde estás",
    fields: [
      {
        name: "stage", type: "radio", required: true, en: "Which sounds most like you?", es: "¿Cuál se parece más a ti?",
        options: [
          o("ready", "I have a song ready to release", "Tengo una canción lista para lanzar"),
          o("released", "I've released music and want to grow", "Ya lancé música y quiero crecer"),
          o("starting", "I'm just getting started", "Estoy empezando"),
        ],
      },
      {
        name: "rights", type: "radio", en: "Are your songs registered so you collect royalties?", es: "¿Tus canciones están registradas para cobrar regalías?",
        options: [o("yes", "Yes, all of them", "Sí, en todas"), o("some", "Some", "En algunas"), o("no", "No"), o("unsure", "I'm not sure", "No estoy seguro")],
      },
      {
        name: "brand", type: "radio", en: "Do you have a branding?", es: "¿Tienes un branding?",
        options: [o("yes", "Yes", "Sí"), o("some", "Some of it", "Algo de eso"), o("no", "No")],
      },
      { name: "release_soon", type: "radio", options: YN, en: "Do you have a release in the next 3 months?", es: "¿Tienes un lanzamiento en los próximos 3 meses?" },
    ],
  },
  {
    key: "help",
    bg: "#FCE4EF",
    en: "3 · What you need",
    es: "3 · Qué necesitas",
    fields: [
      {
        name: "help", type: "checkbox", en: "What would you like help with?", es: "¿En qué te gustaría recibir ayuda?",
        options: [
          o("rights", "Registrations and getting paid", "Registros y cobrar regalías"),
          o("release", "Releasing a song the right way", "Lanzar una canción correctamente"),
          o("brand", "My image and brand", "Mi imagen y marca"),
          o("promo", "Promoting a release", "Promocionar un lanzamiento"),
          o("ongoing", "Ongoing monthly support", "Acompañamiento mes a mes"),
        ],
      },
      { name: "message", type: "textarea", en: "Anything else you'd like to tell us?", es: "¿Algo más que quieras contarnos?" },
    ],
  },
];

// Which packages fit the finder answers, most important first.
export function recommendPackages(a = {}) {
  const help = Array.isArray(a.help) ? a.help : [];
  const out = [];
  if (a.rights !== "yes" || a.stage === "ready" || help.includes("rights") || help.includes("release")) out.push("Launchpad");
  if (a.brand !== "yes" || help.includes("brand")) out.push("Liftoff");
  if (a.release_soon === "yes" || help.includes("promo")) out.push("Spark");
  if (help.includes("ongoing") || out.length === 0) out.push("Orbit");
  return out;
}

// Read a submitted form into a plain answers object.
export function readAnswers(formData, sections = SECTIONS) {
  const out = {};
  for (const f of sections.flatMap((s) => s.fields)) {
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
