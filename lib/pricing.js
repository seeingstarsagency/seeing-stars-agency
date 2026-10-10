import { PILLARS } from "./steps";

// Launchpad price calculator: items, suggested prices and the math.
// "step" links an item to the checklist so the calculator can start from what the artist already has.

export const FIXED_ITEMS = [
  { key: "diag", area: "start", name: "Initial diagnosis", note: "Review the questionnaire and the starting point", price: 40 },
  { key: "pass", area: "start", name: "Release passport", note: "Final report with everything registered", price: 40 },
];

export const ARTIST_ITEMS = [
  { key: "pro", area: "membership", step: "pro", name: "PRO membership", note: "ASCAP or BMI, as a songwriter", price: 40 },
  { key: "mlc", area: "membership", step: "mlc", name: "The MLC account", note: "U.S. mechanical royalties", price: 30 },
  { key: "sx", area: "membership", step: "soundexchange", name: "SoundExchange account", note: "Digital royalties for the recording", price: 30 },
  { key: "dist", area: "membership", step: "distributor_account", name: "Distributor account", note: "Open or review the account", price: 20 },
  { key: "dsp", area: "release", name: "Platform profiles", note: "Spotify for Artists, Apple Music for Artists, YouTube", price: 40 },
  { key: "social", area: "campaign", name: "Social Media Cleanup", note: "Review the social accounts and clean them up", price: 40 },
  { key: "lt_setup", area: "campaign", name: "Linktree link", note: "Create or set up the artist's Linktree", price: 10 },
];

export const SONG_ITEMS = [
  { key: "cr", area: "rights", step: "copyright", name: "U.S. Copyright registration", note: "Copyright Office", price: 25 },
  { key: "pro_s", area: "rights", step: "pro_release", name: "Register the work with the PRO", note: "Title, writers and splits", price: 20 },
  { key: "mlc_s", area: "rights", step: "mlc_release", name: "Register with The MLC", note: "", price: 20 },
  { key: "sx_s", area: "rights", step: "soundexchange_release", name: "Register with SoundExchange", note: "The recording", price: 10 },
  { key: "up", area: "release", step: "distributor", name: "Upload to the distributor", note: "Metadata and ISRC reviewed", price: 30 },
  { key: "art", area: "essentials", name: "Cover art check", note: "Size and requirements", price: 10 },
  { key: "pitch", area: "release", step: "editorial_pitch", name: "Spotify editorial pitch", note: "At least 7 days before release", price: 25 },
  { key: "pre", area: "release", step: "presave", name: "Pre-save link", note: "", price: 10 },
  { key: "lt", area: "campaign", step: "linktree", name: "Update Linktree link", note: "Add this song to the Linktree", price: 5 },
];

export const ALL_ITEMS = [...FIXED_ITEMS, ...ARTIST_ITEMS, ...SONG_ITEMS];

export const DEFAULT_RULES = { d2: 10, d5: 20, rush: false, rushPct: 15, minFee: 150, round: 5 };

const isDone = (r) => r && (r.status === "had" || r.status === "done");

// First version of a quote for an artist, built from their songs and checklist.
export function startingQuote(projects = [], rows = []) {
  const prices = Object.fromEntries(ALL_ITEMS.map((i) => [i.key, i.price]));
  const artistRows = rows.filter((r) => !r.song_id);
  const artist = Object.fromEntries(
    ARTIST_ITEMS.map((i) => [i.key, !(i.step && isDone(artistRows.find((r) => r.step_key === i.step)))])
  );
  const list = projects.length ? projects : [{ id: null, title: "Song 1" }];
  const songs = list.map((p) => ({
    title: p.title,
    items: Object.fromEntries(
      SONG_ITEMS.map((i) => [i.key, !(i.step && p.id && isDone(rows.find((r) => r.song_id === p.id && r.step_key === i.step)))])
    ),
  }));
  return { prices, artist, songs, rules: { ...DEFAULT_RULES }, note: "" };
}

// Fill gaps in a saved quote (e.g. items added after it was saved).
export function normalizeQuote(q, fallback) {
  if (!q || !Array.isArray(q.songs)) return fallback;
  return {
    prices: { ...fallback.prices, ...(q.prices || {}) },
    artist: { ...Object.fromEntries(ARTIST_ITEMS.map((i) => [i.key, true])), ...(q.artist || {}) },
    songs: q.songs.length
      ? q.songs.map((s, j) => ({ title: s.title || `Song ${j + 1}`, items: { ...Object.fromEntries(SONG_ITEMS.map((i) => [i.key, true])), ...(s.items || {}) } }))
      : fallback.songs,
    rules: { ...DEFAULT_RULES, ...(q.rules || {}) },
    note: q.note || "",
  };
}

export function computeQuote(q) {
  const p = (k) => Math.max(0, Number(q.prices[k]) || 0);
  const r = q.rules;
  const fixed = FIXED_ITEMS.reduce((a, i) => a + p(i.key), 0);
  const artist = ARTIST_ITEMS.reduce((a, i) => a + (q.artist[i.key] ? p(i.key) : 0), 0);
  const disc = (j) => (j >= 4 ? r.d5 : j >= 1 ? r.d2 : 0) / 100;
  let discount = 0;
  const songDiscounts = [];
  const songPct = [];
  const perSong = q.songs.map((s, j) => {
    const v = SONG_ITEMS.reduce((a, i) => a + (s.items[i.key] ? p(i.key) : 0), 0);
    songDiscounts.push(v * disc(j));
    songPct.push(Math.round(disc(j) * 100));
    discount += v * disc(j);
    return v;
  });
  const songs = perSong.reduce((a, v) => a + v, 0);
  let sub = fixed + artist + songs - discount;
  const rush = r.rush ? (sub * (Number(r.rushPct) || 0)) / 100 : 0;
  sub += rush;
  const min = Math.max(0, Number(r.minFee) || 0);
  const step = Math.max(1, Number(r.round) || 1);
  const minApplied = sub < min;
  const total = Math.round(Math.max(sub, min) / step) * step;
  const fullSong = SONG_ITEMS.reduce((a, i) => a + p(i.key), 0);
  const full = fixed + ARTIST_ITEMS.reduce((a, i) => a + p(i.key), 0) + q.songs.reduce((a, _, j) => a + fullSong * (1 - disc(j)), 0);
  const rounding = total - Math.max(sub, min);
  return { fixed, artist, perSong, songDiscounts, songPct, discount, rush, min, minApplied, sub, total, rounding, full: Math.round(full / step) * step };
}

// What the artist reads: the checklist areas each part covers, not the individual tasks.
const pillar = (k) => PILLARS.find((p) => p.key === k);
export const QUOTE_AREAS = [
  { key: "start", en: "Diagnosis and passport · your starting point and final report", es: "Diagnóstico y pasaporte · tu punto de partida y tu informe final" },
  ...["membership", "essentials", "rights", "release", "campaign"].map((k) => ({ key: k, en: pillar(k).en, es: pillar(k).es })),
];

const areasOf = (items) => QUOTE_AREAS.filter((a) => items.some((i) => i.area === a.key));

export function quoteGroups(q, c) {
  const groups = [
    { title: { en: "Always included", es: "Siempre incluido" }, amount: c.fixed, areas: areasOf(FIXED_ITEMS) },
  ];
  const artistOn = ARTIST_ITEMS.filter((i) => q.artist[i.key]);
  if (artistOn.length) groups.push({ title: { en: "Once per artist", es: "Una vez por artista" }, amount: c.artist, areas: areasOf(artistOn) });
  q.songs.forEach((s, j) => {
    const on = SONG_ITEMS.filter((i) => s.items[i.key]);
    const title = s.title || `Song ${j + 1}`;
    groups.push({ title: { en: title, es: title }, amount: c.perSong[j] - c.songDiscounts[j], discount: c.songDiscounts[j], discountPct: c.songPct[j], areas: areasOf(on) });
  });
  return groups;
}

const fmt = (v) => {
  const n = Math.round(v * 100) / 100;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: Math.abs(n % 1) > 0.001 ? 2 : 0, maximumFractionDigits: 2 });
};

// Plain text of the quote, in the artist's language, to paste into an email.
export function quoteText(q, c, lang = "en") {
  const L = lang === "es" ? "es" : "en";
  const T = {
    en: { head: "Launchpad · what's included", disc: "includes a {p}% discount", nothing: "Nothing to do on this song", rush: "Rush (release in less than 21 days)", min: "Adjustment to the minimum price", round: "Rounding", total: "Total", dash: "Includes access to your own artist dashboard, where you can manage all your information in one place.", fees: "Third-party fees (Copyright Office, distributor) are paid directly by the artist." },
    es: { head: "Launchpad · lo que incluye", disc: "incluye un descuento del {p}%", nothing: "Nada que hacer en esta canción", rush: "Urgencia (lanzamiento en menos de 21 días)", min: "Ajuste al precio mínimo", round: "Redondeo", total: "Total", dash: "Incluye acceso a tu propio panel de artista, donde puedes manejar toda tu información en un solo lugar.", fees: "Las tarifas de terceros (Copyright Office, distribuidora) las paga el artista directamente." },
  }[L];
  const out = [T.head, ""];
  for (const g of quoteGroups(q, c)) {
    out.push(`${g.title[L]}: ${fmt(g.amount)}${g.discount ? ` (${T.disc.replace("{p}", g.discountPct)})` : ""}`);
    if (g.areas.length) g.areas.forEach((a) => out.push(`  ✓ ${a[L]}`));
    else out.push(`  ${T.nothing}`);
    out.push("");
  }
  if (c.rush) out.push(`${T.rush}: ${fmt(c.rush)}`);
  if (c.minApplied) out.push(`${T.min}: ${fmt(c.min - c.sub)}`);
  out.push(`${T.total}: ${fmt(c.total)}`, "", `✦ ${T.dash}`, "", T.fees);
  return out.join("\n");
}
