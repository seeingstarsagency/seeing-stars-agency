// The fixed checklist every artist is measured against.
// Edit labels here; keys must stay the same once artists exist.

export const PILLARS = [
  { key: "rights", en: "Rights · get paid for every play", es: "Derechos · cobrar por cada reproducción" },
  { key: "release", en: "Release · publish it right", es: "Lanzamiento · publicar bien" },
  { key: "brand", en: "Brand · know who you are", es: "Marca · saber quién eres" },
  { key: "campaign", en: "Campaign · reach listeners", es: "Campaña · llegar a oyentes" },
];

export const STEPS = [
  { key: "split_sheet", pillar: "rights", pkg: "Launchpad", en: "Signed split sheet", es: "Split sheet firmado" },
  { key: "pro", pillar: "rights", pkg: "Launchpad", en: "PRO membership (ASCAP / BMI / SESAC)", es: "Afiliación a una PRO (ASCAP / BMI / SESAC)" },
  { key: "mlc", pillar: "rights", pkg: "Launchpad", en: "The MLC", es: "The MLC" },
  { key: "soundexchange", pillar: "rights", pkg: "Launchpad", en: "SoundExchange", es: "SoundExchange" },
  { key: "copyright", pillar: "rights", pkg: "Launchpad", en: "U.S. Copyright registration", es: "Registro de Copyright (EE. UU.)" },
  { key: "distributor", pillar: "release", pkg: "Launchpad", en: "Distributor", es: "Distribuidora" },
  { key: "metadata", pillar: "release", pkg: "Launchpad", en: "Metadata and ISRC reviewed", es: "Metadatos e ISRC revisados" },
  { key: "spotify_artists", pillar: "release", pkg: "Launchpad", en: "Spotify for Artists", es: "Spotify for Artists" },
  { key: "apple_artists", pillar: "release", pkg: "Launchpad", en: "Apple Music for Artists", es: "Apple Music for Artists" },
  { key: "cover_art", pillar: "release", pkg: "Launchpad", en: "Single cover art ready", es: "Portada del sencillo lista" },
  { key: "bio", pillar: "brand", pkg: "Astro", en: "Artist bio", es: "Biografía" },
  { key: "photos", pillar: "brand", pkg: "Astro", en: "Professional photos", es: "Fotos profesionales" },
  { key: "epk", pillar: "brand", pkg: "Astro", en: "EPK", es: "EPK" },
  { key: "visual_identity", pillar: "brand", pkg: "Astro", en: "Visual identity", es: "Identidad visual" },
  { key: "editorial_pitch", pillar: "campaign", pkg: "Launchpad", en: "Spotify editorial pitch", es: "Pitch editorial de Spotify" },
  { key: "linktree", pillar: "campaign", pkg: "Launchpad", en: "Linktree link", es: "Link en Linktree" },
  { key: "presave", pillar: "campaign", pkg: "Launchpad", en: "Pre-save link", es: "Enlace de pre-guardado (pre-save)" },
  { key: "campaign_plan", pillar: "campaign", pkg: "Comet", en: "Release campaign plan", es: "Plan de campaña" },
];

export const PACKAGES = ["Launchpad", "Astro", "Comet", "Orbit"];

export const STATUS = {
  had: { en: "Already had it", es: "Ya lo tenías", bg: "#9A96A8" },
  done: { en: "Done together", es: "Hecho juntos", bg: "#F2C94C" },
  in_progress: { en: "In progress", es: "En proceso", bg: "#9CCBE0" },
  pending: { en: "Pending", es: "Pendiente", bg: "#FFFFFF" },
};

// Turn questionnaire answers into the starting point for each step.
// Only clear "yes, it's done" answers count as already had; the rest starts pending.
export function startingPoint(a = {}) {
  const released = a.first_release === "no" || a.other_songs === "yes";
  const had = {
    split_sheet: a.authorship === "solo",
    pro: a.pro === "registered",
    mlc: a.mlc === "registered",
    soundexchange: a.soundexchange === "registered",
    copyright: a.copyright === "registered",
    distributor: released && Boolean(a.distributor) && a.distributor !== "undecided",
    metadata: false,
    spotify_artists: released && a.artist_links === "yes",
    apple_artists: released && a.artist_links === "yes",
    cover_art: a.cover_art === "yes",
    bio: false,
    photos: false,
    epk: false,
    visual_identity: false,
    editorial_pitch: false,
    linktree: false,
    presave: false,
    campaign_plan: false,
  };
  return STEPS.map((s) => ({
    step_key: s.key,
    start_status: had[s.key] ? "had" : "missing",
    status: had[s.key] ? "had" : "pending",
  }));
}

// Numbers for the progress section.
export function summarize(rows = []) {
  const total = STEPS.length;
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
      (out[s.pkg] ||= []).push(s);
    });
  return Object.entries(out).map(([pkg, steps]) => ({ pkg, steps }));
}
