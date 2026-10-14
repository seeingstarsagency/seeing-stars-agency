// The Artist DNA steps on the Astro admin page: what feeds the DNA, from three sides
// (the artist, the agency, the creative team), and which deliverables each step unlocks.
// "auto" steps read their status from the data; the rest are marked by the agency
// and saved in artists.astro_steps.

export const SOURCES = [
  { key: "artist", name: "The artist", desc: "Their questionnaire answers and their own words", color: "#9CCBE0", bg: "#E3F1F8" },
  { key: "agency", name: "The agency", desc: "Listens, follows up, curates and adds outside data", color: "#F2C94C", bg: "#FFF6D6" },
  { key: "team", name: "The creative team", desc: "Logo, final palette, typefaces and photos", color: "#F4A6C9", bg: "#FCE4EF" },
];

export const STATUSES = {
  pend: { en: "Pending", bg: "#FFFFFF" },
  prog: { en: "In progress", bg: "#9CCBE0" },
  done: { en: "Done", bg: "#F2C94C" },
  na: { en: "Not needed", bg: "#F1EFEA" },
};

const filled = (v) => v != null && String(v).trim() !== "";
const share = (vals) => {
  const n = vals.filter(filled).length;
  return n === 0 ? "pend" : n === vals.length ? "done" : "prog";
};

export const DNA_STEPS = [
  { key: "q", src: "artist", auto: true, title: "Astro questionnaire answered", desc: "Questions 0 to 21, filled in by the artist or typed in by us.", fills: ["Story", "Values", "Audience", "Voice", "EPK facts"], href: (b) => `${b}/questionnaire`, action: "Open questionnaire",
    status: (a) => (a.astro_done_at ? "done" : "pend") },
  { key: "vn", src: "artist", title: "Hear them talk: voice note or live meeting", desc: "Their real words for the voice and the bio quote. A 2-minute voice note, or a conversation in person or on a video call.", fills: ["Voice", "Artist quote", "Story"] },
  { key: "listen", src: "agency", title: "Listen to the music and review socials", desc: "Check that the words they chose match how they sound and post.", fills: ["Personality", "Themes", "Voice"] },
  { key: "follow", src: "agency", title: "Follow-up email for vague answers", desc: "One email, 5 questions max. Mark “Not needed” if every answer was clear.", fills: ["Story", "Audience"] },
  { key: "curate", src: "agency", auto: true, title: "Curate the core", desc: "Write the essence, the 3 values, the archetypes and the 3 key messages in the Artist DNA.", fills: ["Essence", "Values", "Archetypes", "Key messages"], href: (b) => `${b}/dna`, action: "Edit DNA",
    status: (a, d) => share([d.essence, d.value1, d.value2, d.value3, d.arch1, d.msg1, d.msg2, d.msg3]) },
  { key: "data", src: "agency", auto: true, title: "Add outside data", desc: "Spotify listeners, YouTube plays, followers with the date measured, press and shows.", fills: ["EPK facts", "Bios"], href: (b) => `${b}/dna#facts`, action: "Edit facts",
    status: (a, d) => share([d.listeners || d.plays, d.measured_on, d.achievements || d.shows || d.press_quotes]) },
  { key: "logo", src: "team", title: "Logo files", desc: "Main, initials, white and black, as PNG, SVG and PDF. Upload them in the artist's Files.", fills: ["Brand Kit", "EPK"], href: (b, id) => `/admin/artists/${id}#files`, action: "Upload in Files" },
  { key: "palette", src: "team", auto: true, title: "Final palette", desc: "3 main and 3 support colors with names and HEX codes, in the Artist DNA.", fills: ["Visual direction"], href: (b) => `${b}/dna#visual`, action: "Edit palette",
    status: (a, d) => share([d.color_main1, d.color_main2, d.color_main3]) },
  { key: "fonts", src: "team", auto: true, title: "Typefaces", desc: "One for titles and one for text, in the Artist DNA.", fills: ["Visual direction"], href: (b) => `${b}/dna#visual`, action: "Edit typefaces",
    status: (a, d) => share([d.font_title, d.font_text]) },
  { key: "photos", src: "team", title: "Session photos", desc: "Edited photos, including 3 press photos for the EPK. Upload them in the artist's Files.", fills: ["Visual direction", "EPK"], href: (b, id) => `/admin/artists/${id}#files`, action: "Upload in Files" },
];

export const UNLOCKS = [
  { name: "Brand Guide", sub: "Story, values, audience", needs: ["q", "listen", "follow", "curate"], page: "brand-guide" },
  { name: "Voice Guide", sub: "3 messages, tone", needs: ["q", "vn", "curate"], page: "voice-guide" },
  { name: "Visual Direction", sub: "Palette, type, photos", needs: ["curate", "palette", "fonts", "photos"], page: "visual-direction" },
  { name: "Bios", sub: "One line, short, long", needs: ["curate", "vn", "data"] },
  { name: "EPK", sub: "One page or deck", needs: ["curate", "data", "logo", "photos"] },
];

export const isOk = (s) => s === "done" || s === "na";

// Every step with its current status.
export function dnaSteps(artist) {
  const dna = artist.artist_dna || {};
  const saved = artist.astro_steps || {};
  return DNA_STEPS.map((s) => ({
    ...s,
    state: s.auto ? s.status(artist, dna) : (saved[s.key]?.status || "pend"),
    saved: saved[s.key] || {},
  }));
}
