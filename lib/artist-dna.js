// Artist DNA: the agency's internal form. It is the single source the Brand Guide,
// Voice Guide, Visual Direction, bios and EPK are built from. The agency fills it in
// and curates it; "from" lists the Astro questionnaire answers shown next to each field
// as reference ("agency" / "team" mark what comes from the agency or the creative team).
import { ASTRO_SECTIONS } from "./astro-questions";

const t = (name, en, from = [], extra = {}) => ({ name, type: "text", en, from, ...extra });
const ta = (name, en, from = [], extra = {}) => ({ name, type: "textarea", en, from, ...extra });

export const DNA_SECTIONS = [
  {
    key: "story", bg: "#FCE4EF", en: "1 · Story", feeds: "Brand Guide · bios · EPK",
    fields: [
      t("essence", "Essence: one sentence, 20 words max (who, what, for whom)", ["one_line", "genres", "audience", "feeling"], { wide: true }),
      ta("story_before", "Story · before (where they come from, one concrete detail)", ["story_life", "location"]),
      ta("story_moment", "Story · the moment they started", ["story_start"]),
      ta("story_today", "Story · today (what they sing about and why)", ["themes", "story_start"]),
      ta("difference", "What sets them apart: “Where others…, [artist]…”", ["difference", "inspirations"]),
      t("genre_lang", "Genre and language", ["genres", "sing_lang"]),
      t("references", "Sounds close to (3 references)", ["inspirations"]),
      t("themes", "Sings about (3 or 4 themes)", ["themes"]),
      t("signature", "Signature line (e.g. “things i wish i said…”)", ["one_line", "posts"], { wide: true }),
    ],
  },
  {
    key: "values", bg: "#E3F1F8", en: "2 · Values and personality", feeds: "Brand Guide",
    fields: [
      t("arch1", "Archetype 1 · name and one line", ["words", "story_start"], { wide: true }),
      t("arch2", "Archetype 2 · name and one line", ["words"], { wide: true }),
      t("arch3", "Archetype 3 · name and one line", ["words"], { wide: true }),
      t("value1", "Value 1 · name | yes: … | no: …", ["values", "story_life"], { wide: true }),
      t("value2", "Value 2 · name | yes: … | no: …", ["values"], { wide: true }),
      t("value3", "Value 3 · name | yes: … | no: …", ["values"], { wide: true }),
      t("traits", "Personality · 3 traits", ["words", "words_other"]),
      t("is", "They are… (e.g. nostalgic without being sad)", ["words"]),
      t("isnt", "They are not…", ["words_never"]),
    ],
  },
  {
    key: "audience", bg: "#FFF6D6", en: "3 · Audience", feeds: "Brand Guide · bios",
    fields: [
      t("aud1_name", "Main listener · nickname", ["audience"]),
      t("aud1_who", "Main listener · who they are", ["audience"]),
      t("aud1_moment", "Main listener · their moment", ["audience_moment"]),
      t("aud1_listens", "Main listener · what they listen to", ["inspirations"]),
      t("aud1_feels", "Main listener · how the artist makes them feel", ["feeling"]),
      t("aud2_name", "Second listener · nickname", ["audience"]),
      t("aud2_who", "Second listener · who they are", ["audience"]),
      t("aud2_moment", "Second listener · their moment", ["audience_moment"]),
      t("aud2_listens", "Second listener · what they listen to", []),
      t("aud2_feels", "Second listener · how the artist makes them feel", ["feeling"]),
      ta("why_connect", "Why they connect with the artist", ["feeling", "audience"]),
      t("where", "Where they live (platforms)", ["socials"]),
    ],
  },
  {
    key: "voice", bg: "#E4EAF7", en: "4 · Voice", feeds: "Voice Guide · bios · captions",
    fields: [
      t("voice_line", "Their voice in one sentence (“X sounds like…”)", ["voice_note", "posts"], { wide: true }),
      t("msg1", "Key message 1", ["one_line", "difference"], { wide: true }),
      t("msg2", "Key message 2", ["values"], { wide: true }),
      t("msg3", "Key message 3", ["feeling", "voice_note"], { wide: true }),
      { name: "tone_casual", type: "range", en: "Tone · formal → casual", from: ["fan_talk", "posts"] },
      { name: "tone_playful", type: "range", en: "Tone · serious → playful", from: ["fan_talk"] },
      { name: "tone_open", type: "range", en: "Tone · reserved → open", from: ["fan_talk"] },
      { name: "tone_direct", type: "range", en: "Tone · poetic → direct", from: ["posts"] },
      t("sounds_like", "Sounds like", ["voice_note"]),
      t("not_like", "Doesn't sound like", ["words_never"]),
      ta("metaphors", "Their metaphors (one per line: metaphor | use it for)", ["themes", "posts"]),
      t("device", "Their device (e.g. posts open with “dear you,”)", ["posts"], { wide: true }),
      t("words_yes", "Words they use", ["mix_lang", "posts"]),
      t("words_no", "Words they don't use", ["words_never"]),
      t("rule_lang", "Rule · language", ["sing_lang", "mix_lang"]),
      t("rule_case", "Rule · capitals", ["posts"]),
      t("rule_emoji", "Rule · emojis", ["emojis", "emojis_which"]),
      t("rule_punct", "Rule · punctuation", ["posts"]),
      t("rule_tags", "Rule · hashtags", ["posts"]),
    ],
  },
  {
    key: "visual", bg: "#FCE4EF", en: "5 · Visual direction", feeds: "Visual Direction · Brand Kit · EPK",
    fields: [
      t("color_main1", "Main color 1 · name and HEX (e.g. Midnight Ink #0A2130)", ["team"]),
      t("color_main2", "Main color 2 · name and HEX", ["team"]),
      t("color_main3", "Main color 3 · name and HEX", ["team"]),
      t("color_sup1", "Support color 1 · name and HEX", ["team"]),
      t("color_sup2", "Support color 2 · name and HEX", ["team"]),
      t("color_sup3", "Support color 3 · name and HEX", ["team"]),
      t("font_title", "Typeface for titles", ["team"]),
      t("font_text", "Typeface for text", ["team"]),
      ta("resources", "Graphic elements (one per line: element | use it for)", ["team", "brand_has"]),
      ta("moodboards", "Moodboards (one per line: name | what's in it)", ["themes"]),
      t("photo_light", "Photo · light", ["audience_moment"]),
      t("photo_place", "Photo · places", ["story_life", "themes"]),
      t("photo_pose", "Photo · poses", ["words"]),
      t("photo_wardrobe", "Photo · wardrobe", []),
      t("photo_frame", "Photo · framing", []),
      { name: "style", type: "select", en: "Template style", from: [], options: [["diario", "Diario"], ["editorial", "Editorial"], ["nocturno", "Nocturno"]] },
    ],
  },
  {
    key: "facts", bg: "#FFF6D6", en: "6 · Facts for bios and EPK", feeds: "Bios · EPK",
    fields: [
      t("listeners", "Spotify listeners", ["agency"]),
      t("plays", "YouTube plays", ["agency"]),
      t("followers_ig", "Instagram followers", ["agency"]),
      t("followers_tt", "TikTok followers", ["agency"]),
      { name: "measured_on", type: "date", en: "Numbers measured on", from: ["agency"] },
      ta("achievements", "Achievements to mention", ["achievements"]),
      ta("shows", "Key shows (venue, city, date)", ["shows"]),
      ta("press_quotes", "Press quotes (one per line: quote | outlet)", ["press_quote"]),
      t("booking_email", "Booking and press email", ["booking_email"]),
      t("whats_next", "What's next (release or shows)", ["next_release"]),
      ta("artist_quote", "A quote in the artist's own words (from the voice note)", ["voice_note", "story_start"]),
    ],
  },
];

export const DNA_FIELDS = DNA_SECTIONS.flatMap((s) => s.fields);

// The artist's answer to a questionnaire field, as readable text.
const ASTRO_FIELDS = ASTRO_SECTIONS.flatMap((s) => s.fields);
export function astroAnswerText(name, answers = {}) {
  const f = ASTRO_FIELDS.find((x) => x.name === name);
  const v = answers?.[name];
  if (!f || v == null || v === "" || (Array.isArray(v) && !v.length)) return null;
  const label = (val) => f.options?.find((o) => o.value === val)?.en || val;
  let text;
  if (f.type === "links") text = v.map((x) => `${x.name}${x.url ? `: ${x.url}` : ""}`).join(" · ");
  else if (Array.isArray(v)) text = v.map(label).join(", ");
  else text = f.options ? label(v) : String(v);
  return { q: f.en, text };
}

export function readDna(formData) {
  const out = {};
  for (const f of DNA_FIELDS) {
    const v = String(formData.get(f.name) ?? "").trim();
    out[f.name] = f.type === "range" ? Math.max(0, Math.min(100, Number(v) || 50)) : v.slice(0, f.type === "textarea" ? 3000 : 400);
  }
  return out;
}
