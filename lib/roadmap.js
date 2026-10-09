// "Road to release day": suggested deadlines counted back from a song's release date.
// Each milestone is tied to steps from lib/steps.js, so it lights up when those steps are done.
// `days` = days relative to release day (negative = before). Edit freely.

export const ROADMAP = [
  {
    key: "materials", days: -42, steps: ["final_master", "lyrics", "credits"],
    en: "Final master, lyrics and credits ready", es: "Máster final, letra y créditos listos",
    tip: { en: "Everything else depends on these.", es: "Todo lo demás depende de esto." },
  },
  {
    key: "cover", days: -35, steps: ["cover_art"],
    en: "Cover art ready", es: "Portada lista",
    tip: { en: "3000 × 3000 px, no logos or links.", es: "3000 × 3000 px, sin logos ni enlaces." },
  },
  {
    key: "copyright", days: -30, steps: ["copyright"],
    en: "Register the copyright", es: "Registrar el copyright",
    tip: { en: "Lyrics and melody, at copyright.gov.", es: "Letra y melodía, en copyright.gov." },
  },
  {
    key: "distributor", days: -28, steps: ["distributor"],
    en: "Submit the song to your distributor", es: "Enviar la canción a tu distribuidora",
    tip: { en: "4 weeks ahead leaves time for the Spotify pitch.", es: "4 semanas antes deja tiempo para el pitch de Spotify." },
  },
  {
    key: "pitch", days: -21, steps: ["editorial_pitch"],
    en: "Submit your Spotify pitch", es: "Enviar tu pitch a Spotify",
    tip: { en: "Spotify needs it at least 7 days before release.", es: "Spotify lo necesita al menos 7 días antes del lanzamiento." },
  },
  {
    key: "presave", days: -14, steps: ["presave", "dsp_profiles"],
    en: "Pre-save link live and DSP profiles updated", es: "Pre-save activo y perfiles en plataformas al día",
    tip: { en: "Start sharing the pre-save everywhere.", es: "Empieza a compartir el pre-save en todas partes." },
  },
  {
    key: "linktree", days: -7, steps: ["linktree"],
    en: "Linktree ready", es: "Linktree listo",
    tip: { en: "One link in your bio for everything.", es: "Un solo link en tu bio para todo." },
  },
  {
    key: "release", days: 0, steps: [], release: true,
    en: "Release day!", es: "¡Día del lanzamiento!",
    tip: { en: "Celebrate and share it everywhere.", es: "Celébralo y compártelo en todas partes." },
  },
  {
    key: "register", days: 7, steps: ["pro_release", "mlc_release", "soundexchange_release"],
    en: "Register the release: PRO, The MLC and SoundExchange", es: "Registrar el lanzamiento: PRO, The MLC y SoundExchange",
    tip: { en: "So every play pays you.", es: "Para que cada reproducción te pague." },
  },
];

const DAY = 86400000;
const addDays = (iso, n) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * DAY).toISOString().slice(0, 10);

// Milestones with their date and status: done | in_progress | late | soon | upcoming.
export function buildRoadmap(releaseDate, rows = [], today) {
  if (!releaseDate) return [];
  const byKey = Object.fromEntries(rows.map((r) => [r.step_key, r.status]));
  return ROADMAP.map((m) => {
    const date = addDays(releaseDate, m.days);
    const left = Math.round((Date.parse(date) - Date.parse(today)) / DAY);
    const sts = m.steps.map((k) => byKey[k]).filter(Boolean);
    const done = m.release ? left < 0 : sts.length > 0 && sts.every((s) => s === "done" || s === "had");
    const started = sts.some((s) => s === "in_progress" || s === "done" || s === "had");
    let status = "upcoming";
    if (done) status = "done";
    else if (left < 0) status = "late";
    else if (started) status = "in_progress";
    else if (left <= 7) status = "soon";
    return { ...m, date, left, status };
  });
}
