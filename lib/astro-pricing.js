// Astro price calculator: the deliverables, suggested prices (edit them per artist) and the math.
// "step" links an item to the brand checklist so the first version leaves out what the artist already has.

export const ASTRO_ITEMS = [
  { key: "diag", area: "strategy", name: "Questionnaire review and diagnosis", note: "Answers, music and socials, plus one follow-up email", price: 40 },
  { key: "guide", area: "strategy", name: "Brand Guide", note: "Story, values and audience", price: 150 },
  { key: "voice", area: "strategy", name: "Voice Guide", note: "3 key messages, tone, words and post examples", price: 90 },
  { key: "visual", area: "visual", step: "visual_identity", name: "Visual Direction", note: "Moodboards, palette, typefaces and photo direction", price: 150 },
  { key: "logo", area: "visual", step: "visual_identity", name: "Wordmark logo", note: "Main, initials, white and black versions", price: 150 },
  { key: "kit", area: "visual", name: "Brand Kit files", note: "Logo files, colors and fonts ready to use", price: 50 },
  { key: "templates", area: "visual", name: "6 editable Canva templates", note: "Release, countdown, lyrics, show, thanks, highlight cover", price: 90 },
  { key: "bios", area: "presence", step: "bio", name: "Bios", note: "One line, short and long, in English and Spanish", price: 90 },
  { key: "epk", area: "presence", step: "epk", name: "EPK", note: "One page, web and PDF", price: 120 },
];

export const ASTRO_ADDONS = [
  { key: "shoot", area: "photo", step: "photos", name: "Photo session", note: "2 hours, 1 location, 2 looks, 15 edited photos", price: 300 },
  { key: "video", area: "photo", name: "15-second portrait video", note: "For the EPK and profiles", price: 120 },
  { key: "review30", area: "presence", name: "30-day check-in", note: "One email review of how the brand is being used", price: 0 },
];

export const ASTRO_ALL = [...ASTRO_ITEMS, ...ASTRO_ADDONS];
export const ASTRO_RULES = { discount: 0, rush: false, rushPct: 15, round: 5 };

const isDone = (r) => r && (r.status === "had" || r.status === "done");

// First version: every deliverable on, minus what the brand checklist already marks as done; add-ons off.
export function astroStartingQuote(rows = []) {
  const artistRows = rows.filter((r) => !r.song_id);
  const has = (step) => step && isDone(artistRows.find((r) => r.step_key === step));
  return {
    prices: Object.fromEntries(ASTRO_ALL.map((i) => [i.key, i.price])),
    on: {
      ...Object.fromEntries(ASTRO_ITEMS.map((i) => [i.key, !has(i.step)])),
      ...Object.fromEntries(ASTRO_ADDONS.map((i) => [i.key, i.key === "review30"])),
    },
    rules: { ...ASTRO_RULES },
    note: "",
  };
}

export function normalizeAstroQuote(q, fallback) {
  if (!q || typeof q !== "object" || !q.on) return fallback;
  return {
    prices: { ...fallback.prices, ...(q.prices || {}) },
    on: { ...fallback.on, ...(q.on || {}) },
    rules: { ...ASTRO_RULES, ...(q.rules || {}) },
    note: q.note || "",
  };
}

export function computeAstroQuote(q) {
  const p = (k) => Math.max(0, Number(q.prices[k]) || 0);
  const items = ASTRO_ITEMS.reduce((a, i) => a + (q.on[i.key] ? p(i.key) : 0), 0);
  const addons = ASTRO_ADDONS.reduce((a, i) => a + (q.on[i.key] ? p(i.key) : 0), 0);
  const r = q.rules;
  const discount = ((items + addons) * Math.min(100, Math.max(0, Number(r.discount) || 0))) / 100;
  let sub = items + addons - discount;
  const rush = r.rush ? (sub * (Number(r.rushPct) || 0)) / 100 : 0;
  sub += rush;
  const step = Math.max(1, Number(r.round) || 1);
  const total = Math.round(Math.max(0, sub) / step) * step;
  return { items, addons, discount, rush, sub, total, rounding: total - sub };
}

const fmt = (v) => {
  const n = Math.round(v * 100) / 100;
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: Math.abs(n % 1) > 0.001 ? 2 : 0, maximumFractionDigits: 2 });
};

// What the artist reads: grouped by area, not by price per task.
export const ASTRO_AREAS = [
  { key: "strategy", en: "Strategy · your story, values, audience and voice", es: "Estrategia · tu historia, valores, audiencia y voz" },
  { key: "visual", en: "Visual identity · logo, colors, typefaces and templates", es: "Identidad visual · logo, colores, tipografías y plantillas" },
  { key: "presence", en: "Presentation · bios and EPK", es: "Presentación · bios y EPK" },
  { key: "photo", en: "Photo and video", es: "Foto y video" },
];

export function astroQuoteText(q, c, lang = "en") {
  const L = lang === "es" ? "es" : "en";
  const T = {
    en: { head: "Astro · what's included", disc: "Discount", rush: "Rush", total: "Total", dash: "Everything is delivered in your artist dashboard, in English and Spanish." },
    es: { head: "Astro · lo que incluye", disc: "Descuento", rush: "Urgencia", total: "Total", dash: "Todo se entrega en tu panel de artista, en español e inglés." },
  }[L];
  const out = [T.head, ""];
  for (const a of ASTRO_AREAS) {
    const on = ASTRO_ALL.filter((i) => i.area === a.key && q.on[i.key]);
    if (!on.length) continue;
    out.push(`✓ ${a[L]}`);
  }
  out.push("");
  if (c.discount) out.push(`${T.disc}: -${fmt(c.discount)}`);
  if (c.rush) out.push(`${T.rush}: ${fmt(c.rush)}`);
  out.push(`${T.total}: ${fmt(c.total)}`, "", `✦ ${T.dash}`);
  return out.join("\n");
}
