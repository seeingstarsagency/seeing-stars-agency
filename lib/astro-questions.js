// Astro questionnaire: what the agency needs to build the Brand Guide, Voice Guide,
// Visual Direction, bios and EPK. Same field format as lib/questions.js, so the
// shared form and answers components work with it. Section 0 is only needed when the
// artist didn't do the Launchpad questionnaire; it is prefilled from it when they did.
import { SOCIALS } from "./questions";

const o = (value, en, es = en) => ({ value, en, es });

const WORDS = [
  o("authentic", "Authentic", "Auténtico"), o("nostalgic", "Nostalgic", "Nostálgico"), o("rebel", "Rebellious", "Rebelde"),
  o("fun", "Fun", "Divertido"), o("romantic", "Romantic", "Romántico"), o("dark", "Dark", "Oscuro"),
  o("elegant", "Elegant", "Elegante"), o("close", "Down-to-earth", "Cercano"), o("mysterious", "Mysterious", "Misterioso"),
  o("energetic", "Energetic", "Enérgico"), o("dreamy", "Dreamy", "Soñador"), o("raw", "Raw", "Crudo"),
  o("playful", "Playful", "Juguetón"), o("intense", "Intense", "Intenso"), o("calm", "Calm", "Tranquilo"),
  o("empowered", "Empowered", "Empoderado"), o("ironic", "Ironic", "Irónico"), o("spiritual", "Spiritual", "Espiritual"),
];

const VALUES = [
  o("honesty", "Honesty", "Honestidad"), o("community", "Community", "Comunidad"), o("freedom", "Freedom", "Libertad"),
  o("roots", "Roots and identity", "Raíces e identidad"), o("vulnerability", "Vulnerability", "Vulnerabilidad"),
  o("joy", "Joy and fun", "Diversión"), o("effort", "Hard work", "Esfuerzo"), o("rebellion", "Rebellion", "Rebeldía"),
  o("selflove", "Self-love", "Amor propio"), o("faith", "Faith or spirituality", "Fe o espiritualidad"),
  o("causes", "Social causes", "Causas sociales"),
];

export const ASTRO_SECTIONS = [
  {
    key: "about",
    bg: "#FFF6D6",
    en: "0 · About you (skip if you did the Launchpad questionnaire)",
    es: "0 · Sobre ti (sáltalo si hiciste el cuestionario de Launchpad)",
    fields: [
      { name: "legal_name", type: "text", en: "What is your full name?", es: "¿Cuál es tu nombre completo?" },
      { name: "artist_name", type: "text", en: "What is your artist name?", es: "¿Cuál es tu nombre artístico?" },
      { name: "phone", type: "tel", en: "Phone or WhatsApp", es: "Teléfono o WhatsApp" },
      { name: "location", type: "text", en: "City, state and country", es: "Ciudad, estado y país" },
      { name: "socials", type: "links", en: "Which social networks and platforms do you have artist profiles on? Paste the links.", es: "¿En qué redes y plataformas tienes perfil de artista? Pega los enlaces.", items: SOCIALS },
      { name: "releases", type: "radio", en: "How many songs have you released?", es: "¿Cuántas canciones has lanzado?", options: [o("0", "None yet", "Ninguna"), o("1_3", "1 to 3", "1 a 3"), o("4_10", "4 to 10", "4 a 10"), o("10_plus", "More than 10", "Más de 10")] },
      { name: "next_release", type: "date", en: "Do you have an upcoming release? When?", es: "¿Tienes un lanzamiento próximo? ¿Cuándo?" },
      { name: "brand_has", type: "checkbox", en: "What do you already have for your brand?", es: "¿Qué tienes ya de tu marca?", options: [o("logo", "Logo"), o("colors", "Defined colors", "Colores definidos"), o("photos", "Professional photos", "Fotos profesionales"), o("bio", "Bio", "Biografía"), o("epk", "EPK"), o("templates", "Social media templates", "Plantillas para redes"), o("nothing", "Nothing yet", "Nada todavía")] },
      { name: "rights", type: "radio", en: "Are your songs registered so you collect royalties?", es: "¿Tus canciones están registradas para cobrar regalías?", options: [o("yes", "Yes, all of them", "Sí, todas"), o("some", "Some", "Algunas"), o("no", "No"), o("unsure", "I'm not sure", "No estoy seguro")] },
      { name: "astro_goal", type: "textarea", en: "What do you hope to get from Astro?", es: "¿Qué esperas lograr con Astro?" },
    ],
  },
  {
    key: "story",
    bg: "#FCE4EF",
    en: "1 · Your story",
    es: "1 · Tu historia",
    fields: [
      { name: "story_start", type: "textarea", en: "How did you start making music, and why do you keep doing it?", es: "¿Cómo empezaste en la música y por qué sigues haciéndola?" },
      { name: "story_life", type: "textarea", en: "What part of your life is in your music? Where you're from, your family, your language or something you lived.", es: "¿Qué parte de tu vida está en tu música? De dónde eres, tu familia, tu idioma o algo que viviste." },
    ],
  },
  {
    key: "who",
    bg: "#E3F1F8",
    en: "2 · Who you are",
    es: "2 · Quién eres",
    fields: [
      { name: "words", type: "checkbox", en: "Choose 3 words that describe you as an artist.", es: "Elige 3 palabras que te describan como artista.", options: WORDS },
      { name: "words_other", type: "text", en: "Another word that describes you (optional)", es: "Otra palabra que te describa (opcional)" },
      { name: "words_never", type: "text", en: "What words do you never want people to use to describe you?", es: "¿Qué palabras nunca quieres que usen para describirte?" },
      { name: "values", type: "checkbox", en: "Which values do you want people to see in your project? Choose 3.", es: "¿Qué valores quieres que se vean en tu proyecto? Elige 3.", options: VALUES },
    ],
  },
  {
    key: "music",
    bg: "#FFF6D6",
    en: "3 · Your music",
    es: "3 · Tu música",
    fields: [
      { name: "themes", type: "textarea", en: "What are your songs about? Which themes keep coming back?", es: "¿De qué hablan tus canciones? ¿Qué temas se repiten?" },
      { name: "genres", type: "text", en: "Which genres do you identify with?", es: "¿Con qué géneros te identificas?" },
      { name: "sing_lang", type: "radio", en: "What language do you sing in?", es: "¿En qué idioma cantas?", options: [o("es", "Spanish", "Español"), o("en", "English", "Inglés"), o("both", "Both", "Ambos"), o("other", "Another", "Otro")] },
      { name: "one_line", type: "text", en: "Describe your music in one sentence, as you would to someone who has never heard it.", es: "Describe tu música en una frase, como se la dirías a alguien que nunca te ha escuchado." },
    ],
  },
  {
    key: "refs",
    bg: "#E4EAF7",
    en: "4 · Your references",
    es: "4 · Tus referencias",
    fields: [
      { name: "inspirations", type: "textarea", en: "Name 3 artists who inspire you and what you take from each one.", es: "Nombra 3 artistas que te inspiran y qué tomas de cada uno." },
      { name: "difference", type: "textarea", en: "What do you have that they don't?", es: "¿Qué tienes tú que no tienen ellos?" },
    ],
  },
  {
    key: "audience",
    bg: "#FCE4EF",
    en: "5 · Your audience",
    es: "5 · Tu audiencia",
    fields: [
      { name: "audience", type: "textarea", en: "Who listens to your music? If you haven't released yet, who do you imagine? Rough age, where they live and what they like.", es: "¿Quién escucha tu música? Si aún no has lanzado, ¿a quién te imaginas? Edad aproximada, dónde vive y qué le gusta." },
      { name: "audience_moment", type: "text", en: "At what moment of the day do you think they listen to you?", es: "¿En qué momento del día crees que te escuchan?" },
      { name: "feeling", type: "text", en: "How do you want someone to feel when they listen to your music?", es: "¿Cómo quieres que se sienta alguien al escuchar tu música?" },
    ],
  },
  {
    key: "voice",
    bg: "#E3F1F8",
    en: "6 · Your voice",
    es: "6 · Tu voz",
    fields: [
      { name: "posts", type: "textarea", en: "Paste 3 of your posts or captions that you like and 1 you don't. What do you like or dislike about each?", es: "Pega 3 posts o captions tuyos que te gusten y 1 que no. ¿Qué te gusta o no de cada uno?" },
      { name: "fan_talk", type: "checkbox", en: "How do you talk to the people who follow you? Choose 1 or 2.", es: "¿Cómo le hablas a la gente que te sigue? Elige 1 o 2.", options: [o("friend", "Like a friend", "Como un amigo"), o("inspire", "Like someone who inspires", "Como alguien que inspira"), o("mystery", "With mystery", "Con misterio"), o("humor", "With humor", "Con humor"), o("sibling", "Like an older sibling", "Como un hermano mayor")] },
      { name: "mix_lang", type: "text", en: "Do you mix languages or use expressions from your country or city? Which ones?", es: "¿Mezclas idiomas o usas expresiones de tu país o tu ciudad? ¿Cuáles?" },
      { name: "emojis", type: "radio", en: "Do you use emojis?", es: "¿Usas emojis?", options: [o("many", "A lot", "Muchos"), o("few", "A few", "Pocos"), o("none", "None", "Ninguno")] },
      { name: "emojis_which", type: "text", en: "If you do, which ones are yours?", es: "Si usas, ¿cuáles son los tuyos?" },
      { name: "voice_note", type: "url", en: "Link to a 2-minute voice note telling us what your song is about, the way you'd tell a friend (or email it to us)", es: "Enlace a una nota de voz de 2 minutos contando de qué trata tu canción, como se lo contarías a un amigo (o mándanosla por correo)", wide: true },
    ],
  },
  {
    key: "epk",
    bg: "#FFF6D6",
    en: "7 · Your EPK",
    es: "7 · Tu EPK",
    fields: [
      { name: "achievements", type: "textarea", en: "Which achievements should we mention? Shows, playlists, awards, press, collaborations or numbers.", es: "¿Qué logros quieres que mencionemos? Shows, playlists, premios, prensa, colaboraciones o números." },
      { name: "shows", type: "textarea", en: "Your most important shows: venue, city and date.", es: "Tus shows más importantes: lugar, ciudad y fecha." },
      { name: "booking_email", type: "email", en: "Which email should people write to for booking and press?", es: "¿A qué correo deben escribirte para booking y prensa?" },
      { name: "press_quote", type: "textarea", en: "Has anyone said something about your music you'd like to use? Press, a curator or another artist: paste it and who said it.", es: "¿Alguien ha dicho algo sobre tu música que quieras usar? Prensa, un curador u otro artista: pega la frase y quién la dijo." },
    ],
  },
];

// First values for the Astro form: what's saved, or section 0 taken from the Launchpad questionnaire.
export function astroStartingValues(artist) {
  if (artist.astro_answers) return artist.astro_answers;
  const i = artist.intake_answers || {};
  const loc = [i.city, i.state, i.country].filter(Boolean).join(", ");
  return {
    legal_name: i.legal_name || artist.legal_name || "",
    artist_name: i.artist_name || artist.name || "",
    phone: i.phone || "",
    location: loc,
    socials: i.socials || [],
    next_release: i.next_release || artist.release_date || "",
  };
}
