// Launchpad price calculator: items, suggested prices and the math.
// "step" links an item to the checklist so the calculator can start from what the artist already has.

export const FIXED_ITEMS = [
  { key: "diag", name: "Initial diagnosis", note: "Review the questionnaire and the starting point", price: 40 },
  { key: "pass", name: "Release passport", note: "Final report with everything registered", price: 40 },
];

export const ARTIST_ITEMS = [
  { key: "pro", step: "pro", name: "PRO membership", note: "ASCAP or BMI, as a songwriter", price: 40 },
  { key: "mlc", step: "mlc", name: "The MLC account", note: "U.S. mechanical royalties", price: 30 },
  { key: "sx", step: "soundexchange", name: "SoundExchange account", note: "Digital royalties for the recording", price: 30 },
  { key: "dist", step: "distributor_account", name: "Distributor account", note: "Open or review the account", price: 20 },
  { key: "dsp", name: "Platform profiles", note: "Spotify for Artists, Apple Music for Artists, YouTube", price: 40 },
  { key: "social", name: "Social Media Cleanup", note: "Review the social accounts and clean them up", price: 40 },
  { key: "lt_setup", name: "Linktree link", note: "Create or set up the artist's Linktree", price: 10 },
];

export const SONG_ITEMS = [
  { key: "cr", step: "copyright", name: "U.S. Copyright registration", note: "Copyright Office", price: 25 },
  { key: "pro_s", step: "pro_release", name: "Register the work with the PRO", note: "Title, writers and splits", price: 20 },
  { key: "mlc_s", step: "mlc_release", name: "Register with The MLC", note: "", price: 20 },
  { key: "sx_s", step: "soundexchange_release", name: "Register with SoundExchange", note: "The recording", price: 10 },
  { key: "up", step: "distributor", name: "Upload to the distributor", note: "Metadata and ISRC reviewed", price: 30 },
  { key: "art", name: "Cover art check", note: "Size and requirements", price: 10 },
  { key: "pitch", step: "editorial_pitch", name: "Spotify editorial pitch", note: "At least 7 days before release", price: 25 },
  { key: "pre", step: "presave", name: "Pre-save link", note: "", price: 10 },
  { key: "lt", step: "linktree", name: "Update Linktree link", note: "Add this song to the Linktree", price: 5 },
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
  const perSong = q.songs.map((s, j) => {
    const v = SONG_ITEMS.reduce((a, i) => a + (s.items[i.key] ? p(i.key) : 0), 0);
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
  return { fixed, artist, perSong, discount, rush, min, minApplied, sub, total, full: Math.round(full / step) * step };
}
