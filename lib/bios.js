// Bios live inside the Artist DNA (bio_line_en, bio_short_es, …). The drafts below
// assemble the recipe from the DNA so the agency starts from something, then rewrites it.

export const BIO_KINDS = [
  { key: "line", en: "One-line bio", use: "Instagram, TikTok, email signature", limit: { chars: 150 } },
  { key: "short", en: "Short bio", use: "Spotify, Apple Music, curators, flyers", limit: { words: [60, 90] } },
  { key: "long", en: "Long bio", use: "Press, website, EPK", limit: { words: [200, 250] } },
];
export const BIO_LANGS = [["en", "English"], ["es", "Español"]];
export const BIO_KEYS = BIO_KINDS.flatMap((k) => BIO_LANGS.map(([l]) => `bio_${k.key}_${l}`));

const join = (parts, sep = " ") => parts.map((x) => String(x || "").trim()).filter(Boolean).join(sep);
const firstLine = (s) => String(s || "").split("\n").map((x) => x.trim()).find(Boolean) || "";

// Raw drafts in the language the DNA was written in. They follow the bio recipe:
// line = essence (+ signature); short = essence, origin, difference, what's next;
// long = the moment, the music, the present, a closing quote.
export function bioDrafts(dna = {}, steps = {}) {
  const quote = firstLine(steps?.vn?.quotes) || dna.artist_quote || "";
  const line = join([dna.essence, dna.signature], " · ").slice(0, 150);
  const short = join([dna.essence, dna.story_before, dna.difference, dna.whats_next]);
  const long = [
    join([dna.story_before, dna.story_moment]),
    join([dna.story_today, dna.genre_lang && `${dna.genre_lang}.`, dna.references && `Sounds close to ${dna.references}.`, dna.difference]),
    join([dna.whats_next, dna.achievements, dna.shows]),
    quote,
  ].filter(Boolean).join("\n\n");
  return { line, short, long };
}

export const countWords = (s) => String(s || "").trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

// The bio to show in a given language, falling back to the other language, then the essence.
export function pickBio(dna = {}, kind, lang) {
  const other = lang === "es" ? "en" : "es";
  return dna[`bio_${kind}_${lang}`] || dna[`bio_${kind}_${other}`] || (kind === "line" || kind === "short" ? dna.essence || "" : "");
}
