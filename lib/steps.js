// The checklist every artist is measured against.
// scope "song": done for each song the agency works on (one row per song).
// scope "artist": done once for the artist (memberships, brand).
// Edit labels here; keys must stay the same once artists exist.

export const PILLARS = [
  { key: "essentials", en: "Essentials · what every release needs", es: "Lo esencial · lo que necesita cada lanzamiento" },
  { key: "rights", en: "Rights · get paid for every play", es: "Derechos · cobrar por cada reproducción" },
  { key: "release", en: "Release · publish it right", es: "Lanzamiento · publicar bien" },
  { key: "campaign", en: "Campaign · reach listeners", es: "Campaña · llegar a oyentes" },
  { key: "membership", en: "Memberships · your accounts", es: "Membresías · tus cuentas" },
  { key: "brand", en: "Brand · know who you are", es: "Marca · saber quién eres" },
];

export const SONG_PILLARS = ["essentials", "rights", "release", "campaign"];

export const STEPS = [
  // Each song
  { key: "final_master", scope: "song", pillar: "essentials", pkg: "Launchpad", en: "Final master", es: "Máster final" },
  { key: "lyrics", scope: "song", pillar: "essentials", pkg: "Launchpad", en: "Lyrics", es: "Letra" },
  { key: "credits", scope: "song", pillar: "essentials", pkg: "Launchpad", en: "Credits", es: "Créditos" },
  { key: "cover_art", scope: "song", pillar: "essentials", pkg: "Launchpad", en: "Cover art", es: "Portada" },
  { key: "copyright", scope: "song", pillar: "rights", pkg: "Launchpad", en: "U.S. Copyright registration", es: "Registro de Copyright (EE. UU.)",
    info: { en: "This copyright is for lyrics and melody ONLY. The copyright for the masters needs to be done separately under legal guidance.", es: "Este copyright es SOLO para la letra y la melodía. El copyright de los masters se hace por separado, con asesoría legal." } },
  { key: "pro_release", scope: "song", pillar: "rights", pkg: "Launchpad", en: "PRO - Release Registration", es: "PRO - Registro del lanzamiento" },
  { key: "mlc_release", scope: "song", pillar: "rights", pkg: "Launchpad", en: "The MLC - Release Registration", es: "The MLC - Registro del lanzamiento" },
  { key: "soundexchange_release", scope: "song", pillar: "rights", pkg: "Launchpad", en: "SoundExchange - Release Registration", es: "SoundExchange - Registro del lanzamiento" },
  { key: "distributor", scope: "song", pillar: "release", pkg: "Launchpad", en: "Submit song to distributor", es: "Enviar la canción a la distribuidora" },
  { key: "dsp_profiles", scope: "song", pillar: "release", pkg: "Launchpad", en: "Update DSP Profiles", es: "Actualizar perfiles en plataformas (DSP)" },
  { key: "editorial_pitch", scope: "song", pillar: "release", pkg: "Launchpad", en: "Submit Spotify Pitch", es: "Enviar el pitch a Spotify" },
  { key: "presave", scope: "song", pillar: "release", pkg: "Launchpad", en: "Create pre-save link", es: "Crear el enlace de pre-save" },
  { key: "linktree", scope: "song", pillar: "campaign", pkg: "Launchpad", en: "Linktree link", es: "Link en Linktree" },
  { key: "campaign_plan", scope: "song", pillar: "campaign", pkg: "Comet", en: "Release campaign plan", es: "Plan de campaña" },
  // Once per artist
  { key: "pro", scope: "artist", pillar: "membership", pkg: "Launchpad", en: "PRO membership (ASCAP / BMI)", es: "Afiliación a una PRO (ASCAP / BMI)" },
  { key: "mlc", scope: "artist", pillar: "membership", pkg: "Launchpad", en: "The MLC", es: "The MLC" },
  { key: "soundexchange", scope: "artist", pillar: "membership", pkg: "Launchpad", en: "SoundExchange", es: "SoundExchange" },
  { key: "distributor_account", scope: "artist", pillar: "membership", pkg: "Launchpad", en: "Distributor account", es: "Cuenta en una distribuidora" },
  { key: "bio", scope: "artist", pillar: "brand", pkg: "Astro", en: "Artist bio", es: "Biografía" },
  { key: "photos", scope: "artist", pillar: "brand", pkg: "Astro", en: "Professional photos", es: "Fotos profesionales" },
  { key: "epk", scope: "artist", pillar: "brand", pkg: "Astro", en: "EPK", es: "EPK" },
  { key: "visual_identity", scope: "artist", pillar: "brand", pkg: "Astro", en: "Visual identity", es: "Identidad visual" },
];

export const SONG_STEPS = STEPS.filter((s) => s.scope === "song");
export const ARTIST_STEPS = STEPS.filter((s) => s.scope === "artist");

export const PACKAGES = ["Launchpad", "Astro", "Comet", "Orbit"];

export const STATUS = {
  had: { en: "Already had it", es: "Ya lo tenías", bg: "#F1EFEA" },
  done: { en: "Done together", es: "Hecho juntos", bg: "#F2C94C" },
  in_progress: { en: "In progress", es: "En proceso", bg: "#9CCBE0" },
  pending: { en: "Pending", es: "Pendiente", bg: "#E3F1F8" },
};

// Turn questionnaire answers into the starting point for each step.
// Only clear "yes, it's done" answers count as already had; the rest starts pending.
// Returns { key: "had" | "missing" } (song steps refer to the questionnaire's song).
export function startingPoint(a = {}) {
  const released = a.first_release === "no" || a.other_songs === "yes";
  const mats = Array.isArray(a.materials_ready) ? a.materials_ready : [];
  const had = {
    final_master: mats.includes("master"),
    lyrics: mats.includes("lyrics"),
    credits: mats.includes("credits"),
    copyright: a.copyright === "registered",
    pro_release: a.pro === "registered",
    mlc_release: a.mlc === "registered",
    soundexchange_release: a.soundexchange === "registered",
    distributor: released && Boolean(a.distributor) && a.distributor !== "undecided",
    dsp_profiles: released && a.artist_links === "yes",
    cover_art: a.cover_art === "yes",
    pro: a.pro === "registered",
    mlc: a.mlc === "registered",
    soundexchange: a.soundexchange === "registered",
    distributor_account: released && Boolean(a.distributor) && a.distributor !== "undecided",
  };
  return Object.fromEntries(STEPS.map((s) => [s.key, had[s.key] ? "had" : "missing"]));
}

// Numbers for the progress section.
export function summarize(rows = []) {
  const total = rows.length || STEPS.length;
  const count = (st) => rows.filter((r) => r.status === st).length;
  const startHad = rows.filter((r) => r.start_status === "had").length;
  const had = count("had");
  const done = count("done");
  return { total, startHad, had, done, now: had + done, inProgress: count("in_progress"), pending: count("pending") };
}

// Which packages would solve what's still pending, outside what the artist already bought.
export function recommendations(rows = [], packages = []) {
  const byKey = Object.fromEntries(STEPS.map((s) => [s.key, s]));
  const out = {};
  rows
    .filter((r) => r.status === "pending")
    .forEach((r) => {
      const s = byKey[r.step_key];
      if (!s || packages.includes(s.pkg)) return;
      if (!(out[s.pkg] ||= []).includes(s)) out[s.pkg].push(s);
    });
  return Object.entries(out).map(([pkg, steps]) => ({ pkg, steps }));
}
